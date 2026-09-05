// API helpers to call the DeepGuard backend from the service worker

const BASE_URL = "http://127.0.0.1:8000/analyze";

export async function analyzeImageUrl(imageUrl: string) {
  const formData = new FormData();
  formData.append("url", imageUrl);
  const res = await fetch(`${BASE_URL}/image-url`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function analyzeImageBase64(base64: string) {
  const res = await fetch(`${BASE_URL}/image-base64`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, mime: "image/png" }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}



export async function analyzeAudioBlob(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  const res = await fetch(`${BASE_URL}/audio`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
