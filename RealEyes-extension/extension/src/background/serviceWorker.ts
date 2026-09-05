/**
 * DeepGuard Background Service Worker (MV3)
 * Handles all API calls to the backend and tab audio capture.
 * Receives messages from content scripts and sends back results.
 */

import {
  analyzeImageUrl,
  analyzeImageBase64,
} from "../shared/api";

// ── Message Routing ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {

        // ── Scanner State (Feature 1) ──────────────────────────────────────────

        // Popup reads current scanner state on open
        case "GET_SCANNER_STATE": {
          const data = await chrome.storage.session.get("scannerOn");
          sendResponse({ on: !!data.scannerOn });
          break;
        }

        // Popup toggles the scanner — persist + broadcast to active tab
        case "SET_SCANNER_STATE": {
          const on: boolean = message.payload?.on ?? false;

          // Save state globally
          await chrome.storage.session.set({ scannerOn: on });

          // Get ALL tabs (all windows)
          const tabs = await chrome.tabs.query({});

          for (const tab of tabs) {
            if (!tab.id) continue;

            try {
              // Try sending message first
              await chrome.tabs.sendMessage(tab.id, {
                type: on ? "SCANNER_ON" : "SCANNER_OFF",
              });

            } catch {
              // If content script not injected yet → inject it
              try {
                await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ["content.js"],
                });

                // Small delay to ensure script initializes
                await new Promise(r => setTimeout(r, 50));

                await chrome.tabs.sendMessage(tab.id, {
                  type: on ? "SCANNER_ON" : "SCANNER_OFF",
                });

              } catch {
                // Not injectable (chrome://, edge://, webstore, etc.)
                // Ignore safely
              }
            }
          }

          sendResponse({ ok: true });
          break;
        }

        // ── Feature 1: Analyze image by URL ───────────────────────────────────
        case "ANALYZE_IMAGE_URL": {
          const result = await analyzeImageUrl(message.payload.url);
          sendResponse(result);
          break;
        }

        // ── Feature 1: Analyze image by base64 (cross-origin fallback) ────────
        case "ANALYZE_IMAGE_BASE64": {
          const result = await analyzeImageBase64(message.payload.base64);
          sendResponse(result);
          break;
        }

        // ── Feature 2: Capture visible tab region + analyze ───────────────────
        case "CAPTURE_REGION": {
          const { x, y, w, h } = message.payload;
          const tabId = sender.tab?.id;
          if (!tabId) { sendResponse({ error: "No tab id" }); break; }

          const dataUrl = await captureTabScreenshot(tabId);
          const cropped = await cropImage(dataUrl, x, y, w, h);
          sendResponse({ base64: cropped });
          break;
        }

        // ── Feature 3: Record tab audio and analyze ───────────────────────────
        case "START_TAB_AUDIO_CAPTURE": {
          const tabId = sender.tab?.id;
          if (!tabId) { sendResponse({ success: false, error: "No tab id" }); break; }

          sendResponse({ ok: true });

          captureTabMedia(tabId, message.payload.duration || 10, false, message.payload.bbox)
            .then((result) => {
              chrome.tabs.sendMessage(tabId, { type: "AUDIO_CAPTURE_RESULT", ...result });
            })
            .catch((err) => {
              chrome.tabs.sendMessage(tabId, {
                type: "AUDIO_CAPTURE_RESULT", success: false,
                error: err instanceof Error ? err.message : "Audio capture failed",
              });
            });
          break;
        }

        // ── Feature 4: Record tab VIDEO and analyze ───────────────────────────
        case "START_TAB_VIDEO_CAPTURE": {
          const tabId = sender.tab?.id;
          if (!tabId) { sendResponse({ success: false, error: "No tab id" }); break; }

          sendResponse({ ok: true });

          captureTabMedia(tabId, message.payload.duration || 15, true, message.payload.bbox)
            .then((result) => {
              chrome.tabs.sendMessage(tabId, { type: "VIDEO_CAPTURE_RESULT", ...result });
            })
            .catch((err) => {
              chrome.tabs.sendMessage(tabId, {
                type: "VIDEO_CAPTURE_RESULT", success: false,
                error: err instanceof Error ? err.message : "Video capture failed",
              });
            });
          break;
        }

        default:
          sendResponse({ ok: true });
      }
    } catch (err) {
      sendResponse({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  })();
  return true; // Keep message channel open for async response
});

// ── Tab Screenshot ─────────────────────────────────────────────────────────────
async function captureTabScreenshot(tabId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!dataUrl) return reject(new Error("captureVisibleTab returned no data"));
        resolve(dataUrl);
      }
    );
  });
}

// ── Image Cropping ─────────────────────────────────────────────────────────────
async function cropImage(
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, x, y, w, h, 0, 0, w, h);

  const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
  return await blobToBase64(croppedBlob);
}

// ── Tab Media Capture ──────────────────────────────────────────────────────────
async function captureTabMedia(tabId: number, durationSec: number, recordVideo: boolean, bbox?: object): Promise<object> {
  return new Promise((resolve) => {
    // Get generic stream ID for tab
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, async (streamId) => {
      if (chrome.runtime.lastError || !streamId) {
        resolve({
          success: false,
          error: chrome.runtime.lastError?.message || "Could not get tab media stream",
        });
        return;
      }

      try {
        await ensureOffscreenDocument();

        const result = await new Promise<object>((res) => {
          chrome.runtime.sendMessage(
            {
              type: recordVideo ? "OFFSCREEN_RECORD_VIDEO" : "OFFSCREEN_RECORD_AUDIO",
              payload: { streamId, duration: durationSec, bbox },
            },
            (r) => res(r)
          );
        });

        resolve(result);
      } catch (err) {
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Media capture failed",
        });
      }
    });
  });
}

// ── Offscreen Document ─────────────────────────────────────────────────────────
const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");

async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: "Record tab audio for deepfake detection",
    });
  }
}

// ── Utility ────────────────────────────────────────────────────────────────────
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
