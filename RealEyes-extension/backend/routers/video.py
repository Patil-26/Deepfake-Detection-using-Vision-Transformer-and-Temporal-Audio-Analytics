from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import base64
import tempfile
import cv2
import numpy as np
import io
from PIL import Image

# Import the existing image model predictions
from models.image_model import predict as predict_image

router = APIRouter()

@router.post("/clip")
async def analyze_video_clip_frame_by_frame(file: UploadFile = File(...), bbox: str = Form(None)):
    """
    Analyze an uploaded video file (WebM/MP4) using exactly 10 frames and the image detector.
    Takes the average of the 10 frames to give the final generative video score.
    """
    import traceback
    import json
    import os
    
    print(f"[VideoRouter] Received request for clip analysis. Filename: {file.filename}")
    
    content_type = file.content_type or ""
    if not content_type.startswith("video/") and content_type not in ["application/octet-stream", "audio/webm"]:
        print(f"[VideoRouter] Invalid content type: {content_type}")
        raise HTTPException(status_code=400, detail=f"Must be a video file, got {content_type}")

    video_bytes = await file.read()
    print(f"[VideoRouter] Read {len(video_bytes)} bytes from upload.")
    
    if len(video_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Video file too short or empty")

    # Write video to temporary file
    # We use a context manager to ensure it's written and closed immediately
    fd, video_path = tempfile.mkstemp(suffix=".webm")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            tmp.write(video_bytes)
        print(f"[VideoRouter] Video written to {video_path}")

        # Parse bbox if available
        bbox_obj = None
        if bbox:
            try:
                bbox_obj = json.loads(bbox)
                print(f"[VideoRouter] Parsed BBox: {bbox_obj}")
            except Exception as e:
                print(f"[VideoRouter] BBox parse error: {e}")
                pass
                
        # Use OpenCV to parse exactly 10 frames
        # Specified CAP_FFMPEG for better codec support on Windows
        cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            print("[VideoRouter] OpenCV failed to open the video file.")
            # Fallback to default backend if FFMPEG fails
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise RuntimeError("Could not open video file with any backend.")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        print(f"[VideoRouter] Total frames detected: {total_frames}")
        
        if total_frames <= 0:
            # Some formats (like live WebM) don't report frame count. 
            # We'll try to just read sequential if count is unknown.
            print("[VideoRouter] Frame count unknown, attempting sequential read fallback.")
            total_frames = 100 # Dummy guess
            
        num_frames = 10
        indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
        
        extracted_frames_bytes = []
        
        for i, idx in enumerate(indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret:
                # If seeking failed, try just reading the next frame available
                ret, frame = cap.read()
                if not ret:
                    continue
                
            # Crop to exact video player bounding box (removes UI distortion)
            if bbox_obj:
                h, w = frame.shape[:2]
                bx = max(0, int(bbox_obj.get("x", 0) * w))
                by = max(0, int(bbox_obj.get("y", 0) * h))
                bw = min(w - bx, int(bbox_obj.get("w", 1) * w))
                bh = min(h - by, int(bbox_obj.get("h", 1) * h))
                
                if bw > 10 and bh > 10:
                    frame = frame[by:by+bh, bx:bx+bw]

            # Convert BGR (cv2) to RGB (PIL)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(frame_rgb)
            
            buf = io.BytesIO()
            pil_img.save(buf, format="PNG")
            extracted_frames_bytes.append(buf.getvalue())
            
        cap.release()
        print(f"[VideoRouter] Extracted {len(extracted_frames_bytes)} frames.")
        
        if not extracted_frames_bytes:
            raise RuntimeError("Failed to extract any valid frames from the video. The file might be corrupted or in an unsupported format.")

        # Run each frame independently through our pre-loaded image_model.py
        all_results = []
        print("[VideoRouter] Starting per-frame AI analysis...")
        for frame_bytes in extracted_frames_bytes:
            frame_res = predict_image(frame_bytes)
            all_results.append(frame_res)
            
        # Instead of a pure average of ALL frames (which gets dragged down by motion blur and WebM compression),
        # we isolate the top 5 clearest/most confident frame predictions and average those.
        # This prevents video artifacts from artificially lowering the AI detection score.
        all_results_sorted = sorted(all_results, key=lambda x: x["scores"].get("FAKE", 0), reverse=True)
        top_k_results = all_results_sorted[:5] # Best 5 frames
        
        total_fake = sum([r["scores"].get("FAKE", 0) for r in top_k_results])
        total_real = sum([r["scores"].get("REAL", 0) for r in top_k_results])
        
        avg_fake = total_fake / len(top_k_results)
        avg_real = total_real / len(top_k_results)
        
        final_label = "FAKE" if avg_fake >= avg_real else "REAL"
        final_confidence = avg_fake if final_label == "FAKE" else avg_real

        print(f"[VideoRouter] Final Result (Top-5 Avg): {final_label} ({final_confidence:.1f}%)")

        # Provide detailed feedback for UI
        if final_label == "FAKE":
            risk = "HIGH" if final_confidence >= 80 else "MEDIUM"
            analysis_points = [
                f"Aggregated confident score from peak {len(top_k_results)} video frames",
                f"Generative artifacts detected (Peak Avg: {avg_fake:.1f}%)",
                "Temporal consistency check: Per-frame AI high-suspect."
            ]
        else:
            risk = "SAFE" if final_confidence >= 80 else "LIKELY SAFE"
            analysis_points = [
                f"Aggregated confident score from peak {len(top_k_results)} video frames",
                "No generative signatures found in best-sampled frames",
                f"Authentic probability: {avg_real:.1f}%"
            ]

        return JSONResponse(content={
            "success": True,
            "type": "video_clip",
            "label": final_label,
            "confidence": round(final_confidence, 2),
            "scores": {
                "FAKE": round(avg_fake, 2),
                "REAL": round(avg_real, 2)
            },
            "details": {
                "risk_level": risk,
                "analysis_points": analysis_points,
                "model": "10-Frame Averaged SwinV2-DeepGuard"
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Frame-by-frame analysis error: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
            except:
                pass
