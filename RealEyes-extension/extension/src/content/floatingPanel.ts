/**
 * Floating Analysis Panel
 * Redesigned to match the DeepGuard popup UI:
 * white background, #2A7EFB blue, Poppins font, slate grays.
 */

import type { AnalysisResult } from "../shared/types";
import panelStyles from "./floatingPanel.css?inline";

const PANEL_ID = "deepguard-panel";
const PANEL_CSS_ID = "deepguard-panel-styles";

// ── Styles ────────────────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById(PANEL_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = PANEL_CSS_ID;
  style.textContent = panelStyles;
  document.head.appendChild(style);
}

// ── Panel HTML helpers ─────────────────────────────────────────────────────────
function headerHTML(logoUrl: string) {
  return `
    <div class="dg-header">
      <div class="dg-header-left">
        <div class="dg-logo"><img src="${logoUrl}" alt="DeepGuard" /></div>
        <div>
          <div class="dg-title">DeepGuard</div>
        </div>
      </div>
      <button class="dg-close" id="dg-close-btn" title="Close">✕</button>
    </div>
  `;
}

function loadingHTML() {
  return `
    <div class="dg-loading">
      <div class="dg-orbital">
        <svg class="dg-orbital-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dg-comet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#2A7EFB" stop-opacity="0"/>
              <stop offset="60%"  stop-color="#2A7EFB" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#2A7EFB" stop-opacity="1"/>
            </linearGradient>
          </defs>
          <circle class="dg-orbital-track" cx="80" cy="80" r="68"/>
          <circle class="dg-orbital-comet" cx="80" cy="80" r="68"
            stroke-dasharray="140 290"
          />
        </svg>
        <div class="dg-orbital-center">
          <span class="dg-orbital-label">Loading</span>
        </div>
      </div>
    </div>
  `;
}

// ── Panel Management ──────────────────────────────────────────────────────────
export function showPanel(anchorEl?: Element | null, position?: { x: number; y: number }) {
  injectStyles();
  removePanel();

  const logoUrl = chrome.runtime.getURL("icons/icon128.png");
  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  if (position) {
    panel.style.left = `${Math.min(position.x, window.innerWidth - 320)}px`;
    panel.style.top  = `${Math.min(position.y, window.innerHeight - 100)}px`;
  } else if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const left = Math.min(rect.right + 10, window.innerWidth - 320);
    const top  = Math.max(rect.top, 10);
    panel.style.left = `${left + window.scrollX}px`;
    panel.style.top  = `${top  + window.scrollY}px`;
    panel.style.position = "absolute";
  } else {
    panel.style.right = "20px";
    panel.style.top   = "80px";
  }

  panel.innerHTML = `
    ${headerHTML(logoUrl)}
    <div class="dg-body">${loadingHTML()}</div>
  `;

  document.body.appendChild(panel);
  makeDraggable(panel);
  document.getElementById("dg-close-btn")?.addEventListener("click", removePanel);
  return panel;
}

export function removePanel() {
  document.getElementById(PANEL_ID)?.remove();
}

export function updatePanelCountdown(count: number) {
  const body = document.querySelector(`#${PANEL_ID} .dg-body`);
  if (!body) return;
  body.innerHTML = `
    <div class="dg-countdown">
      <div class="dg-countdown-num">${count}</div>
      <div class="dg-countdown-label">Recording starts in ${count} second${count !== 1 ? "s" : ""}</div>
    </div>
  `;
}

export function updatePanelRecording(elapsed: number, total: number) {
  const body = document.querySelector(`#${PANEL_ID} .dg-body`);
  if (!body) return;

  const remaining = Math.max(0, total - elapsed);
  const isAnalyzing = elapsed >= total;

  body.innerHTML = `
    <div class="dg-recording">
      <div class="dg-rec-dot" ${isAnalyzing ? 'style="background-color: #f59e0b; animation: none;"' : ''}></div>
      <div class="dg-rec-label">${isAnalyzing ? '⏳ Analyzing AI...' : '🎙️ Recording…'}</div>
      <div class="dg-rec-time">${isAnalyzing ? 'Please wait' : remaining + 's remaining'}</div>
      <div class="dg-rec-bar">
        <div class="dg-rec-bar-fill" style="width: ${isAnalyzing ? '100' : (elapsed / total) * 100}%"></div>
      </div>
    </div>
  `;
}

export function updatePanelLoading() {
  const body = document.querySelector(`#${PANEL_ID} .dg-body`);
  if (!body) return;
  body.innerHTML = loadingHTML();
}

