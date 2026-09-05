/**
 * Auto Cam Monitor
 * Automatically finds the largest <video> element on the page,
 * locks onto its bounding box, records 15s of tab video,
 * sends it to the backend for deepfake analysis,
 * then repeats every 60 seconds until stopped.
 */

import {
  showPanel,
  updatePanelCountdown,
  updatePanelRecording,
  updatePanelResult,
  updatePanelError,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const RECORD_DURATION = 15;
const CYCLE_INTERVAL = 60_000; // 60 seconds between scans
const BADGE_ID = "dg-cam-badge";
const OVERLAY_ID = "dg-cam-overlay";

let monitoring = false;
let cycleTimer: ReturnType<typeof setTimeout> | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let badge: HTMLElement | null = null;
let overlayVisible = false;
let trackedVideo: HTMLVideoElement | null = null;
let overlayRafId: number | null = null;

// ── Listen for results from service worker ───────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "VIDEO_CAPTURE_RESULT" && monitoring) {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (message.success && message.result) {
      updatePanelResult(message.result as AnalysisResult);
    } else {
      updatePanelError(
        message.error || "Cam monitor capture failed."
      );
    }

    // Schedule next cycle
    if (monitoring) {
      updateBadge("next");
      cycleTimer = setTimeout(() => {
        if (monitoring) runScanCycle();
      }, CYCLE_INTERVAL);
    }
  }
});

// ── Public API ───────────────────────────────────────────────────────────────
export function startCamMonitor() {
  if (monitoring) return; // Already running
  monitoring = true;
  createBadge();
  runScanCycle();
}

export function stopCamMonitor() {
  monitoring = false;
  if (cycleTimer) {
    clearTimeout(cycleTimer);
    cycleTimer = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  removeBadge();
  removeOverlay();
  trackedVideo = null;

  // Sync storage so popup reflects the correct state
  try {
    chrome.storage.session.set({ camMonitorOn: false });
  } catch {
    // Storage API not available in this context
  }
}

// ── Core Scan Cycle ──────────────────────────────────────────────────────────
function runScanCycle() {
  if (!monitoring) return;

  const video = findLargestVideo();
  if (!video) {
    updateBadge("no-video");
    trackedVideo = null;
    removeOverlay();
    // Retry in 10 seconds
    cycleTimer = setTimeout(() => {
      if (monitoring) runScanCycle();
    }, 10_000);
    return;
  }

  // Track the detected video for the overlay
  trackedVideo = video;
  if (overlayVisible) {
    showOverlay();
  }

  // Get the video's exact bounding box relative to the viewport
  const rect = video.getBoundingClientRect();
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const bbox = {
    x: Math.max(0, rect.left / vw),
    y: Math.max(0, rect.top / vh),
    w: Math.min(1, rect.width / vw),
    h: Math.min(1, rect.height / vh),
  };

  // Position the analysis panel beside the video
  showPanel(null, {
    x: Math.min(rect.right + 12, window.innerWidth - 340),
    y: Math.max(rect.top, 10),
  });

  updateBadge("scanning");

  // Quick 3s countdown then record
  let count = 3;
  updatePanelCountdown(count);

  const countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval);
      beginCamRecording(bbox);
    } else {
      updatePanelCountdown(count);
    }
  }, 1000);
}

function beginCamRecording(bbox: object) {
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

// ── Find Largest Video ───────────────────────────────────────────────────────
function findLargestVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll("video"));
  if (videos.length === 0) return null;

  // Sort by visible area (width * height), pick the largest
  let best: HTMLVideoElement | null = null;
  let bestArea = 0;

  for (const v of videos) {
    const rect = v.getBoundingClientRect();
    const area = rect.width * rect.height;
    // Must be visible and reasonably sized
    if (area > bestArea && rect.width > 50 && rect.height > 50 && !v.paused) {
      bestArea = area;
      best = v;
    }
  }

  // Fallback: if no playing video, pick largest even if paused
  if (!best) {
    for (const v of videos) {
      const rect = v.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > bestArea && rect.width > 50 && rect.height > 50) {
        bestArea = area;
        best = v;
      }
    }
  }

  return best;
}

