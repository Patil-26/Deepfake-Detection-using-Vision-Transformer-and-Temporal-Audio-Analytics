"""
DeepGuard Backend - FastAPI AI Server
Serves deepfake detection for images, video frames, and audio.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import image, video, audio

app = FastAPI(
    title="DeepGuard API",
    description="AI-powered deepfake detection API for images, video, and audio.",
    version="1.0.0",
)

# Allow Chrome extension and local dev to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to extension origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(image.router, prefix="/analyze", tags=["Image"])
app.include_router(video.router, prefix="/analyze", tags=["Video"])
app.include_router(audio.router, prefix="/analyze", tags=["Audio"])


@app.get("/")
async def root():
    return {"message": "DeepGuard API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
