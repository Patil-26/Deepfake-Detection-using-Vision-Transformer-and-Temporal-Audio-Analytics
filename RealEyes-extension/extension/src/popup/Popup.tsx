import { useState, useEffect } from "react";
import "./Popup.css";

type Feature = "idle" | "scanning" | "region" | "recording";
type RecordState = "idle" | "countdown" | "recording" | "done";

export default function Popup() {
  const [scannerOn, setScannerOn] = useState(false);
  const [feature, setFeature] = useState<Feature>("idle");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState("Ready to detect deepfakes");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [camMonitorOn, setCamMonitorOn] = useState(false);

  /**
   * Ensures the content script is injected into the active tab, then sends
   * the given message. Handles restricted pages (chrome://, edge://, etc.)
   * gracefully instead of throwing "Receiving end does not exist".
   */
  const sendToActiveTab = async (message: object) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      // Content script not injected yet — inject it first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        // Small delay to let script initialize
        await new Promise((r) => setTimeout(r, 100));
        await chrome.tabs.sendMessage(tab.id, message);
      } catch {
        // Tab is a restricted page (chrome://, webstore, etc.)
        // Nothing we can do here
      }
    }
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_SCANNER_STATE" }, (res) => {
      if (chrome.runtime.lastError) return; // Suppress error
      if (res?.on) {
        setScannerOn(true);
        setStatus("Image scanner active");
      }
    });

    chrome.storage.session.get("camMonitorOn", (res) => {
      if (chrome.runtime.lastError) return;
      if (res?.camMonitorOn) {
        setCamMonitorOn(true);
      }
    });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((r) => r.ok && setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const handleScannerToggle = () => {
    const next = !scannerOn;
    setScannerOn(next);
    setStatus(next ? "Image scanner active" : "Image scanner off");
    chrome.runtime.sendMessage({ type: "SET_SCANNER_STATE", payload: { on: next } });
  };

  const handleRegionDetect = async () => {
    setStatus("Select a region on the page...");
    await sendToActiveTab({ type: "START_REGION_SELECT" });
    window.close();
  };

  const handleAudioRecord = async () => {
    setRecordState("countdown");
    setCountdown(5);
    setStatus("Get ready... recording starts soon");
        await sendToActiveTab({ type: "START_AUDIO_RECORD" });
    window.close();
  };

  const handleVideoRecord = async () => {
    setRecordState("countdown");
    setCountdown(5);
    setStatus("Get ready... video recording starts soon");
    await sendToActiveTab({ type: "START_VIDEO_RECORD" });
    window.close();
  };

  const handleCamMonitorToggle = async () => {
    const next = !camMonitorOn;
    setCamMonitorOn(next);
    await chrome.storage.session.set({ camMonitorOn: next });
    
    if (next) {
      setStatus("Cam Monitor activated — scanning every 60s");
      await sendToActiveTab({ type: "START_CAM_MONITOR" });
    } else {
      setStatus("Cam Monitor stopped");
      await sendToActiveTab({ type: "STOP_CAM_MONITOR" });
    }
    // Close popup after message is fully delivered
    setTimeout(() => window.close(), 600);
  };

  return (
    <div className="w-[350px] min-h-[580px] bg-deepBase flex flex-col gap-3 font-sans">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex-shrink-0">
            <img src="icons/icon128.png" alt="RealEyes" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[20px] font-bold tracking-tight text-deepRed">RealEyes</span>
            <span className="text-[10px] text-textMuted font-medium">AI Deepfake Detector</span>
          </div>
        </div>

        {/* Backend pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-deepBorder bg-deepCard">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOk === true ? 'bg-deepGreen' : backendOk === false ? 'bg-deepRed' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-[10px] font-semibold text-textMuted">
            {backendOk === true ? 'Online' : backendOk === false ? 'Offline' : '...'}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-deepBorder mx-4" />

      {/* ── Feature cards ── */}
      <div className="flex flex-col gap-2 p-[13px] pt-0">

        {/* Card 1 — Image Scanner */}
        <div className={`rounded-xl border p-3.5 transition-colors ${
          scannerOn
            ? "bg-deepRed/5 border-deepRed/30"
            : "bg-deepCard border-deepBorder"
        }`}>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${scannerOn ? 'bg-deepRed/20' : 'bg-deepBorder'}`}>
              <svg className={`w-[17px] h-[17px] ${scannerOn ? 'text-deepRed' : 'text-textMuted'}`} viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white">Activate RealEyes</h3>
              <p className="text-[11px] text-textMuted">Identify deepfakes in seconds</p>
            </div>
            {/* Toggle */}
            <button
              onClick={handleScannerToggle}
              disabled={backendOk === false}
              aria-label="Toggle image scanner"
              className={`relative w-[42px] h-[23px] rounded-full border-none cursor-pointer flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                scannerOn ? "bg-deepRed" : "bg-deepBorder"
              }`}
            >
              <span className={`absolute top-[3px] w-[17px] h-[17px] rounded-full bg-white transition-all duration-200 ${
                scannerOn ? "left-[22px]" : "left-[3px]"
              }`} />
            </button>
          </div>
          {scannerOn && (
            <ul className="mt-2.5 px-2.5 py-1 flex flex-col gap-1 list-none">
              <li className="scanner-item flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1 h-1 rounded-full bg-deepRed flex-shrink-0" />
                Shield icons appear on every image on the page.
              </li>
              <li className="scanner-item flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1 h-1 rounded-full bg-deepRed flex-shrink-0" />
                Click any shield to instantly check if it's a deepfake.
              </li>
              <li className="scanner-item flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1 h-1 rounded-full bg-deepRed flex-shrink-0" />
                Results are shown in real time as you browse.
              </li>
            </ul>
          )}
        </div>

        {/* Card 2 — Real-time Region */}
        <div className="bg-deepCard border border-deepBorder rounded-xl p-3.5 hover:border-deepRed/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-deepBorder flex items-center justify-center flex-shrink-0">
              <svg className="w-[17px] h-[17px] text-textMuted" viewBox="0 0 24 24" fill="none">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white">Real-time Detection</h3>
              <p className="text-[11px] text-textMuted">Select any region to analyze</p>
            </div>
            <button
              onClick={handleRegionDetect}
              disabled={backendOk === false}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-deepRed bg-deepRed/10 border border-deepRed/30 hover:bg-deepRed hover:text-white hover:border-deepRed transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
              </svg>
              Select
            </button>
          </div>
          <div className="mt-2.5 px-2.5 py-1.5 bg-deepBase border border-deepBorder rounded-lg">
            <span className="text-[10.5px] text-textMuted">Cursor becomes a crosshair. Drag to select any image or video area.</span>
          </div>
        </div>

        {/* Card 3 — Audio Recording */}
        <div className="bg-deepCard border border-deepBorder rounded-xl p-3.5 hover:border-deepRed/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-deepBorder flex items-center justify-center flex-shrink-0">
              <svg className="w-[17px] h-[17px] text-textMuted" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" />
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white">Audio Analysis</h3>
              <p className="text-[11px] text-textMuted">Record &amp; detect AI-generated voices</p>
            </div>
            <button
              onClick={handleAudioRecord}
              disabled={backendOk === false}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-deepRed bg-deepRed/10 border border-deepRed/30 hover:bg-deepRed hover:text-white hover:border-deepRed transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <circle cx="12" cy="12" r="6" fill="currentColor" />
              </svg>
              Record
            </button>
          </div>
          <div className="mt-2.5 px-2.5 py-1.5 bg-deepBase border border-deepBorder rounded-lg">
            <span className="text-[10.5px] text-textMuted">Captures 10 seconds of tab audio for AI voice analysis.</span>
          </div>
        </div>

        {/* Card 4 — Video Recording */}
        <div className="bg-deepCard border border-deepBorder rounded-xl p-3.5 hover:border-deepRed/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-deepBorder flex items-center justify-center flex-shrink-0">
              <svg className="w-[17px] h-[17px] text-textMuted" viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white">Video Analysis</h3>
              <p className="text-[11px] text-textMuted">Capture &amp; analyze frame-by-frame</p>
            </div>
            <button
              onClick={handleVideoRecord}
              disabled={backendOk === false}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-deepRed bg-deepRed/10 border border-deepRed/30 hover:bg-deepRed hover:text-white hover:border-deepRed transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <circle cx="12" cy="12" r="6" fill="currentColor" />
              </svg>
              Record
            </button>
          </div>
          <div className="mt-2.5 px-2.5 py-1.5 bg-deepBase border border-deepBorder rounded-lg">
            <span className="text-[10.5px] text-textMuted">Select a video region, then records 15s and analyzes 10 extracted frames.</span>
          </div>
        </div>

        {/* Card 5 — Auto Cam Monitor */}
        <div className={`rounded-xl border p-3.5 transition-colors ${
          camMonitorOn
            ? "bg-deepGreen/5 border-deepGreen/30"
            : "bg-deepCard border-deepBorder hover:border-deepRed/30"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              camMonitorOn ? "bg-deepGreen/20" : "bg-deepBorder"
            }`}>
              <svg className={`w-[17px] h-[17px] ${camMonitorOn ? "text-deepGreen" : "text-textMuted"}`} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                {camMonitorOn && <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white">Auto Cam Monitor</h3>
              <p className="text-[11px] text-textMuted">Auto-detect &amp; scan videos</p>
            </div>
            <button
              onClick={handleCamMonitorToggle}
              disabled={backendOk === false}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${
                camMonitorOn
                  ? "text-white bg-deepGreen border-deepGreen hover:bg-deepGreen/80"
                  : "text-deepRed bg-deepRed/10 border-deepRed/30 hover:bg-deepRed hover:text-white hover:border-deepRed"
              }`}
            >
              {camMonitorOn ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                    <circle cx="12" cy="12" r="6" fill="currentColor" />
                  </svg>
                  Monitor
                </>
              )}
            </button>
          </div>
          {camMonitorOn ? (
            <ul className="mt-2.5 px-2.5 py-1 flex flex-col gap-1 list-none">
              <li className="flex items-center gap-1.5 text-[10px] text-deepGreen">
                <span className="w-1.5 h-1.5 rounded-full bg-deepGreen flex-shrink-0 animate-pulse" />
                Monitoring active — scanning every 60 seconds
              </li>
              <li className="flex items-center gap-1.5 text-[10px] text-deepGreen">
                <span className="w-1 h-1 rounded-full bg-deepGreen flex-shrink-0" />
                Click the blue badge on the page to stop
              </li>
            </ul>
          ) : (
            <div className="mt-2.5 px-2.5 py-1.5 bg-deepBase border border-deepBorder rounded-lg">
              <span className="text-[10.5px] text-textMuted">Auto-locks onto the largest playing video. Records 15s every minute for continuous deepfake monitoring.</span>
            </div>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="text-center text-[10px] text-textMuted font-medium pt-1 pb-3">
          <p>RealEyes © 2026 · All protocols operational.</p>
      </div>
    </div>
  );
}
