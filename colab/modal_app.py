import modal

app = modal.App("satquery-qwen2-vl-model")

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git")
    .pip_install(
        "fastapi>=0.109.0",
        "uvicorn>=0.27.0",
        "torch>=2.1.2",
        "transformers>=4.44.0",
        "qwen-vl-utils>=0.0.4",
        "bitsandbytes>=0.43.0",
        "pydantic>=2.6.0",
        "python-multipart>=0.0.9",
        "accelerate>=0.28.0",
    )
)

@app.cls(gpu="T4", image=image, keep_warm=1)
class ModelServer:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import Qwen2VLForConditionalGeneration, AutoProcessor, BitsAndBytesConfig

        MODEL_NAME = "Qwen/Qwen2-VL-7B-Instruct"
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_quant_type="nf4",
        )
        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
        )
        self.processor = AutoProcessor.from_pretrained(MODEL_NAME)

    @modal.asgi_app()
    def fastapi_app(self):
        from app import app as fastapi_service
        return fastapi_service
