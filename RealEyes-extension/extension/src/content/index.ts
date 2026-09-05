/**
 * Content Script Entry Point
 * Listens for messages from the popup/service worker and delegates
 * to the appropriate feature module.
 */

import { enableScanner, disableScanner } from "./imageScanner";
import { activateRegionSelector } from "./regionSelector";
import { startAudioRecording } from "./audioRecorder";
import { startVideoRecording } from "./videoRecorder";
import { startCamMonitor, stopCamMonitor } from "./camMonitor";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "SCANNER_ON":
      enableScanner();
      break;

    case "SCANNER_OFF":
      disableScanner();
      break;

    case "START_REGION_SELECT":
      activateRegionSelector();
      break;

    case "START_AUDIO_RECORD":
      startAudioRecording();
      break;

    case "START_VIDEO_RECORD":
      startVideoRecording();
      break;

    case "START_CAM_MONITOR":
      startCamMonitor();
      break;

    case "STOP_CAM_MONITOR":
      stopCamMonitor();
      break;

    default:
      break;
  }
  sendResponse({ ok: true });
  return true;
});

try {
  chrome.storage.session.get("scannerOn", (data) => {
    if (chrome.runtime.lastError) return;
    if (data?.scannerOn) {
      enableScanner();
    }
  });
} catch {
  // Storage API not available in this context
}

// Auto-restart cam monitor if it was active before navigation
try {
  chrome.storage.session.get("camMonitorOn", (data) => {
    if (chrome.runtime.lastError) return;
    if (data?.camMonitorOn) {
      startCamMonitor();
    }
  });
} catch {
  // Storage API not available in this context
}
