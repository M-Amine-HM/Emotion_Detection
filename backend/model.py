from __future__ import annotations

import io
import os
import tempfile
from typing import Dict, List

from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from PIL import Image

_MODEL_ID = "dima806/facial_emotions_image_detection"
_client: InferenceClient | None = None
_token: str | None = None


def load_model() -> None:
    global _client, _token
    if _client is not None:
        return

    load_dotenv()

    _token = os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not _token:
        raise RuntimeError(
            "Missing HF_API_TOKEN for Hugging Face Inference API")

    _client = InferenceClient(model=_MODEL_ID, token=_token, timeout=30)


def is_loaded() -> bool:
    return _client is not None and bool(_token)


def predict(image: Image.Image) -> List[Dict[str, float]]:
    if _client is None or not _token:
        raise RuntimeError("Model client not initialized")

    image_bytes = _serialize_image(image)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name

        results = _client.image_classification(temp_path)
    except Exception as exc:
        raise RuntimeError(str(exc)) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    if not isinstance(results, list):
        raise RuntimeError("Unexpected response from Hugging Face API")

    results = sorted(results, key=lambda item: item.get(
        "score", 0), reverse=True)
    return [{"label": item["label"], "score": float(item["score"])} for item in results]


def _serialize_image(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    return buffer.getvalue()
