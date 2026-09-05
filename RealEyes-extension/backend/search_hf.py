import requests, json

url = "https://huggingface.co/api/models"
queries = ["deepfake", "AI video", "sora", "generative video", "fake image"]

found = []
for q in queries:
    r = requests.get(url, params={"search": q, "sort": "downloads", "direction": -1, "limit": 20})
    if r.status_code == 200:
        found.extend(r.json())

seen = set()
for m in found:
    model_id = m["id"]
    if model_id not in seen:
        seen.add(model_id)
        # Check if it has an image or video tag
        tags = [t for t in m.get("tags", []) if "video" in t.lower() or "image" in t.lower()]
        dl = m.get("downloads", 0)
        likes = m.get("likes", 0)
        # Filter for models that have at least some downloads and are relevant
        if dl > 100:
            print(f"{model_id:50s} DL: {dl:7d} Likes: {likes:4d} Tags: {','.join(tags[:3])}")
