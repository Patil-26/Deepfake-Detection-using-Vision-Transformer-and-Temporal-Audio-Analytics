"""
Audio Deepfake Detection Model
Uses Wav2Vec2-based model for audio deepfake detection.
Loads model directly (no pipeline) to avoid scipy import chain issues.
"""

import torch
import numpy as np
import io
import os
import librosa
import soundfile as sf
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

# Make FFmpeg available for WebM decoding (via imageio-ffmpeg plugin)
try:
    import imageio_ffmpeg
    import shutil
    ffmpeg_exe_path = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe_path)
    ffmpeg_standard_path = os.path.join(ffmpeg_dir, "ffmpeg.exe")
    if not os.path.exists(ffmpeg_standard_path):
        shutil.copy(ffmpeg_exe_path, ffmpeg_standard_path)
    os.environ["PATH"] += os.pathsep + ffmpeg_dir
except ImportError:
    pass

# ── Model singleton ───────────────────────────────────────────────────────────
_model = None
_extractor = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "mo-thecreator/Deepfake-audio-detection"
SAMPLE_RATE = 16000


def load_model():
    """Load the audio classification model and feature extractor (once)."""
    global _model, _extractor
    if _model is None:
        print(f"[AudioModel] Loading '{MODEL_ID}' on {DEVICE}...")
        _extractor = AutoFeatureExtractor.from_pretrained(MODEL_ID)
        _model = AutoModelForAudioClassification.from_pretrained(MODEL_ID)
        _model.to(DEVICE)
        _model.eval()
        print("[AudioModel] Audio model loaded successfully.")
    return _extractor, _model


def predict(audio_bytes: bytes) -> dict:
    """
    Run deepfake detection on raw audio bytes (WAV/MP3/WebM etc).

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

    # Decode audio to float32 numpy at 16kHz
    # Use FFmpeg subprocess to convert any format (WebM, MP3, etc.) to WAV
    import tempfile
    import subprocess

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
        tmp_in.write(audio_bytes)
        input_path = tmp_in.name

    output_path = input_path + ".wav"

    try:
        # Get bundled ffmpeg path
        try:
            import imageio_ffmpeg
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            ffmpeg_exe = "ffmpeg"

        # Convert to 16kHz mono WAV using FFmpeg
        cmd = [
            ffmpeg_exe, "-y", "-i", input_path,
            "-ar", str(SAMPLE_RATE), "-ac", "1", "-f", "wav",
            output_path
        ]
        proc = subprocess.run(cmd, capture_output=True, timeout=30)
        if proc.returncode != 0:
            raise RuntimeError(f"FFmpeg conversion failed: {proc.stderr.decode(errors='ignore')[:500]}")

        # Load the clean WAV file
        waveform, _ = sf.read(output_path, dtype="float32")
    finally:
        for p in [input_path, output_path]:
            if os.path.exists(p):
                os.remove(p)

    # Preprocess
    inputs = extractor(
        waveform, sampling_rate=SAMPLE_RATE, return_tensors="pt", padding=True
    )
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    # Run inference
    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
    id2label = model.config.id2label

    # Map labels to FAKE/REAL
    scores: dict = {}
    for idx, prob in enumerate(probs):
        raw_label = id2label.get(idx, str(idx))
        if "fake" in raw_label.lower() or "spoof" in raw_label.lower():
            scores["FAKE"] = round(float(prob) * 100, 2)
        else:
            scores["REAL"] = round(float(prob) * 100, 2)

    scores.setdefault("FAKE", round(100.0 - scores.get("REAL", 0.0), 2))
    scores.setdefault("REAL", round(100.0 - scores.get("FAKE", 0.0), 2))

    top_label = "FAKE" if scores["FAKE"] >= scores["REAL"] else "REAL"
    confidence = scores[top_label]

    return {
        "label": top_label,
        "confidence": confidence,
        "scores": scores,
    }
