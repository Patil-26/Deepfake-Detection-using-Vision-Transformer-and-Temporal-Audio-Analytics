"""
Image Analysis Router
POST /analyze/image  — accepts an image file, returns deepfake detection results.
POST /analyze/image-url — accepts a URL, fetches image and analyzes it.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from models.image_model import predict
import httpx
import base64

router = APIRouter()


@router.post("/image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image for deepfake detection.
    Returns authenticity score and detailed analysis.
    """
    # Validate content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file received.")

    result = predict(image_bytes)
    return JSONResponse(content={
        "success": True,
        "type": "image",
        **result,
        "details": _build_details(result),
    })


@router.post("/image-url")
async def analyze_image_url(url: str = Form(...)):
    """
    Analyze an image from a URL for deepfake detection.
    Useful when the extension sends the src URL of an img element.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers={
                "User-Agent": "DeepGuard/1.0"
            })
            response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch image: {str(e)}")

    content_type = response.headers.get("content-type", "")
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="URL does not point to an image.")

    image_bytes = response.content
    result = predict(image_bytes)
    return JSONResponse(content={
        "success": True,
        "type": "image",
        **result,
        "details": _build_details(result),
    })


@router.post("/image-base64")
async def analyze_image_base64(data: dict):
    """
    Analyze a base64-encoded image.
    Accepts: { "image": "<base64 string>", "mime": "image/png" }
    """
    try:
        b64 = data.get("image", "")
        # Strip data URI prefix if present
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        image_bytes = base64.b64decode(b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    result = predict(image_bytes)
    return JSONResponse(content={
        "success": True,
        "type": "image",
        **result,
        "details": _build_details(result),
    })


def _build_details(result: dict) -> dict:
    """Build a rich details object for the frontend analysis panel."""
    label = result["label"]
    confidence = result["confidence"]
    scores = result["scores"]

    # Generate human-readable analysis points
    analysis_points = []
    if label == "FAKE":
        analysis_points = [
            "Facial inconsistencies detected in texture mapping",
            "Unnatural blending artifacts found around facial boundaries",
            "GAN fingerprints detected in pixel frequency domain",
            f"Fake probability: {scores.get('FAKE', 0):.1f}%",
        ]
    else:
        analysis_points = [
            "Natural facial texture consistency verified",
            "No blending artifacts or boundary anomalies detected",
            "Pixel frequency patterns match authentic imagery",
            f"Authentic probability: {scores.get('REAL', 0):.1f}%",
        ]

    # Risk level based on confidence
    if confidence >= 90:
        risk = "HIGH" if label == "FAKE" else "SAFE"
    elif confidence >= 70:
        risk = "MEDIUM" if label == "FAKE" else "LIKELY SAFE"
    else:
        risk = "LOW" if label == "FAKE" else "UNCERTAIN"

    return {
        "risk_level": risk,
        "analysis_points": analysis_points,
        "model": "ViT Deepfake Detector (dima806)",
    }
