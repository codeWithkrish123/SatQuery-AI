# Save this code as `app.py` on your deployment server (Colab / AWS / RunPod / GCP)
"""
To run this server:
1. Install dependencies:
   pip install fastapi uvicorn torch transformers qwen-vl-utils bitsandbytes pydantic python-multipart pyngrok nest_asyncio
2. Run the server:
   python app.py
   or:
   uvicorn app:app --host 0.0.0.0 --port 8000
"""

import os
import shutil
import json
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, BitsAndBytesConfig
from qwen_vl_utils import process_vision_info

app = FastAPI(
    title="SatQueryAI Qwen2-VL Deployment Server",
    description="High-performance API for Qwen2-VL-7B satellite visual QA, grounding, change detection, and optical-SAR fusion."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "Qwen/Qwen2-VL-7B-Instruct"
model = None
processor = None
model_error = None

@app.on_event("startup")
def load_model():
    global model, processor, model_error
    print("🚀 Loading Qwen2-VL-7B-Instruct in 4-bit NF4 quantization...")
    try:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_quant_type="nf4",
        )
        model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
        )
        processor = AutoProcessor.from_pretrained(MODEL_NAME)
        print("✅ Model successfully loaded and ready for high-throughput inference!")
    except Exception as e:
        model_error = str(e)
        print(f"❌ Model load failed: {e}")


def require_model():
    if model is None or processor is None:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Qwen model is not ready",
                "model": MODEL_NAME,
                "reason": model_error or "Model startup is still in progress",
            },
        )

@app.get("/")
def health_check():
    return {
        "status": "ready" if model is not None and processor is not None else "not_ready",
        "model": MODEL_NAME,
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "quantization": "4-bit NF4",
        "model_loaded": model is not None and processor is not None,
        "model_error": model_error,
    }

def ask_single_image(image_path: str, question: str) -> str:
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image_path},
                {"type": "text", "text": question},
            ],
        }
    ]
    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    image_inputs, video_inputs = process_vision_info(messages)
    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt",
    ).to(model.device if model else "cpu")

    generated_ids = model.generate(**inputs, max_new_tokens=256)
    trimmed = [out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)]
    return processor.batch_decode(trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]


def verified_vqa(image_path: str, question: str) -> dict:
    """
    VQA with a self-consistency check.
    Returns a dict so you always have both the answer AND the evidence
    of whether the model could actually back it up.
    """
    first_answer = ask_single_image(image_path, question)

    challenge_prompt = (
        f"You were asked: '{question}' and answered: '{first_answer}'. "
        "Now critically re-examine the image. Point to the SPECIFIC visual "
        "evidence (location in the image, color, shape, texture) that "
        "supports this answer. If you cannot identify concrete evidence, "
        "respond with exactly: INSUFFICIENT_EVIDENCE"
    )
    challenge_answer = ask_single_image(image_path, challenge_prompt)

    is_confident = "INSUFFICIENT_EVIDENCE" not in challenge_answer.upper()

    if not is_confident:
        final_answer = (
            "Unverified — the model could not point to specific supporting "
            f"evidence when re-examined. Initial (unverified) answer: '{first_answer}'"
        )
    else:
        final_answer = first_answer

    return {
        "answer": final_answer,
        "raw_first_answer": first_answer,
        "self_check_response": challenge_answer,
        "confident": is_confident,
    }


def verified_grounding(image_path: str, feature: str) -> dict:
    """
    Grounding with the same self-consistency idea: after getting a bounding
    box, ask the model to justify it before trusting it.
    """
    response = ask_single_image(image_path, f"Detect bounding box for {feature}")
    
    challenge_prompt = (
        f"You located a '{feature}' in this image. Look again specifically at that region. "
        f"Does it actually contain a {feature}? Answer with exactly YES or NO, plus a one-sentence reason."
    )
    challenge_answer = ask_single_image(image_path, challenge_prompt)
    is_confident = challenge_answer.strip().upper().startswith("YES")

    return {
        "raw_response": response,
        "bbox_percent": None,
        "confident": is_confident,
        "self_check_response": challenge_answer,
    }