// ── Floating Badge (persistent indicator) ────────────────────────────────────
function createBadge() {
  removeBadge();
  badge = document.createElement("div");
  badge.id = BADGE_ID;
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    background: linear-gradient(135deg, #2A7EFB, #1a5dc7);
    color: white;
    padding: 10px 18px;
    border-radius: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 4px 24px rgba(42,126,251,0.5);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: default;
    transition: all 0.3s ease;
    user-select: none;
  `;
  updateBadge("scanning");
  document.body.appendChild(badge);
}

function updateBadge(state: "scanning" | "next" | "no-video") {
  if (!badge) return;

  const icons: Record<string, string> = {
    scanning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`,
    next: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    "no-video": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  };

  const labels: Record<string, string> = {
    scanning: "🔴 Scanning...",
    next: "⏳ Next in 60s",
    "no-video": "⚠ No video found",
  };

  // Build badge content: status + eye toggle + stop button
  badge.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px;">${icons[state]} ${labels[state]}</span>
    <span style="width:1px;height:16px;background:rgba(255,255,255,0.25);margin:0 2px;"></span>
    <button id="dg-overlay-toggle" title="${overlayVisible ? 'Hide capture area' : 'Show capture area'}" style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:8px;border:none;
      background:${overlayVisible ? 'rgba(255,255,255,0.25)' : 'transparent'};
      cursor:pointer;transition:background 0.2s;
    "></button>
    <button id="dg-stop-btn" title="Stop monitoring" style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:8px;border:none;
      background:rgba(239,68,68,0.8);
      cursor:pointer;transition:background 0.2s;
    "><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>
  `;

  // Attach toggle handler
  const toggleBtn = document.getElementById("dg-overlay-toggle");
  if (toggleBtn) {
    updateOverlayToggleIcon();
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleOverlay();
    });
  }

  // Attach stop handler
  const stopBtn = document.getElementById("dg-stop-btn");
  if (stopBtn) {
    stopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      stopCamMonitor();
    });
  }
}

function removeBadge() {
  document.getElementById(BADGE_ID)?.remove();
  badge = null;
}

// ── Area Overlay (shows what region is being captured) ───────────────────────
function showOverlay() {
  removeOverlay();
  if (!trackedVideo) return;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed;
    z-index: 2147483646;
    pointer-events: none;
    border: 2.5px solid #2A7EFB;
    border-radius: 8px;
    background: rgba(42, 126, 251, 0.06);
    box-shadow: 0 0 0 1px rgba(42,126,251,0.15), inset 0 0 20px rgba(42,126,251,0.05);
    transition: left 0.15s ease, top 0.15s ease, width 0.15s ease, height 0.15s ease;
  `;

  // Corner markers
  const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
  for (const corner of corners) {
    const mark = document.createElement("div");
    const [vert, horiz] = corner.split("-");
    mark.style.cssText = `
      position: absolute;
      width: 14px;
      height: 14px;
      border-color: #2A7EFB;
      border-style: solid;
      border-width: 0;
      border-${vert}-width: 3px;
      border-${horiz}-width: 3px;
      ${vert}: -2px;
      ${horiz}: -2px;
      border-${vert === "top" ? vert : "bottom"}-${horiz === "left" ? horiz : "right"}-radius: 4px;
    `;
    overlay.appendChild(mark);
  }

  // Size label
  const label = document.createElement("div");
  label.className = "dg-overlay-label";
  label.style.cssText = `
    position: absolute;
    bottom: -26px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(42,126,251,0.9);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 6px;
    white-space: nowrap;
    letter-spacing: 0.3px;
  `;
  overlay.appendChild(label);

  // Scanning animation line
  const scanLine = document.createElement("div");
  scanLine.style.cssText = `
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2A7EFB, transparent);
    opacity: 0.6;
    animation: dg-scan-line 2s ease-in-out infinite;
  `;
  overlay.appendChild(scanLine);

  // Inject keyframes
  if (!document.getElementById("dg-overlay-keyframes")) {
    const style = document.createElement("style");
    style.id = "dg-overlay-keyframes";
    style.textContent = `
      @keyframes dg-scan-line {
        0%, 100% { top: 0; }
        50% { top: calc(100% - 2px); }
      }
      @keyframes dg-border-pulse {
        0%, 100% { border-color: #2A7EFB; box-shadow: 0 0 0 1px rgba(42,126,251,0.15), inset 0 0 20px rgba(42,126,251,0.05); }
        50% { border-color: #ef4444; box-shadow: 0 0 12px rgba(239,68,68,0.25), inset 0 0 20px rgba(239,68,68,0.05); }
      }
    `;
    document.head.appendChild(style);
  }

  overlay.style.animation = "dg-border-pulse 3s ease-in-out infinite";

  document.body.appendChild(overlay);

  // Track the video position with rAF
  function trackPosition() {
    if (!trackedVideo || !overlayVisible) {
      overlayRafId = null;
      return;
    }
    const el = document.getElementById(OVERLAY_ID);
    if (!el) {
      overlayRafId = null;
      return;
    }

    const rect = trackedVideo.getBoundingClientRect();
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;

    // Update size label
    const lbl = el.querySelector(".dg-overlay-label") as HTMLElement | null;
    if (lbl) {
      const pctW = ((rect.width / window.innerWidth) * 100).toFixed(0);
      const pctH = ((rect.height / window.innerHeight) * 100).toFixed(0);
      lbl.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}px  ·  ${pctW}% × ${pctH}% of viewport`;
    }

    overlayRafId = requestAnimationFrame(trackPosition);
  }

  overlayRafId = requestAnimationFrame(trackPosition);
}

function removeOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
  if (overlayRafId !== null) {
    cancelAnimationFrame(overlayRafId);
    overlayRafId = null;
  }
}

function toggleOverlay() {
  overlayVisible = !overlayVisible;
  if (overlayVisible && trackedVideo) {
    showOverlay();
  } else {
    removeOverlay();
  }
  // Update toggle button appearance
  updateOverlayToggleIcon();
}

function updateOverlayToggleIcon() {
  const btn = document.getElementById("dg-overlay-toggle");
  if (!btn) return;
  btn.style.background = overlayVisible ? "rgba(255,255,255,0.25)" : "transparent";
  btn.title = overlayVisible ? "Hide capture area" : "Show capture area";
  btn.innerHTML = overlayVisible
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}
