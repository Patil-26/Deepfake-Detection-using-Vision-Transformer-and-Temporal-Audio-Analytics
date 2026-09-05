/**
 * Video Recorder Content Script (15 seconds)
 * Step 1: User selects a region with crosshair (like image detection)
 * Step 2: 5-second countdown
 * Step 3: Records tab video for 15s
 * Step 4: Sends recording + bbox to backend for 10-frame analysis
 */

import {
  showPanel,
  updatePanelCountdown,
  updatePanelRecording,
  updatePanelResult,
  updatePanelError,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const RECORD_DURATION = 15; // 15 seconds
const OVERLAY_ID = "dg-video-overlay";
const SELECT_BOX_ID = "dg-video-select-box";
const CURSOR_CSS_ID = "dg-video-cursor-style";

let isSelecting = false;
let startX = 0, startY = 0;
let overlay: HTMLElement | null = null;
let selectBox: HTMLElement | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

// ── Listen for the result message from service worker ────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "VIDEO_CAPTURE_RESULT") {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (message.success && message.result) {
      updatePanelResult(message.result as AnalysisResult);
    } else {
      updatePanelError(
        message.error || "Video capture failed. Make sure the tab is active."
      );
    }
  }
});

// ── Entry Point ──────────────────────────────────────────────────────────────
export function startVideoRecording() {
  cleanup();
  injectCursorStyle();
  createOverlay();
}

// ── Cursor Style ─────────────────────────────────────────────────────────────
function injectCursorStyle() {
  let style = document.getElementById(CURSOR_CSS_ID) as HTMLStyleElement;
  if (!style) {
    style = document.createElement("style");
    style.id = CURSOR_CSS_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    html, html * {
      cursor: crosshair !important;
    }
  `;
}

function removeCursorStyle() {
  document.getElementById(CURSOR_CSS_ID)?.remove();
}

// ── Overlay + Drag Select ────────────────────────────────────────────────────
function createOverlay() {
  // Instruction tooltip
  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    user-select: none;
  `;

  // Instruction banner at top
  const banner = document.createElement("div");
  banner.style.cssText = `
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #2A7EFB, #1a5dc7);
    color: white;
    padding: 10px 24px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 2147483647;
    pointer-events: none;
    box-shadow: 0 4px 20px rgba(42,126,251,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  banner.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
    Drag to select the video area to record • Press ESC to cancel
  `;
  overlay.appendChild(banner);

  // Select box
  selectBox = document.createElement("div");
  selectBox.id = SELECT_BOX_ID;
  selectBox.style.cssText = `
    position: fixed;
    border: 2px solid #2A7EFB;
    background: rgba(42,126,251,0.08);
    display: none;
    pointer-events: none;
    z-index: 2147483647;
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgba(42,126,251,0.3), inset 0 0 20px rgba(42,126,251,0.05);
  `;
  document.body.appendChild(selectBox);

  overlay.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.body.appendChild(overlay);

  // ESC to cancel
  document.addEventListener("keydown", onKeyDown);
}

function onMouseDown(e: MouseEvent) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  if (selectBox) {
    selectBox.style.display = "block";
    selectBox.style.left = `${startX}px`;
    selectBox.style.top = `${startY}px`;
    selectBox.style.width = "0";
    selectBox.style.height = "0";
  }
  e.preventDefault();
}

function onMouseMove(e: MouseEvent) {
  if (!isSelecting || !selectBox) return;
  const x = Math.min(e.clientX, startX);
  const y = Math.min(e.clientY, startY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  selectBox.style.left = `${x}px`;
  selectBox.style.top = `${y}px`;
  selectBox.style.width = `${w}px`;
  selectBox.style.height = `${h}px`;
}

function onMouseUp(e: MouseEvent) {
  if (!isSelecting) return;
  isSelecting = false;

  const x = Math.min(e.clientX, startX);
  const y = Math.min(e.clientY, startY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);

  // Remove overlay + cursor
  cleanup();

  if (w < 20 || h < 20) return; // Too small, ignore

  // Calculate normalized bbox (0-1 range) relative to viewport
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const bbox = {
    x: Math.max(0, x / vw),
    y: Math.max(0, y / vh),
    w: Math.min(1, w / vw),
    h: Math.min(1, h / vh),
  };

  // Show panel near the selection
  showPanel(null, {
    x: Math.min(x + w + 12, window.innerWidth - 340),
    y: Math.max(y, 10),
  });

  // Start countdown → then record
  startCountdownThenRecord(bbox);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") cleanup();
}

// ── Countdown → Record ───────────────────────────────────────────────────────
function startCountdownThenRecord(bbox: object) {
  let count = 5;
  updatePanelCountdown(count);

  const countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval);
      beginRecording(bbox);
    } else {
      updatePanelCountdown(count);
    }
  }, 1000);
}

function beginRecording(bbox: object) {
  updatePanelRecording(0, RECORD_DURATION);

  let elapsed = 0;
  progressInterval = setInterval(() => {
    elapsed++;
    updatePanelRecording(elapsed, RECORD_DURATION);
  }, 1000);

  chrome.runtime.sendMessage(
    { type: "START_TAB_VIDEO_CAPTURE", payload: { duration: RECORD_DURATION, bbox } },
    () => {
      if (chrome.runtime.lastError) { /* expected, ignore */ }
    }
  );
}

// ── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup() {
  isSelecting = false;
  overlay?.remove();
  overlay = null;
  selectBox?.remove();
  selectBox = null;
  removeCursorStyle();
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.removeEventListener("keydown", onKeyDown);
}