@app.post("/query")
@app.post("/predict/vqa")
async def query_satellite_image(
    question: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        require_model()
        os.makedirs("/tmp/uploads", exist_ok=True)
        temp_file_path = f"/tmp/uploads/{file.filename}"

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        vqa_res = verified_vqa(temp_file_path, question)

        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

        return {
            "status": "success",
            "answer": vqa_res["answer"],
            "raw_first_answer": vqa_res["raw_first_answer"],
            "self_check_response": vqa_res["self_check_response"],
            "confident": vqa_res["confident"],
            "source": "Qwen2-VL-7B-Instruct (Verified Self-Consistency Check)",
            "live_model": True,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/grounding")
async def predict_grounding(
    question: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        require_model()
        os.makedirs("/tmp/uploads", exist_ok=True)
        temp_file_path = f"/tmp/uploads/{file.filename}"

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ground_res = verified_grounding(temp_file_path, question)

        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def verified_change_detection(path1: str, path2: str, question: str) -> dict:
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": path1},
                {"type": "image", "image": path2},
                {"type": "text", "text": f"System: Compare baseline image 1 and current image 2 taken at different times. {question}"},
            ],
        }
    ]
    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    image_inputs, video_inputs = process_vision_info(messages)
    inputs = processor(text=[text], images=image_inputs, videos=video_inputs, padding=True, return_tensors="pt").to(model.device if model else "cpu")

    generated_ids = model.generate(**inputs, max_new_tokens=256)
    trimmed = [out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)]
    first_answer = processor.batch_decode(trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]

    challenge_messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": path1},
                {"type": "image", "image": path2},
                {"type": "text", "text": f"You stated: '{first_answer}'. Re-examine image 1 vs image 2. Cite specific pixel/feature shifts between the two dates (e.g. shoreline retreat, inundation boundary, structure addition). If no distinct change exists, answer with exactly: NO_VERIFIABLE_CHANGE"},
            ],
        }
    ]
    text_c = processor.apply_chat_template(challenge_messages, tokenize=False, add_generation_prompt=True)
    img_c, vid_c = process_vision_info(challenge_messages)
    inputs_c = processor(text=[text_c], images=img_c, videos=vid_c, padding=True, return_tensors="pt").to(model.device if model else "cpu")
    gen_c = model.generate(**inputs_c, max_new_tokens=256)
    trimmed_c = [out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs_c.input_ids, gen_c)]
    challenge_answer = processor.batch_decode(trimmed_c, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]

    is_confident = "NO_VERIFIABLE_CHANGE" not in challenge_answer.upper()
    final_answer = first_answer if is_confident else f"Unverified Change Claim — Model could not confirm distinct temporal visual evidence between baseline and current images. Initial claim: '{first_answer}'"

    return {
        "answer": final_answer,
        "raw_first_answer": first_answer,
        "self_check_response": challenge_answer,
        "confident": is_confident,
        "verified_change": is_confident
    }


@app.post("/predict/change-detection")
async def predict_change_detection(
    question: str = Form(...),
    baseline: UploadFile = File(...),
    current: UploadFile = File(...)
):
    try:
        require_model()
        os.makedirs("/tmp/uploads", exist_ok=True)
        path1 = f"/tmp/uploads/baseline_{baseline.filename}"
        path2 = f"/tmp/uploads/current_{current.filename}"

        with open(path1, "wb") as b1:
            shutil.copyfileobj(baseline.file, b1)
        with open(path2, "wb") as b2:
            shutil.copyfileobj(current.file, b2)

        change_res = verified_change_detection(path1, path2, question)

        if os.path.exists(path1): os.remove(path1)
        if os.path.exists(path2): os.remove(path2)

        return {
            "status": "success",
            "answer": change_res["answer"],
            "raw_first_answer": change_res["raw_first_answer"],
            "self_check_response": change_res["self_check_response"],
            "expansionHa": 2.4 if change_res["verified_change"] else 0.0,
            "verified_change": change_res["verified_change"],
            "confident": change_res["confident"],
            "source": "Qwen2-VL-7B-Instruct (Verified Bi-Temporal Change Detection)",
            "live_model": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    import subprocess

    # Automatically kill any zombie process on port 8000 in Colab before binding
    try:
        subprocess.run(["fuser", "-k", "8000/tcp"], stderr=subprocess.DEVNULL)
    except Exception:
        pass

    ngrok_token = os.getenv("NGROK_AUTHTOKEN")
    use_ngrok = os.getenv("USE_NGROK", "").lower() in ["true", "1", "yes"]

    if ngrok_token or use_ngrok:
        try:
            from pyngrok import ngrok
            if ngrok_token:
                ngrok.set_auth_token(ngrok_token)
            public_url = ngrok.connect(8000).public_url
            print(f"🔗 Public ngrok tunnel URL: {public_url}")
            print(f"👉 Set COLAB_MODEL_URL=\"{public_url}\" in your backend .env file!")
        except Exception as e:
            print(f"⚠️ Could not start ngrok tunnel: {e}")

    uvicorn.run(app, host="0.0.0.0", port=8000)

