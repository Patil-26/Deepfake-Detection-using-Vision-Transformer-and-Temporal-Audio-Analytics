# DeepGuard — AI Deepfake Detection Chrome Extension

An AI-powered Chrome extension for detecting deepfake images, video, and audio directly on any webpage.

## 🚀 Quick Start

### Step 1 — Start the Backend
```bash
# Double-click start_backend.bat
# OR manually:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> **First run**: Downloads AI models (~1GB). Subsequent runs are instant.

### Step 2 — Build the Extension
```bash
# Double-click build_extension.bat
# OR manually:
cd extension
npm install
npm run build
```

### Step 3 — Load in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `extension\dist` folder

---

## 📁 Project Structure

```
deepguard/
├── backend/                 ← FastAPI AI Server
│   ├── main.py              ← App entry point
│   ├── models/
│   │   ├── image_model.py   ← ViT deepfake image detector
│   │   └── audio_model.py   ← Wav2Vec2 audio detector
│   ├── routers/
│   │   ├── image.py         ← POST /analyze/image, /image-url, /image-base64
│   │   ├── video.py         ← POST /analyze/video, /video-frames
│   │   └── audio.py         ← POST /analyze/audio
│   └── requirements.txt
│
├── extension/               ← Chrome Extension (Vite + React + TypeScript)
│   ├── public/
│   │   ├── manifest.json    ← MV3 manifest
│   │   └── offscreen.html   ← Offscreen doc for audio recording
│   └── src/
│       ├── popup/           ← Extension popup UI
│       ├── content/         ← Content scripts (injected into pages)
│       │   ├── imageScanner.ts
│       │   ├── regionSelector.ts
│       │   ├── audioRecorder.ts
│       │   └── floatingPanel.ts
│       ├── background/
│       │   └── serviceWorker.ts
│       └── offscreen/
│           └── offscreen.ts
│
├── start_backend.bat        ← One-click backend startup
└── build_extension.bat      ← One-click extension build
```

---


## ✨ Features

### 1. Image Scanner (Like Grammarly)
- Toggle ON in popup → shield icon appears on **every image** on the page
- Click any shield icon → floating analysis panel appears
- Panel shows: authenticity score ring, fake/real probability bars, detailed analysis
- Panel is **draggable** — move it anywhere

### 2. Real-time Region Detection
- Click "Select" → cursor becomes crosshair
- Drag to select any region (image, video, ad, etc.)
- Floating panel appears with live analysis, updating every 2 seconds
- Works on videos too (analyzes frames)

### 3. Audio Analysis
- Click "Record" → 5-second countdown shown in panel
- Records 10 seconds of the tab's audio
- Sends to AI model → shows AI voice detection score

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18 + TypeScript + CSS
- **Backend**: FastAPI + Uvicorn + Python 3.11
- **AI**: HuggingFace Transformers + PyTorch (CUDA GPU)
- **Extension**: Chrome Manifest V3

---

## 📡 API Reference

Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/analyze/image` | POST | Upload image file |
| `/analyze/image-url` | POST | Analyze image from URL |
| `/analyze/image-base64` | POST | Analyze base64 image |
| `/analyze/video` | POST | Analyze single frame |
| `/analyze/video-frames` | POST | Analyze multiple frames |
| `/analyze/audio` | POST | Upload audio file |
| `/docs` | GET | Swagger UI |
