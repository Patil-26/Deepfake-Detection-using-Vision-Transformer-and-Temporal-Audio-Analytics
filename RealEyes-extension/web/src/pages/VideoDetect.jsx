import { useState, useRef, useContext } from 'react';
import { UploadCloud, AlertTriangle, ShieldCheck, Settings, Fingerprint, ThumbsUp, ThumbsDown, Zap, Film, Play, Layers } from 'lucide-react';
import clsx from 'clsx';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SessionCounter from '../components/SessionCounter';
import UsageLimitModal from '../components/UsageLimitModal';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5001' 
  : 'https://realeyes-final.onrender.com';

export default function VideoDetect() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const fileInputRef = useRef(null);
  const { canDetect, consumeSession } = useContext(SubscriptionContext);

  const startAnalysis = async (file) => {
    if (!file) return;

    // Check session limit before proceeding
    if (!canDetect()) {
      setShowLimitModal(true);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setResults(null);
    setFeedbackStatus(null);
    setAnalyzing(true);

    // Consume session
    consumeSession();

    try {
      const formData = new FormData();
      formData.append('video', file);

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/tools/detect-video`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to analyze video.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const submitFeedback = async (verdict) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/tools/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hash: results.hash,
          aiVerdict: results.isFake ? 'FAKE' : 'REAL',
          aiConfidence: results.score,
          userVerdict: verdict
        })
      });
      if (response.ok) setFeedbackStatus('success');
      else setFeedbackStatus('error');
    } catch (e) {
      setFeedbackStatus('error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Session Counter */}
      <div className="mb-6">
        <SessionCounter />
      </div>

      {/* Usage Limit Modal */}
      <UsageLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Left Column - Upload & Preview */}
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-deepRed/20">
            <Film className="w-5 h-5 text-deepRed" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold uppercase tracking-wider">Video Deepfake Detection</h1>
            <p className="text-xs text-textMuted font-mono">Temporal AI Analysis Pipeline</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={clsx(
            "w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
            isHovering ? "border-deepRed bg-deepRed/5" : "border-deepBorder bg-deepCard hover:border-textMuted"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsHovering(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsHovering(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              startAnalysis(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                startAnalysis(e.target.files[0]);
              }
            }}
            accept="video/*"
            className="hidden"
          />
          <UploadCloud className="w-8 h-8 text-textMuted mb-4" />
          <p className="text-sm text-gray-300 font-medium tracking-wide">Drop video here or click to browse</p>
          <p className="text-xs text-textMuted mt-2 font-mono">MP4 &bull; WEBM &bull; AVI &bull; MOV (max 100 MB)</p>
        </div>

        {/* Video Preview */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-textMuted uppercase font-mono">Video Preview</p>
            {fileName && (
              <span className="text-[10px] font-mono text-textMuted bg-deepBase px-2 py-1 rounded border border-deepBorder/50 truncate max-w-[200px]">
                {fileName}
              </span>
            )}
          </div>
          <div className="w-full aspect-video bg-deepBase rounded-lg overflow-hidden border border-deepBorder relative">
            {previewUrl ? (
              <video
                src={previewUrl}
                controls
                className={clsx("w-full h-full object-cover transition-all duration-700", results && "brightness-50")}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Play className="w-12 h-12 text-deepBorder" />
                <p className="text-xs text-textMuted font-mono">No video loaded</p>
              </div>
            )}

            {results && (
              <div className="absolute inset-0 border-2 border-deepRed glow-red rounded-lg pointer-events-none transition-opacity duration-1000" />
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin" />
                  <Film className="w-6 h-6 text-deepRed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs font-mono text-white tracking-widest uppercase mt-4">Extracting Frames...</p>
                <p className="text-[10px] text-textMuted mt-1 font-mono">Running per-frame Vision Transformer</p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Info */}
        <div className="glass-panel p-4 border border-deepBorder">
          <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider mb-3">
            <Layers className="w-3 h-3" /> Analysis Pipeline
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-deepBase p-3 rounded-lg border border-deepBorder/50 text-center">
              <p className="text-lg font-bold text-white font-mono">Multi</p>
              <p className="text-[10px] text-textMuted font-mono uppercase">Frames</p>
            </div>
            <div className="bg-deepBase p-3 rounded-lg border border-deepBorder/50 text-center">
              <p className="text-lg font-bold text-white font-mono">Peaks</p>
              <p className="text-[10px] text-textMuted font-mono uppercase">Averaged</p>
            </div>
            <div className="bg-deepBase p-3 rounded-lg border border-deepBorder/50 text-center">
              <p className="text-lg font-bold text-white font-mono">SwinV2</p>
              <p className="text-[10px] text-textMuted font-mono uppercase">Model</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Results Panel */}
      <div className={clsx("glass-panel p-6 border transition-all duration-500", results ? "border-deepRed" : "border-deepBorder opacity-50")}>
        {!results && !analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <Film className="w-12 h-12 text-deepBorder" />
             <p className="text-textMuted text-sm">Upload a video to see detection results.</p>
             <p className="text-xs text-textMuted/60 font-mono max-w-xs">The AI extracts evenly-spaced frames, runs each through a Vision Transformer, and averages the most confident predictions.</p>
           </div>
        )}

        {analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin" />
             <div className="space-y-2">
                <p className="text-sm font-mono text-white animate-pulse">Running Frame-by-Frame Analysis...</p>
                <p className="text-xs text-textMuted">Temporal consistency + per-frame deepfake scoring</p>
             </div>
           </div>
        )}

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Result */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx("p-2 rounded-lg", results.isFake ? "bg-deepRed/20" : "bg-deepGreen/20")}>
                  {results.isFake ? <AlertTriangle className="w-5 h-5 text-deepRed" /> : <ShieldCheck className="w-5 h-5 text-deepGreen" />}
                </div>
                <span className={clsx("font-display font-bold text-xl tracking-wider px-3 py-1 rounded-md border", results.isFake ? "text-deepRed bg-deepRed/10 border-deepRed/30" : "text-deepGreen bg-deepGreen/10 border-deepGreen/30")}>
                  {results.isFake ? "FAKE" : "REAL"}
                </span>
              </div>
              <span className={clsx("font-mono text-4xl font-bold", results.isFake ? "text-deepRed glow-text-red" : "text-deepGreen glow-text-green")}>
                {results.score}%
              </span>
            </div>

            {/* Risk Banner */}
            <div className={clsx("w-full border rounded-lg p-3 flex items-center justify-between", results.isFake ? "bg-deepRed/5 border-deepRed/20" : "bg-deepGreen/5 border-deepGreen/20")}>
              <span className="text-sm text-textMuted font-mono">
                {results.isFake ? `Risk Level: ${results.riskLevel || 'HIGH'} — Generative artifacts detected` : `Risk Level: ${results.riskLevel || 'SAFE'} — Authentic video confirmed`}
              </span>
              <Settings className="w-4 h-4 text-textMuted" />
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-textMuted">Fake Probability</span>
                  <span className="text-deepRed">{results.isFake ? results.score : 100 - results.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-deepBase rounded-full overflow-hidden">
                  <div className="h-full bg-deepRed glow-red transition-all duration-1000" style={{ width: `${results.isFake ? results.score : 100 - results.score}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-textMuted">Real Probability</span>
                  <span className="text-deepGreen">{results.isFake ? 100 - results.score : results.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-deepBase rounded-full overflow-hidden">
                  <div className="h-full bg-deepGreen glow-green transition-all duration-1000" style={{ width: `${results.isFake ? 100 - results.score : results.score}%` }} />
                </div>
              </div>
            </div>

            <hr className="border-deepBorder" />

            {/* Model Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                <Settings className="w-3 h-3" /> Model Breakdown
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Vision Transformer (Per-Frame)</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-deepBase rounded-full overflow-hidden flex justify-end">
                    <div className={clsx("h-full", results.isFake ? "bg-deepRed" : "bg-deepGreen")} style={{ width: `${results.models?.vision || results.score}%` }} />
                  </div>
                  <span className={clsx("font-mono text-xs", results.isFake ? "text-deepRed" : "text-deepGreen")}>{results.models?.vision || results.score}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Temporal Consistency</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-deepBase rounded-full overflow-hidden flex justify-end">
                    <div className={clsx("h-full", results.isFake ? "bg-deepRed" : "bg-deepGreen")} style={{ width: `${results.models?.temporal || 5}%` }} />
                  </div>
                  <span className={clsx("font-mono text-xs", results.isFake ? "text-deepRed" : "text-deepGreen")}>{results.models?.temporal || 5}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Frames Analyzed</span>
                <span className="font-mono text-xs text-white">{results.framesAnalyzed || "Multiple"}</span>
              </div>
            </div>

            {/* Analysis Points */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Technical Analysis
              </div>
              <div className="flex flex-wrap gap-2">
                {results.anomalies && results.anomalies.map((anom, i) => (
                  <span key={i} className={clsx("text-xs border px-3 py-1 rounded-md", results.isFake ? "bg-deepRed/10 border-deepRed/30 text-red-400" : "bg-deepGreen/10 border-deepGreen/30 text-green-400")}>
                    {anom}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-deepBorder" />

            {/* Hash & Metadata */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                <Fingerprint className="w-3 h-3" /> Authenticity Hash
              </div>
              <p className="text-[10px] font-mono text-textMuted truncate bg-deepBase p-2 rounded border border-deepBorder/50">
                {results.hash}
              </p>
              <div className="flex items-center gap-2 text-xs text-textMuted font-mono">
                <Zap className="w-3 h-3 text-yellow-500" /> {results.time}
              </div>
            </div>

            {/* Manual Verdict */}
            <div className="pt-4 space-y-3">
               <div className="text-xs font-mono text-textMuted uppercase tracking-wider">Your Verdict (Manual)</div>
               {!feedbackStatus ? (
                 <div className="flex gap-3">
                    <button onClick={() => submitFeedback('REAL')} className="flex-1 py-2 border border-deepBorder rounded-lg flex items-center justify-center gap-2 hover:bg-deepBase hover:text-white transition-colors text-sm text-textMuted">
                      <ThumbsUp className="w-4 h-4" /> REAL
                    </button>
                    <button onClick={() => submitFeedback('FAKE')} className="flex-1 py-2 border border-deepRed/30 bg-deepRed/5 rounded-lg flex items-center justify-center gap-2 hover:bg-deepRed/20 text-deepRed transition-colors text-sm">
                      <ThumbsDown className="w-4 h-4" /> FAKE
                    </button>
                 </div>
               ) : feedbackStatus === 'success' ? (
                 <div className="w-full py-3 bg-deepGreen/10 border border-deepGreen/30 text-deepGreen rounded-lg text-sm text-center font-medium font-mono">
                   Data captured for RLHF pipeline training.
                 </div>
               ) : (
                 <div className="w-full py-3 bg-deepRed/10 border border-deepRed/30 text-deepRed rounded-lg text-sm text-center font-medium">
                   Failed to transmit manual verdict.
                 </div>
               )}
            </div>

          </div>
        )}
      </div>

      </div>
    </div>
  );
}
