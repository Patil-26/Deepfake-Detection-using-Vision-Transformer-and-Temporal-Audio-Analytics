"""
Image Deepfake / AI-Generated Image Detection Model
Uses haywoodsloan/ai-image-detector-deploy (SwinV2-based) from HuggingFace.

Why this model instead of dima806/deepfake_vs_real_image_detection?
- The dima806 model was trained only on GAN-generated face datasets (~2020).
  It cannot detect modern diffusion-based AI images (Midjourney, DALL-E, SD).
- haywoodsloan model: trained on broad modern AI + real images.
  Validation metrics: 98.1% accuracy, 98.7% F1, 99.5% AUC.

Model label mapping: {0: 'artificial', 1: 'real'}
"""

import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
import io

# ── Model singleton ───────────────────────────────────────────────────────────
_model = None
_extractor = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "haywoodsloan/ai-image-detector-deploy"

# Verified from model config.json: {0: 'artificial', 1: 'real'}
# 'artificial' maps to our FAKE label, 'real' maps to REAL.
LABEL_MAP = {
    "artificial": "FAKE",
    "ai":         "FAKE",
    "fake":       "FAKE",
    "generated":  "FAKE",
    "real":       "REAL",
    "authentic":  "REAL",
}


def load_model():
    """Load the SwinV2 model and feature extractor (once, then cached)."""
    global _model, _extractor
    if _model is None:
        print(f"[ImageModel] Loading '{MODEL_ID}' on {DEVICE}...")
        _extractor = AutoImageProcessor.from_pretrained(MODEL_ID)
        _model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
        _model.to(DEVICE)
        _model.eval()
        print(f"[ImageModel] Model loaded. Labels: {_model.config.id2label}")
    return _extractor, _model


def predict(image_bytes: bytes) -> dict:
    """
    Run AI-image detection on raw image bytes.

    Returns:
        {
          "label":      "FAKE" | "REAL",
          "confidence": float (0-100),
          "scores":     { "FAKE": float, "REAL": float }
        }
    """
    extractor, model = load_model()
    assert extractor is not None, "Extractor is not loaded"
    assert model is not None, "Model is not loaded"

    # Decode image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Preprocess
    inputs = extractor(images=image, return_tensors="pt")
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    # Run inference
    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

    # Map model labels → FAKE / REAL using verified LABEL_MAP
    id2label = model.config.id2label
    scores = {"FAKE": 0.0, "REAL": 0.0}

    for idx, prob in enumerate(probs):
        raw = id2label.get(idx, f"LABEL_{idx}").strip().lower()
        key = LABEL_MAP.get(raw, "REAL")  # default to REAL if unknown
        scores[key] += round(float(prob) * 100, 2)

    print(f"[ImageModel] Raw — " + ", ".join(
        f"{id2label.get(i, i)}: {probs[i]:.4f}" for i in range(len(probs))
    ))
    print(f"[ImageModel] Mapped scores: {scores}")

    top_label = "FAKE" if scores["FAKE"] >= scores["REAL"] else "REAL"
    confidence = scores[top_label]

    return {
        "label": top_label,
        "confidence": confidence,
        "scores": scores,
    }
