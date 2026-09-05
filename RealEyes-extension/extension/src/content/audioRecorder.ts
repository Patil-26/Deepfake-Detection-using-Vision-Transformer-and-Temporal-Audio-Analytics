/**
 * Audio Recorder Content Script (Feature 3)
 * Shows countdown (5→0), then records tab audio for 10 seconds.
 * Uses offscreen document for MediaRecorder API.
 * 
 * Uses fire-and-forget pattern: sends START_TAB_AUDIO_CAPTURE without
 * waiting for response. Listens for AUDIO_CAPTURE_RESULT message instead.
 */

import {
  showPanel,
  updatePanelCountdown,
  updatePanelRecording,
  updatePanelResult,
  updatePanelError,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const RECORD_DURATION = 10; // seconds to record

let progressInterval: ReturnType<typeof setInterval> | null = null;

// Listen for the result message from service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "AUDIO_CAPTURE_RESULT") {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (message.success && message.result) {
      updatePanelResult(message.result as AnalysisResult);
    } else {
      updatePanelError(
        message.error || "Audio capture failed. Make sure the tab is playing audio."
      );
    }
  }
});

export function startAudioRecording() {
  // Show panel center-right
  showPanel(null, { x: window.innerWidth - 350, y: 80 });

  let count = 5;
  updatePanelCountdown(count);

  const countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval);
      beginRecording();
    } else {
      updatePanelCountdown(count);
    }
  }, 1000);
}

function beginRecording() {
  updatePanelRecording(0, RECORD_DURATION);

  let elapsed = 0;
  progressInterval = setInterval(() => {
    elapsed++;
    updatePanelRecording(elapsed, RECORD_DURATION);
  }, 1000);

  // Fire-and-forget: don't wait for response through message channel.
  // The service worker will send AUDIO_CAPTURE_RESULT back when done.
  chrome.runtime.sendMessage(
    { type: "START_TAB_AUDIO_CAPTURE", payload: { duration: RECORD_DURATION } },
    () => {
      // Suppress "message channel closed" error
      if (chrome.runtime.lastError) { /* expected, ignore */ }
    }
  );
}
