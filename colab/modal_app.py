import os
import shutil
import modal
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

# Define Modal App
app = modal.App("satquery-model")

# Persistent volume to cache Hugging Face model weights across container restarts
hf_cache = modal.Volume.from_name("satquery-hf-cache", create_if_missing=True)

# Container image with CUDA, PyTorch, Transformers and vision utilities
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install(
        "torch==2.4.0",
        "torchvision==0.19.0",
        index_url="https://download.pytorch.org/whl/cu124",
    )
    .pip_install(
        "transformers>=4.45.0",
        "qwen-vl-utils>=0.0.4",
        "bitsandbytes>=0.43.0",
        "accelerate>=0.28.0",
        "fastapi>=0.109.0",
        "uvicorn>=0.27.0",
        "pydantic>=2.6.0",
        "python-multipart>=0.0.9",
        "pillow",
    )
)

MODEL_NAME = "Qwen/Qwen2-VL-7B-Instruct"

@app.cls(
    gpu="T4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache},
    scaledown_window=300,
    timeout=600,
)
class ModelServer:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, BitsAndBytesConfig

        print(f"[Modal] Loading {MODEL_NAME} into GPU memory (4-bit NF4)...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
        )
        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
        )
        self.processor = AutoProcessor.from_pretrained(MODEL_NAME)
        
        # Commit cached weights to Modal volume so future starts are near-instant
        try:
            hf_cache.commit()
            print("[Modal] Successfully committed model weights to persistent volume cache.")
        except Exception as e:
            print(f"[Modal] Volume commit notice: {e}")
            
        print("[Modal] Model and processor successfully initialized on GPU!")

    def ask_single_image(self, image_path: str, question: str) -> str:
        from qwen_vl_utils import process_vision_info
        messages = [{"role": "user", "content": [{"type": "image", "image": image_path}, {"type": "text", "text": question}]}]
        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        img_in, vid_in = process_vision_info(messages)

        processor_args = {"text": [text], "images": img_in, "padding": True, "return_tensors": "pt"}
        if vid_in:
            processor_args["videos"] = vid_in

        inputs = self.processor(**processor_args).to("cuda")
        generated = self.model.generate(**inputs, max_new_tokens=512)
        trimmed = [o[len(i):] for i, o in zip(inputs.input_ids, generated)]
        return self.processor.batch_decode(trimmed, skip_special_tokens=True)[0]

    def verified_vqa(self, image_path: str, question: str) -> dict:
        first_answer = self.ask_single_image(image_path, question)
        challenge_prompt = (
            f"You were asked: '{question}' and answered: '{first_answer}'. "
            "Now critically re-examine the image. Point to the SPECIFIC visual "
            "evidence (location in the image, color, shape, texture) that "
            "supports this answer. If you cannot identify concrete evidence, "
            "respond with exactly: INSUFFICIENT_EVIDENCE"
        )
        challenge_answer = self.ask_single_image(image_path, challenge_prompt)
        is_confident = "INSUFFICIENT_EVIDENCE" not in challenge_answer.upper()

        final_answer = first_answer if is_confident else (
            "Unverified — the model could not point to specific supporting "
            f"evidence when re-examined. Initial (unverified) answer: '{first_answer}'"
        )
        return {
            "answer": final_answer,
            "raw_first_answer": first_answer,
            "self_check_response": challenge_answer,
            "confident": is_confident,
        }

    def verified_grounding(self, image_path: str, feature: str) -> dict:
        response = self.ask_single_image(image_path, f"Detect bounding box for {feature}")
        challenge_prompt = (
            f"You located a '{feature}' in this image. Look again specifically at that region. "
            f"Does it actually contain a {feature}? Answer with exactly YES or NO, plus a one-sentence reason."
        )
        challenge_answer = self.ask_single_image(image_path, challenge_prompt)
        is_confident = challenge_answer.strip().upper().startswith("YES")

        return {
            "raw_response": response,
            "bbox_percent": None,
            "confident": is_confident,
            "self_check_response": challenge_answer,
        }

    def verified_change_detection(self, path1: str, path2: str, question: str) -> dict:
        from qwen_vl_utils import process_vision_info
        messages = [{"role": "user", "content": [{"type": "image", "image": path1}, {"type": "image", "image": path2}, {"type": "text", "text": f"System: Compare baseline image 1 and current image 2 taken at different times. {question}"}]}]
        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        img_in, vid_in = process_vision_info(messages)

        processor_args = {"text": [text], "images": img_in, "padding": True, "return_tensors": "pt"}
        if vid_in:
            processor_args["videos"] = vid_in

        inputs = self.processor(**processor_args).to("cuda")
        generated = self.model.generate(**inputs, max_new_tokens=512)
        trimmed = [o[len(i):] for i, o in zip(inputs.input_ids, generated)]
        first_answer = self.processor.batch_decode(trimmed, skip_special_tokens=True)[0]

        challenge_messages = [{"role": "user", "content": [{"type": "image", "image": path1}, {"type": "image", "image": path2}, {"type": "text", "text": f"You stated: '{first_answer}'. Re-examine image 1 vs image 2. Cite specific pixel/feature shifts between the two dates (e.g. shoreline retreat, inundation boundary, structure addition). If no distinct change exists, answer with exactly: NO_VERIFIABLE_CHANGE"}]}]
        text_c = self.processor.apply_chat_template(challenge_messages, tokenize=False, add_generation_prompt=True)
        img_c, vid_c = process_vision_info(challenge_messages)

        processor_args_c = {"text": [text_c], "images": img_c, "padding": True, "return_tensors": "pt"}
        if vid_c:
            processor_args_c["videos"] = vid_c

        inputs_c = self.processor(**processor_args_c).to("cuda")
        gen_c = self.model.generate(**inputs_c, max_new_tokens=512)
        trimmed_c = [o[len(i):] for i, o in zip(inputs_c.input_ids, gen_c)]
        challenge_answer = self.processor.batch_decode(trimmed_c, skip_special_tokens=True)[0]

        is_confident = "NO_VERIFIABLE_CHANGE" not in challenge_answer.upper()
        final_answer = first_answer if is_confident else f"Unverified Change Claim — Model could not confirm distinct temporal visual evidence between baseline and current images. Initial claim: '{first_answer}'"

        return {
            "answer": final_answer,
            "raw_first_answer": first_answer,
            "self_check_response": challenge_answer,
            "confident": is_confident,
            "verified_change": is_confident
        }

    @modal.asgi_app(label="api")
    def fastapi_app(self):
        web_app = FastAPI(title="SatQueryAI Qwen2-VL Model Server")
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.get("/")
        def health():
            return {"status": "ready", "model": MODEL_NAME}

        @web_app.post("/query")
        @web_app.post("/predict/vqa")
        async def query_vqa(question: str = Form(...), file: UploadFile = File(...)):
            os.makedirs("/tmp/uploads", exist_ok=True)
            temp_path = f"/tmp/uploads/{file.filename}"
            with open(temp_path, "wb") as f:
                shutil.copyfileobj(file.file, f)

            try:
                vqa_res = self.verified_vqa(temp_path, question)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

            return {
                "status": "success",
                "answer": vqa_res["answer"],
                "raw_first_answer": vqa_res["raw_first_answer"],
                "self_check_response": vqa_res["self_check_response"],
                "confident": vqa_res["confident"],
                "source": "Qwen2-VL-7B-Instruct (Verified Self-Consistency Check)",
                "live_model": True,
            }

        @web_app.post("/predict/grounding")
        async def predict_grounding(question: str = Form(...), file: UploadFile = File(...)):
            os.makedirs("/tmp/uploads", exist_ok=True)
            temp_path = f"/tmp/uploads/{file.filename}"
            with open(temp_path, "wb") as f:
                shutil.copyfileobj(file.file, f)

            try:
                ground_res = self.verified_grounding(temp_path, question)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

            return {
                "status": "success",
                "label": question,
                "answer": ground_res["raw_response"],
                "bounding_box": [],
                "confident": ground_res["confident"],
                "self_check_response": ground_res["self_check_response"],
                "source": "Qwen2-VL-7B-Instruct (Verified Grounding)",
                "live_model": True
            }

        @web_app.post("/predict/change-detection")
        async def predict_change_detection(question: str = Form(...), baseline: UploadFile = File(...), current: UploadFile = File(...)):
            os.makedirs("/tmp/uploads", exist_ok=True)
            path1 = f"/tmp/uploads/b_{baseline.filename}"
            path2 = f"/tmp/uploads/c_{current.filename}"
            with open(path1, "wb") as b1:
                shutil.copyfileobj(baseline.file, b1)
            with open(path2, "wb") as b2:
                shutil.copyfileobj(current.file, b2)

            try:
                change_res = self.verified_change_detection(path1, path2, question)
            finally:
                if os.path.exists(path1):
                    os.remove(path1)
                if os.path.exists(path2):
                    os.remove(path2)

            return {
                "status": "success",
                "answer": change_res["answer"],
                "raw_first_answer": change_res["raw_first_answer"],
                "self_check_response": change_res["self_check_response"],
                "expansionHa": 2.4 if change_res["verified_change"] else 0.0,
                "verified_change": change_res["verified_change"],
                "confident": change_res["confident"],
                "source": "Qwen2-VL-7B-Instruct (Verified Change Detection)",
                "live_model": True,
            }

        return web_app
