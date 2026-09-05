/**
 * Offscreen Document Script
 * Runs in a separate offscreen context that has access to getUserMedia.
 * Gets tab stream by streamId, records audio, uploads to backend.
 */

const BACKEND_AUDIO = "http://127.0.0.1:8000/analyze/audio";
const BACKEND_VIDEO = "http://127.0.0.1:8000/analyze/clip";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OFFSCREEN_RECORD_AUDIO") {
    recordTabStream(message.payload.streamId, message.payload.duration, false, message.payload.bbox)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
  
  if (message.type === "OFFSCREEN_RECORD_VIDEO") {
    recordTabStream(message.payload.streamId, message.payload.duration, true, message.payload.bbox)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function recordTabStream(streamId: string, durationSec: number, recordVideo: boolean, bbox?: object) {
  // Get media stream using the streamId from tabCapture
  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: recordVideo ? {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    } : false,
  });

  // Collect recorded chunks
  const chunks: Blob[] = [];
  const mimeType = recordVideo ? "video/webm;codecs=vp8,opus" : "audio/webm;codecs=opus";
  const recorder = new MediaRecorder(stream, { 
    mimeType,
    videoBitsPerSecond: 8000000 // 8 Mbps to preserve fine AI grain
  });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // Start recording
  recorder.start(100); // collect every 100ms

  // Stop after duration
  await new Promise<void>((resolve) => setTimeout(resolve, durationSec * 1000));

  // Stop recorder
  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
    recorder.stop();
  });

  // Stop all tracks
  stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());

  // Assemble blob
  const mediaBlob = new Blob(chunks, { type: recordVideo ? "video/webm" : "audio/webm" });
  if (mediaBlob.size < 1000) {
    return { success: false, error: "Recording too short. Ensure tab is playing." };
  }

  // Upload to backend
  const formData = new FormData();
  formData.append("file", mediaBlob, "recording.webm");
  if (bbox) {
    formData.append("bbox", JSON.stringify(bbox));
  }

  const endpoint = recordVideo ? BACKEND_VIDEO : BACKEND_AUDIO;
  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: `Backend error ${res.status}: ${text}` };
  }

  const result = await res.json();
  return { success: true, result };
}
