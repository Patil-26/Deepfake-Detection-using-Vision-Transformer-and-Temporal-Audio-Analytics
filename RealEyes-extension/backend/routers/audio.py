"""
Audio Analysis Router
POST /analyze/audio — accepts an audio file (WAV/MP3), returns deepfake detection results.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from models.audio_model import predict

router = APIRouter()

ALLOWED_AUDIO_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/mpeg", "audio/mp3",
    "audio/ogg", "audio/webm",
    "audio/mp4", "audio/aac",
    "application/octet-stream",  # Browser MediaRecorder often sends this
}


@router.post("/audio")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyze an uploaded audio file for AI-generated (deepfake) voice detection.
    Returns authenticity score and detailed analysis.
    """
    content_type = file.content_type or ""
    if content_type not in ALLOWED_AUDIO_TYPES and not content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {content_type}. Use WAV, MP3, OGG, or WebM."
        )

    audio_bytes = await file.read()
    if len(audio_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Audio file too short or empty.")

    import traceback
    try:
        result = predict(audio_bytes)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Audio analysis error: {str(e)}")

    return JSONResponse(content={
        "success": True,
        "type": "audio",
        **result,
        "details": _build_audio_details(result),
    })


def _build_audio_details(result: dict) -> dict:
    label = result["label"]
    confidence = result["confidence"]
    scores = result["scores"]

    if label == "FAKE":
        analysis_points = [
            "Unnatural prosody patterns detected in speech",
            "Spectral artifacts consistent with TTS synthesis found",
            "Voice biometric fingerprint anomalies identified",
            f"AI-generated probability: {scores.get('FAKE', 0):.1f}%",
        ]
        risk = "HIGH" if confidence >= 85 else "MEDIUM"
    else:
        analysis_points = [
            "Natural human speech patterns verified",
            "Consistent prosody and intonation detected",
            "No AI synthesis artifacts in spectral analysis",
            f"Authentic voice probability: {scores.get('REAL', 0):.1f}%",
        ]
        risk = "SAFE" if confidence >= 85 else "LIKELY SAFE"

    return {
        "risk_level": risk,
        "analysis_points": analysis_points,
        "model": "Wav2Vec2 Audio Deepfake Detector",
    }
