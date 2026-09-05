/**
 * DeepGuard Image Scanner — Simplified Version
 * - Injects guard icon inside image parent
 * - Works on dynamic websites
 * - Clean ON/OFF toggle
 * - No complex observers or fixed positioning
 */

import {
  showPanel,
  updatePanelResult,
  updatePanelError,
  removePanel,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const BADGE_ATTR = "data-dg-injected";
const MIN_SIZE = 80;

let active = false;
let observer: MutationObserver | null = null;

// ─────────────────────────────────────────────
export function enableScanner() {
  if (active) return;
  active = true;

  scanAllImages();
  startObserver();
}

// ─────────────────────────────────────────────
export function disableScanner() {
  active = false;

  observer?.disconnect();
  observer = null;

  // Remove all injected badges
  document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((img) => {
    img.removeAttribute(BADGE_ATTR);
  });

  document
    .querySelectorAll(".dg-guard-badge")
    .forEach((el) => el.remove());

  removePanel();
}

// ─────────────────────────────────────────────
// Scan existing images
function scanAllImages() {
  document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      injectBadge(img);
    } else {
      img.addEventListener("load", () => injectBadge(img), { once: true });
    }
  });
}

// ─────────────────────────────────────────────
// Inject guard badge
function injectBadge(img: HTMLImageElement) {
  if (!active) return;

  if (
    img.hasAttribute(BADGE_ATTR) ||
    img.width < MIN_SIZE ||
    img.height < MIN_SIZE ||
    !img.src ||
    img.src.startsWith("data:image/svg")
  ) {
    return;
  }

  img.setAttribute(BADGE_ATTR, "true");

  const badge = document.createElement("div");
  badge.className = "dg-guard-badge";

  badge.style.cssText = `
    position: absolute;
    bottom: 6px;
    right: 6px;
    z-index: 2147483647;
    cursor: pointer;
    transition: transform 0.15s ease;
  `;

  let badgeContent: string;
  try {
    const logoUrl = chrome.runtime.getURL("icons/icon128.png");
    badgeContent = `<img src="${logoUrl}" alt="DeepGuard" style="width:18px;height:20px;display:block;border-radius:4px;" />`;
  } catch {
    // Fallback: inline SVG shield icon if extension context is invalid
    badgeContent = `<svg viewBox="0 0 24 24" width="18" height="20" fill="#2A7EFB"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/></svg>`;
  }
  badge.innerHTML = badgeContent;

  badge.addEventListener("mouseenter", () => {
    badge.style.transform = "scale(1.1)";
  });

  badge.addEventListener("mouseleave", () => {
    badge.style.transform = "scale(1)";
  });

  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    analyzeImage(img);
  });

  // Ensure parent can position absolute children
  const parent = img.parentElement;
  if (!parent) return;

  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  parent.appendChild(badge);
}

// ─────────────────────────────────────────────
// Watch for dynamically added images
function startObserver() {
  observer = new MutationObserver((mutations) => {
    if (!active) return;

    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;

        const el = node as Element;

        if (el.tagName === "IMG") {
          injectBadge(el as HTMLImageElement);
        }

        el.querySelectorAll?.("img").forEach((img) =>
          injectBadge(img as HTMLImageElement)
        );
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ─────────────────────────────────────────────
// Image analysis
async function analyzeImage(img: HTMLImageElement) {
  showPanel(img);

  try {
    let result: AnalysisResult;

    try {
      result = await analyzeViaUrl(img.currentSrc || img.src);
    } catch {
      result = await analyzeViaCanvas(img);
    }

    updatePanelResult(result);
  } catch (err) {
    updatePanelError(
      err instanceof Error ? err.message : "Analysis failed."
    );
  }
}

// ─────────────────────────────────────────────
function analyzeViaUrl(url: string): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "ANALYZE_IMAGE_URL", payload: { url } },
      (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (res?.success) resolve(res);
        else reject(new Error(res?.error || "Backend error"));
      }
    );
  });
}

// ─────────────────────────────────────────────
function analyzeViaCanvas(
  img: HTMLImageElement
): Promise<AnalysisResult> {
  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0);

  const base64 = canvas.toDataURL("image/png");

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "ANALYZE_IMAGE_BASE64", payload: { base64 } },
      (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (res?.success) resolve(res);
        else reject(new Error(res?.error || "Backend error"));
      }
    );
  });
}