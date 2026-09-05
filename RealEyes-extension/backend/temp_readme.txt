---
license: mit
---
🧾 Model Card — VideoMAE-DeepFake-Detector-v1
🧠 Model Overview

VideoMAE-DeepFake-Detector-v1 is a fine-tuned video deepfake detection model trained to distinguish between authentic and manipulated facial videos. The model builds upon the pretrained VideoMAE architecture and adapts it for binary classification of real versus synthetic videos.

The base model was originally trained on large-scale video action datasets, enabling strong spatiotemporal feature understanding. It was further fine-tuned on the FaceForensics++ dataset to detect visual artifacts, temporal inconsistencies, and manipulation signatures commonly found in deepfake videos.

By leveraging transformer-based video representation learning, the model captures both frame-level visual cues and motion patterns across time, allowing it to identify subtle manipulations that traditional image-based detectors may miss.

The model is designed for applications in media verification, misinformation detection, and AI-generated content monitoring.

🏗️ Training Details

Base Model:
MCG-NJU/videomae-base-finetuned-kinetics

Framework:
Hugging Face Transformers + PyTorch

Training Hardware:
NVIDIA T4 GPU (Kaggle)

Epochs:
15

Batch Size:
4

Learning Rate:
2e-5

Optimizer:
AdamW

Video Sampling:
16 frames per video clip

Resolution:
224 × 224

Training Strategy:

Transfer learning with partial freezing:

~70% of VideoMAE backbone layers frozen

Final transformer layers + classifier head fine-tuned

Dataset:
FaceForensics++ (C23 compression level)

Classes:

🟢 Real Video
🔴 Deepfake Video

📊 Dataset Description

The model was trained using the FaceForensics++ dataset, a widely used benchmark for deepfake detection research.

FaceForensics++ contains manipulated videos generated using multiple facial manipulation techniques, including deepfake generation and facial reenactment.

For this model version, training used a subset consisting of:

Original videos (real)

Deepfakes manipulation videos (fake)

Each video was processed by sampling 16 frames uniformly across its duration to capture both spatial and temporal artifacts.

Label	Description
Real	Authentic unmodified video
Fake	Video manipulated using deepfake synthesis techniques
🎯 Evaluation Metrics

Evaluation was performed on a held-out validation split of the dataset.

Metric	Score
Train Loss	0.303
Validation Loss	0.506
Accuracy	88.0%
F1 Score	0.742
AUC	0.836

✅ The model demonstrates strong ability to distinguish between authentic and manipulated videos using temporal visual patterns.

💬 Example Usage
import torch
import numpy as np
from decord import VideoReader, cpu
from PIL import Image
from transformers import VideoMAEForVideoClassification, VideoMAEImageProcessor

model = VideoMAEForVideoClassification.from_pretrained(
    "your_username/videomae-deepfake-detector"
)

processor = VideoMAEImageProcessor.from_pretrained(
    "your_username/videomae-deepfake-detector"
)

def load_video_frames(video_path, num_frames=16):
    vr = VideoReader(video_path, ctx=cpu(0))
    total_frames = len(vr)

    indices = np.linspace(0, total_frames - 1, num_frames).astype(int)
    frames = vr.get_batch(indices).asnumpy()

    return [Image.fromarray(f) for f in frames]

@torch.no_grad()
def predict(video_path):
    frames = load_video_frames(video_path)
    inputs = processor(frames, return_tensors="pt")

    outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1)[0]

    return {
        "real": float(probs[0]),
        "fake": float(probs[1])
    }

print(predict("sample_video.mp4"))

Output example:

{'real': 0.96, 'fake': 0.04}
🧩 Intended Use

Deepfake detection in video content
Media authenticity verification
AI-generated video detection pipelines
Research on manipulated media detection
Integration into misinformation monitoring systems

⚠️ Limitations

The model was trained on a subset of FaceForensics++ and may not generalize perfectly to unseen deepfake generation techniques.

Performance may degrade on:

heavily compressed social media videos

unseen manipulation methods

partial face occlusions

extremely short clips

This model should be used as an assistive forensic tool, not as a definitive authenticity guarantee.

🧑‍💻 Developer

Author: Vansh Momaya
Institution: D. J. Sanghvi College of Engineering
Focus Area: Computer Vision, AI Safety, Deepfake Detection, Video Understanding

Email: vanshmomaya9@gmail.com

🌍 Citation

If you use this model in research or projects:

@online{momaya2025videomaedeepfake,
  author       = {Vansh Momaya},
  title        = {VideoMAE-DeepFake-Detector-v1},
  year         = {2025},
  version      = {v1},
  url          = {https://huggingface.co/Vansh180/VideoMae-deepfake-detector},
  institution  = {D. J. Sanghvi College of Engineering},
  note         = {Fine-tuned VideoMAE model for detecting deepfake videos using FaceForensics++},
  license      = {MIT}
}
🚀 Acknowledgements

VideoMAE — Base architecture for video representation learning
FaceForensics++ — Deepfake detection dataset benchmark
Hugging Face Transformers — Training and deployment framework