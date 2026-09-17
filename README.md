# SatQuery AI — Interactive Multimodal Satellite Intelligence Assistant

![SatQuery AI Banner](https://img.shields.io/badge/SIH--2026-ISRO%20Hackathon%20PS%20SIH26167-00A3A6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)
![Node](https://img.shields.io/badge/Backend-TypeScript%20%7C%20Node.js%20Express-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/AI%20Model-Qwen2--VL--7B--Instruct%20(Colab%20T4)-3776AB?style=for-the-badge&logo=python)

---

## 📌 Problem Statement Overview (SIH26167 — ISRO)

Modern Earth Observation satellites (Cartosat, RISAT, Sentinel, Landsat) capture terabytes of remote sensing imagery daily. Extracting actionable intelligence currently requires GIS specialists operating software manually (ArcGIS, QGIS, SNAP). Generic multimodal LLMs (e.g., GPT-4V) frequently hallucinate non-existent water bodies, invent surface area measurements, and lack spectral band awareness (NIR, SWIR, SAR backscatter).

**SatQuery AI** transforms remote sensing imagery analysis into an **evidence-grounded satellite intelligence platform** that combines:
1. **Vision-Language Model (Qwen2-VL-7B-Instruct)** for high-resolution visual QA and scene understanding.
2. **Vector RAG & Authoritative Catalog Retrieval** (ISRO/NASA/ESA verified metadata) to eliminate factual hallucinations.
3. **Deterministic Verification Thresholding** (`score >= 0.70`), automatically rejecting queries for fake satellites (e.g., `XYZ-999`) or unverified claims.

---

## 🏛️ System Architecture

```
User Query / Satellite Image Upload
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. Query Understanding & Intent Classifier            │
│    (src/services/queryAnalyzer.ts)                    │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│ 2. Authoritative Catalog      │   │ 3. Vector RAG Retrieval       │
│    Metadata Lookup            │   │    (src/services/ragEngine.ts)│
│    (trustedKnowledge.ts)      │   │    Cartosat/Sentinel/Landsat  │
└──────────────┬────────────────┘   └───────────────┬───────────────┘
               │                                    │
               └───────────────────┬────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────┐
│ 4. Grounding & Anti-Hallucination Verification Engine  │
│    (src/services/groundingEngine.ts - Threshold >=0.70)│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Vision-Language ML Inference Bridge                 │
│    (colab/app.py -> Qwen2-VL-7B-Instruct on GPU)       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 6. Grounded Answer Synthesis & Citations UI            │
│    (SatQueryAI-Frontend / React + Vite)                │
└────────────────────────────────────────────────────────┘
```

---

## ⭐ Core Features

### 1. Visual Question Answering (VQA)
- Single-image visual inference (object presence, spatial land cover, risk assessment).
- Cited evidence cards linking ISRO/ESA catalog specs.

### 2. Text-Guided Region Grounding
- Locate geographical features (e.g., `"water body"`, `"agricultural field"`).
- Dynamic canvas overlay converting percentage coordinates (`bbox_percent: [left, top, right, bottom]`) to responsive canvas pixels (`clientWidth`/`clientHeight`).
- Displays an alert banner when features are not detected (`bbox_percent: null`).

### 3. Bi-Temporal Change Detection
- Dual-image comparison (`baseline` vs `current`) with acquisition dates (`date1`, `date2`).
- Deterministic pixel difference percentage calculation.
- Renders a green **"Verified Change"** vs amber **"No Significant Change"** badge above the answer text.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Custom CSS animations.
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
* **ML Model Serving**: Python, FastAPI, PyTorch, HuggingFace Transformers, `Qwen/Qwen2-VL-7B-Instruct` (4-bit NF4 Quantization).
* **GPU Deployment**: Google Colab T4 GPU, pyngrok tunnel.

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- Node.js (v18+) & `npm`
- Python 3.10+ (for local Colab bridge script)
- Google Colab account with GPU enabled (or local NVIDIA GPU)

---

### 2. Backend Setup (`SatQuerAI-Backend`)

```bash
cd SatQuerAI-Backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Configure environment variables (.env)
```

Create or update `.env` in `SatQuerAI-Backend/.env`:

```env
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/satquery_ai?schema=public"
COLAB_MODEL_URL="https://your-ngrok-url.ngrok-free.dev"
NODE_ENV="development"
```

Start the TypeScript backend:
```bash
npm run dev
```

---

### 3. Frontend Setup (`SatQueryAI-Frontend`)

```bash
cd SatQueryAI-Frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The React App will run on `http://localhost:5173`.

---

### 4. Google Colab GPU Setup (`colab/app.py`)

1. Open a new Google Colab notebook and set **Runtime → Change runtime type → T4 GPU**.
2. Run the server code provided in `colab/app.py` or add the Ngrok tunnel cell:

```python
!pip install -q fastapi uvicorn torch transformers qwen-vl-utils bitsandbytes pydantic python-multipart pyngrok nest_asyncio

import threading
import uvicorn
from pyngrok import ngrok
from app import app # or run full app code

ngrok.set_auth_token("YOUR_NGROK_AUTHTOKEN")
public_url = ngrok.connect(8000)
print(f"🚀 LIVE GPU ENDPOINT: {public_url}")

config = uvicorn.Config(app, host="0.0.0.0", port=8000)
server = uvicorn.Server(config)
thread = threading.Thread(target=server.run, daemon=True)
thread.start()
```

3. Copy the output Ngrok URL (e.g. `https://xxxx.ngrok-free.dev`) and set `COLAB_MODEL_URL` in `SatQuerAI-Backend/.env`.

---

## 📡 API Contract Specification (SIH26167 Compliant)

| Endpoint | Method | Payload / Form-Data | Response Payload |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | N/A | `{ "status": "ONLINE", "modelApiConfigured": true }` |
| `/api/vqa` | `POST` | `image` (file), `question` (string) | `{ "answer": "string", "sources": [...], "evidence": [...] }` |
| `/api/change-detection` | `POST` | `image1` (file), `image2` (file), `question` (string), `date1`, `date2` | `{ "answer": "string", "raw_model_answer": "string", "pixel_diff_percent": 18.6, "verified_change": true }` |
| `/api/grounding` | `POST` | `image` (file), `feature` (string) | `{ "raw_response": "string", "bbox_percent": [20.0, 15.0, 65.0, 55.0] }` |

---

## 🧪 Anti-Hallucination Automated Test Suite

SatQuery AI includes an automated verification test suite to ensure fake satellites or unsupported questions are never answered with hallucinations.

Run the test suite:
```bash
cd SatQuerAI-Backend
npx ts-node src/tests/antiHallucination.test.ts
```

### Verified Test Cases:
- ✅ **Test 1 — Supported Query**: Cartosat-3 specs -> Grounded answer + sources.
- ✅ **Test 2 — Partial Query**: Sentinel-2 bands -> Evidence snippets.
- ✅ **Test 3 — Unsupported Query**: Out-of-domain question -> `insufficient_evidence: true`.
- ✅ **Test 4 — Fake Satellite**: Querying `XYZ-999` -> Explicitly unverified response.
- ✅ **Test 5 — ML Inference**: Qwen2-VL-7B vision pass execution.
- ✅ **Test 6 — RAG + ML Combined**: Full multi-modal evidence fusion.
- ✅ **Test 7 — Invalid Input Handling**: Validated error payload.

---

## 📄 License & Attribution

Built for **Smart India Hackathon (SIH 2026 / SIH26167)** under the sponsorship of **Indian Space Research Organisation (ISRO) / Department of Space**.
