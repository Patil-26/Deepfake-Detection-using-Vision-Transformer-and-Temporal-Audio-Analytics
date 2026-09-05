/**
 * Region Selector Content Script (Feature 2)
 * Turns cursor into a crosshair, lets user drag to select any region.
 * Captures selected area and sends to backend for real-time analysis.
 */

import {
  showPanel,
  updatePanelResult,
  updatePanelError,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const OVERLAY_ID = "dg-region-overlay";
const SELECT_BOX_ID = "dg-select-box";
const CURSOR_CSS_ID = "dg-cursor-style";

let isSelecting = false;
let startX = 0, startY = 0;
let overlay: HTMLElement | null = null;
let selectBox: HTMLElement | null = null;
let realtimeInterval: number | null = null;

// ── Activate ────────────────────────────────────────────────────────────────
export function activateRegionSelector() {
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

// ── Overlay + Drag Select ─────────────────────────────────────────────────────
function createOverlay() {
  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    user-select: none;
  `;

  // Select box
  selectBox = document.createElement("div");
  selectBox.id = SELECT_BOX_ID;
  selectBox.style.cssText = `
    position: fixed;
    border: 2px solid #6C63FF;
    background: rgba(108,99,255,0.08);
    display: none;
    pointer-events: none;
    z-index: 2147483647;
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgba(108,99,255,0.3), inset 0 0 20px rgba(108,99,255,0.05);
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

async function onMouseUp(e: MouseEvent) {
  if (!isSelecting) return;
  isSelecting = false;

  const x = Math.min(e.clientX, startX);
  const y = Math.min(e.clientY, startY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);

  cleanup();

  if (w < 20 || h < 20) return; // Too small, ignore

  // Show panel at right side of selection
  const panel = showPanel(null, {
    x: Math.min(x + w + 12, window.innerWidth - 340),
    y: Math.max(y, 10),
  });

  await startRealtimeAnalysis(x, y, w, h);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") cleanup();
}

// ── Real-time Analysis ────────────────────────────────────────────────────────
async function startRealtimeAnalysis(x: number, y: number, w: number, h: number) {
  let frameCount = 0;
  const maxFrames = 5;

  const captureAndAnalyze = async () => {
    frameCount++;
    if (frameCount > maxFrames) {
      stopRealtime();
      return;
    }

    try {
      // Capture visible tab via service worker, then crop
      const base64 = await captureRegion(x, y, w, h);
      const result: AnalysisResult = await analyzeFrame(base64);
      updatePanelResult(result);
    } catch (err) {
      updatePanelError(
        err instanceof Error ? err.message : "Region capture failed"
      );
      stopRealtime();
    }
  };

  // Run immediately then every 2 seconds (real-time feel)
  await captureAndAnalyze();
  realtimeInterval = window.setInterval(captureAndAnalyze, 2000);
}

function stopRealtime() {
  if (realtimeInterval !== null) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
}

async function captureRegion(x: number, y: number, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "CAPTURE_REGION", payload: { x, y, w, h } },
      (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (response?.base64) resolve(response.base64);
        else reject(new Error(response?.error || "Capture failed"));
      }
    );
  });
}

async function analyzeFrame(base64: string): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "ANALYZE_IMAGE_BASE64", payload: { base64 } },
      (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (response?.success) resolve(response);
        else reject(new Error(response?.error || "Analysis failed"));
      }
    );
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
function cleanup() {
  isSelecting = false;
  stopRealtime();
  overlay?.remove();
  overlay = null;
  selectBox?.remove();
  selectBox = null;
  removeCursorStyle();
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.removeEventListener("keydown", onKeyDown);
}