export function updatePanelResult(result: AnalysisResult) {
  const body = document.querySelector(`#${PANEL_ID} .dg-body`);
  if (!body) return;

  const isFake      = result.label === "FAKE";
  const score       = result.confidence;
  const r           = 52;
  const circumference = 2 * Math.PI * r;           // ≈ 326.73
  const targetOffset  = circumference * (1 - score / 100);
  const strokeColor   = isFake ? "#ef4444" : "#22c55e";

  // Render with ring starting fully empty (offset = circumference = 0% fill)
  // The score label starts at 0 and counts up via JS
  body.innerHTML = `
    <div class="dg-score-wrapper">
      <div class="dg-ring-container">
        <svg class="dg-ring-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dg-ring-grad-fake" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stop-color="#f97316"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
            <linearGradient id="dg-ring-grad-real" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stop-color="#22c55e"/>
              <stop offset="100%" stop-color="#2A7EFB"/>
            </linearGradient>
          </defs>
          <circle class="dg-ring-track" cx="60" cy="60" r="${r}"/>
          <circle
            class="dg-ring-fill"
            id="dg-ring-anim"
            cx="60" cy="60" r="${r}"
            stroke="${isFake ? "url(#dg-ring-grad-fake)" : "url(#dg-ring-grad-real)"}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
          />
        </svg>
        <div class="dg-ring-label">
          <span class="dg-ring-score" id="dg-score-num" style="color:${strokeColor}">0</span>
          <span class="dg-ring-pct">% confidence</span>
        </div>
      </div>

      <div class="dg-score-meta">
        <div class="dg-verdict ${isFake ? "fake" : "real"}">
          ${isFake ? "⚠ DEEPFAKE" : "✓ AUTHENTIC"}
        </div>
      </div>
    </div>

    <div class="dg-bars">
      <div class="dg-bar-row">
        <div class="dg-bar-label">
          <span>Fake Probability</span>
          <span id="dg-fake-pct">0%</span>
        </div>
        <div class="dg-bar-track">
          <div class="dg-bar-fill fake" id="dg-fake-bar" style="width:0%"></div>
        </div>
      </div>
      <div class="dg-bar-row">
        <div class="dg-bar-label">
          <span>Real Probability</span>
          <span id="dg-real-pct">0%</span>
        </div>
        <div class="dg-bar-track">
          <div class="dg-bar-fill real" id="dg-real-bar" style="width:0%"></div>
        </div>
      </div>
    </div>

    <div class="dg-divider"></div>

    <div class="dg-section-label">Detailed Analysis</div>
    <div class="dg-analysis-list">
      ${result.details.analysis_points
        .map(
          (pt) => `
        <div class="dg-analysis-item">
          <div class="dg-check ${isFake ? "warn" : "ok"}">${isFake ? "!" : "✓"}</div>
          <span>${pt}</span>
        </div>`
        )
        .join("")}
    </div>
  `;

  // ── Animate everything after TWO rAFs so the browser has painted
  // the initial state (ring fully empty, bars at 0) before we apply
  // the target values and trigger CSS transitions.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 1. Animate the donut ring
      const ring = document.getElementById("dg-ring-anim") as SVGCircleElement | null;
      if (ring) {
        ring.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
        ring.style.strokeDashoffset = String(targetOffset);
      }

      // 2. Animate the progress bars
      const fakeBar  = document.getElementById("dg-fake-bar")  as HTMLElement | null;
      const realBar  = document.getElementById("dg-real-bar")  as HTMLElement | null;
      if (fakeBar) fakeBar.style.width = `${result.scores.FAKE}%`;
      if (realBar) realBar.style.width = `${result.scores.REAL}%`;

      // 3. Count-up animation for score number and bar labels
      const DURATION = 1200; // ms — matches ring transition
      const startTime = performance.now();

      const scoreEl    = document.getElementById("dg-score-num");
      const fakePctEl  = document.getElementById("dg-fake-pct");
      const realPctEl  = document.getElementById("dg-real-pct");

      function easeOut(t: number) {
        return 1 - Math.pow(1 - t, 3);
      }

      function tick(now: number) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased    = easeOut(progress);

        const currentScore    = eased * score;
        const currentFakePct  = eased * result.scores.FAKE;
        const currentRealPct  = eased * result.scores.REAL;

        if (scoreEl)   scoreEl.textContent   = currentScore.toFixed(1);
        if (fakePctEl) fakePctEl.textContent  = currentFakePct.toFixed(1) + "%";
        if (realPctEl) realPctEl.textContent  = currentRealPct.toFixed(1) + "%";

        if (progress < 1) requestAnimationFrame(tick);
        else {
          // snap to final values
          if (scoreEl)   scoreEl.textContent   = score.toFixed(1);
          if (fakePctEl) fakePctEl.textContent  = result.scores.FAKE.toFixed(1) + "%";
          if (realPctEl) realPctEl.textContent  = result.scores.REAL.toFixed(1) + "%";
        }
      }

      requestAnimationFrame(tick);
    });
  });
}

export function updatePanelError(message: string) {
  const body = document.querySelector(`#${PANEL_ID} .dg-body`);
  if (!body) return;
  body.innerHTML = `
    <div style="text-align:center; padding: 14px 0; color: #ef4444;">
      <div style="font-size: 26px; margin-bottom: 8px;">⚠️</div>
      <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px; color:#1e293b;">Analysis Failed</div>
      <div style="font-size: 10.5px; color: #94a3b8;">${message}</div>
    </div>
  `;
}

// ── Draggable ─────────────────────────────────────────────────────────────────
function makeDraggable(el: HTMLElement) {
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  el.addEventListener("mousedown", (e: MouseEvent) => {
    if ((e.target as HTMLElement).id === "dg-close-btn") return;
    el.classList.add("dragging");
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(el.style.left || "0", 10);
    startTop  = parseInt(el.style.top  || "0", 10);

    const move = (e: MouseEvent) => {
      el.style.left  = `${startLeft + e.clientX - startX}px`;
      el.style.top   = `${startTop  + e.clientY - startY}px`;
      el.style.right = "auto";
    };
    const up = () => {
      el.classList.remove("dragging");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup",   up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup",   up);
    e.preventDefault();
  });
}