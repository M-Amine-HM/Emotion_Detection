from __future__ import annotations

import base64
import io
import logging
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, UnidentifiedImageError

from model import load_model, predict, is_loaded

app = FastAPI(title="Emotion Detection API")
logger = logging.getLogger("emotion_api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    image: str


class EmotionScore(BaseModel):
    label: str
    score: float


class PredictResponse(BaseModel):
    emotions: List[EmotionScore]
    dominant: str


@app.on_event("startup")
def startup_event() -> None:
    load_model()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": "loaded" if is_loaded() else "not_loaded"}


@app.post("/predict", response_model=PredictResponse)
def predict_emotion(payload: PredictRequest) -> PredictResponse:
    if not payload.image:
        raise HTTPException(status_code=400, detail="Missing image data")

    try:
        image_bytes = _decode_base64_image(payload.image)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except (ValueError, UnidentifiedImageError):
        raise HTTPException(status_code=400, detail="Invalid image data")
    except Exception as exc:
        logger.exception("Image decode error")
        raise HTTPException(
            status_code=500, detail=f"Image decode error: {exc}")

    try:
        emotions = predict(image)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Model error")
        raise HTTPException(status_code=500, detail=f"Model error: {exc}")

    if not emotions:
        raise HTTPException(status_code=422, detail="No face detected")

    dominant = emotions[0]["label"]
    return PredictResponse(emotions=emotions, dominant=dominant)


def _decode_base64_image(data: str) -> bytes:
    if "," in data:
        _, data = data.split(",", 1)

    try:
        return base64.b64decode(data, validate=True)
    except Exception as exc:
        raise ValueError("Invalid base64 data") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
