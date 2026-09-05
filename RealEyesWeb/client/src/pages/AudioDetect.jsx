import { useState, useRef, useEffect, useContext } from 'react';
import { 
  UploadCloud, 
  AlertTriangle, 
  ShieldCheck, 
  Settings, 
  Fingerprint, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  Radio, 
  Activity,
  AlertCircle 
} from 'lucide-react';
import clsx from 'clsx';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SessionCounter from '../components/SessionCounter';
import UsageLimitModal from '../components/UsageLimitModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MAX_AUDIO_SIZE_MB = 25;

export default function AudioDetect() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);

  const { canDetect, consumeSession } = useContext(SubscriptionContext);

  const handleFileSelection = (file) => {
    setErrorMessage(null);
    if (!file) return;

    // Validate size (25MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_AUDIO_SIZE_MB) {
      setErrorMessage(`Audio file exceeds the ${MAX_AUDIO_SIZE_MB}MB size limit (selected file is ${fileSizeMB.toFixed(1)}MB).`);
      return;
    }

    startAnalysis(file);
  };

  const startAnalysis = async (file) => {
    if (!file) return;

    // Check session limit before proceeding
    if (!canDetect()) {
      setShowLimitModal(true);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFileName(file.name);
    setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setResults(null);
    setFeedbackStatus(null);
    setAnalyzing(true);
    setErrorMessage(null);

    // Consume session
    consumeSession();

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/tools/detect-audio`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to analyze audio track (Status: ${response.status})`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while analyzing synthetic speech.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Setup Web Audio API and Waveform Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawIdleWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;
      const barCount = 48;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const time = Date.now() / 800;
        const barHeight = isPlaying 
          ? Math.max(6, Math.sin(i * 0.25 + time * 3) * 24 + 28)
          : Math.max(4, Math.sin(i * 0.2) * 8 + 10);

        ctx.fillStyle = isPlaying 
          ? (results?.isFake ? '#ff2a2a' : '#00e559') 
          : '#333333';
        
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
      }

      animationFrameIdRef.current = requestAnimationFrame(drawIdleWave);
    };

    drawIdleWave();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, results]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio play prevented:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleScrub = (e) => {
    if (!audioRef.current || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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
          hash: results?.hash,
          aiVerdict: results?.isFake ? 'FAKE' : 'REAL',
          aiConfidence: results?.score,
          userVerdict: verdict
        })
      });
      if (response.ok) setFeedbackStatus('success');
      else setFeedbackStatus('error');
    } catch {
      setFeedbackStatus('error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Session Counter */}
      <div className="mb-6">
        <SessionCounter />
      </div>

      {/* Usage Limit Modal */}
      <UsageLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-deepRed/10 border border-deepRed/40 rounded-xl flex items-center justify-between text-deepRed text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-textMuted hover:text-white text-xs font-mono px-2 py-1"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column - Audio Player, Waveform & Upload */}
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-deepRed/15 border border-deepRed/30">
              <Mic className="w-5 h-5 text-deepRed" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold uppercase tracking-wider">Audio Deepfake Studio</h1>
              <p className="text-xs text-textMuted font-mono">WavLM Voice Clone & Spectral Analysis</p>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            className={clsx(
              "w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
              isHovering 
                ? "border-deepRed bg-deepRed/5 glow-red" 
                : "border-deepBorder bg-deepCard/70 hover:border-textMuted"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsHovering(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsHovering(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
              accept="audio/*"
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-textMuted mb-3 group-hover:text-deepRed transition-colors" />
            <p className="text-sm text-gray-200 font-medium tracking-wide">
              Drop audio recording or <span className="text-deepRed underline font-semibold">browse file</span>
            </p>
            <p className="text-xs text-textMuted mt-1.5 font-mono">
              WAV &bull; MP3 &bull; WEBM &bull; OGG &bull; Max 25 MB
            </p>
          </div>

          {/* Audio Visualizer & Player Card */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-deepRed" />
                <span className="text-xs text-textMuted uppercase font-mono tracking-wider">Acoustic Waveform</span>
              </div>
              {fileName && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-textMuted bg-deepBase px-2 py-0.5 rounded border border-deepBorder truncate max-w-[160px]">
                    {fileName}
                  </span>
                  <span className="text-[10px] font-mono text-textMuted bg-deepBase px-1.5 py-0.5 rounded border border-deepBorder">
                    {fileSizeStr}
                  </span>
                </div>
              )}
            </div>

            {/* Waveform Canvas */}
            <div className="w-full h-28 bg-deepBase rounded-xl border border-deepBorder flex items-center justify-center relative overflow-hidden px-4">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={100} 
                className="w-full h-full object-contain"
              />

              {analyzing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-3 border-deepBorder border-t-deepRed animate-spin" />
                  <p className="text-xs font-mono text-white tracking-widest uppercase mt-3">Extracting Spectral Acoustic Features...</p>
                </div>
              )}
            </div>

            {/* Audio Controls */}
            {previewUrl && (
              <div className="space-y-3 pt-1">
                <audio 
                  ref={audioRef} 
                  src={previewUrl} 
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-xl bg-deepRed text-white hover:bg-deepRed/90 glow-red transition-all flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleScrub}
                      className="w-full h-1.5 bg-deepBase rounded-lg appearance-none cursor-pointer accent-deepRed"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-textMuted">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Pipeline Specs */}
          <div className="glass-panel p-4 border border-deepBorder">
            <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-deepRed" /> Voice Verification Pipeline
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-deepBase p-3 rounded-xl border border-deepBorder text-center">
                <p className="text-lg font-bold text-white font-mono">16 kHz</p>
                <p className="text-[10px] text-textMuted font-mono uppercase">Sample Rate</p>
              </div>
              <div className="bg-deepBase p-3 rounded-xl border border-deepBorder text-center">
                <p className="text-lg font-bold text-white font-mono">WavLM</p>
                <p className="text-[10px] text-textMuted font-mono uppercase">Base Model</p>
              </div>
              <div className="bg-deepBase p-3 rounded-xl border border-deepBorder text-center">
                <p className="text-lg font-bold text-white font-mono">AASIST</p>
                <p className="text-[10px] text-textMuted font-mono uppercase">Graph Attention</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Voice Clone Results Panel */}
        <div className={clsx("glass-panel p-6 border transition-all duration-500", results ? "border-deepRed" : "border-deepBorder opacity-60")}>
          {!results && !analyzing && (
            <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center space-y-4">
              <Volume2 className="w-12 h-12 text-deepBorder" />
              <p className="text-textMuted text-sm font-medium">Upload audio track to detect synthetic voice cloning.</p>
              <p className="text-xs text-textMuted/70 font-mono max-w-sm">
                Evaluates vocal tract resonance, neural vocoder phase continuity, and synthetic pitch modulation to identify voice clones.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-mono text-white animate-pulse">Running Voice Biometrics Model...</p>
                <p className="text-xs text-textMuted">WavLM speech model + neural vocoder anomaly detection</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Verdict Header */}
              <div className="flex items-center justify-between pb-4 border-b border-deepBorder">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-xl border", results.isFake ? "bg-deepRed/15 border-deepRed/30" : "bg-deepGreen/15 border-deepGreen/30")}>
                    {results.isFake ? <AlertTriangle className="w-6 h-6 text-deepRed" /> : <ShieldCheck className="w-6 h-6 text-deepGreen" />}
                  </div>
                  <div>
                    <span className={clsx("font-display font-bold text-2xl tracking-wider px-3 py-1 rounded-md border inline-block", results.isFake ? "text-deepRed bg-deepRed/10 border-deepRed/30" : "text-deepGreen bg-deepGreen/10 border-deepGreen/30")}>
                      {results.isFake ? "AI VOICE CLONE" : "AUTHENTIC HUMAN"}
                    </span>
                    <p className="text-xs text-textMuted font-mono mt-1">
                      {results.isFake ? "Synthetic speech synthesis detected" : "Natural biometric speech confirmed"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={clsx("font-mono text-4xl font-bold", results.isFake ? "text-deepRed glow-text-red" : "text-deepGreen glow-text-green")}>
                    {results.score}%
                  </span>
                  <p className="text-[10px] text-textMuted font-mono">CONFIDENCE</p>
                </div>
              </div>

              {/* Risk Level Banner */}
              <div className={clsx("w-full border rounded-xl p-3.5 flex items-center justify-between", results.isFake ? "bg-deepRed/5 border-deepRed/20" : "bg-deepGreen/5 border-deepGreen/20")}>
                <span className="text-xs text-textMuted font-mono">
                  {results.isFake 
                    ? `Risk Level: ${results.riskLevel || 'HIGH'} — Neural TTS vocoder detected` 
                    : `Risk Level: ${results.riskLevel || 'SAFE'} — Natural human vocal patterns`}
                </span>
                <Settings className="w-4 h-4 text-textMuted" />
              </div>

              {/* Probability Comparison Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-textMuted">Synthetic Speech Probability</span>
                    <span className="text-deepRed font-bold">{results.isFake ? results.score : 100 - results.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-deepBase rounded-full overflow-hidden p-0.5 border border-deepBorder">
                    <div 
                      className="h-full bg-deepRed rounded-full glow-red transition-all duration-1000" 
                      style={{ width: `${results.isFake ? results.score : 100 - results.score}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-textMuted">Authentic Human Probability</span>
                    <span className="text-deepGreen font-bold">{results.isFake ? 100 - results.score : results.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-deepBase rounded-full overflow-hidden p-0.5 border border-deepBorder">
                    <div 
                      className="h-full bg-deepGreen rounded-full glow-green transition-all duration-1000" 
                      style={{ width: `${results.isFake ? 100 - results.score : results.score}%` }} 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-deepBorder" />

              {/* Model Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                  <Settings className="w-3.5 h-3.5 text-deepRed" /> Acoustic Feature Breakdown
                </div>
                <div className="space-y-2 text-sm bg-deepBase/60 p-3 rounded-xl border border-deepBorder">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">WavLM Transformer Representation</span>
                    <span className={clsx("font-mono text-xs font-bold", results.isFake ? "text-deepRed" : "text-deepGreen")}>
                      {results.models?.wavlm || results.score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">Spectral Prosody Discontinuity</span>
                    <span className={clsx("font-mono text-xs font-bold", results.isFake ? "text-deepRed" : "text-deepGreen")}>
                      {results.models?.spectral || 9}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Bullet Points */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-deepRed" /> Vocal Forensics & Biometrics
                </div>
                <div className="flex flex-col gap-2">
                  {results.anomalies && results.anomalies.map((anom, i) => (
                    <div 
                      key={i} 
                      className={clsx(
                        "text-xs p-2.5 rounded-lg border flex items-start gap-2",
                        results.isFake 
                          ? "bg-deepRed/10 border-deepRed/30 text-red-300" 
                          : "bg-deepGreen/10 border-deepGreen/30 text-green-300"
                      )}
                    >
                      <span className="font-mono font-bold">•</span>
                      <span>{anom}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-deepBorder" />

              {/* Hash & Verification Footprint */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-textMuted uppercase tracking-wider">
                  <Fingerprint className="w-3.5 h-3.5 text-deepRed" /> Audio Hash Footprint
                </div>
                <p className="text-[10px] font-mono text-textMuted truncate bg-deepBase p-2.5 rounded-lg border border-deepBorder select-all">
                  {results.hash}
                </p>
                <div className="flex items-center gap-2 text-xs text-textMuted font-mono pt-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" /> Latency: {results.time}
                </div>
              </div>

              {/* RLHF Feedback */}
              <div className="pt-2 space-y-2">
                <div className="text-xs font-mono text-textMuted uppercase tracking-wider">Human Feedback (RLHF)</div>
                {!feedbackStatus ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => submitFeedback('REAL')} 
                      className="flex-1 py-2 border border-deepBorder rounded-lg flex items-center justify-center gap-2 hover:bg-deepBase hover:text-white transition-all text-xs text-textMuted font-mono"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> CONFIRM HUMAN
                    </button>
                    <button 
                      onClick={() => submitFeedback('FAKE')} 
                      className="flex-1 py-2 border border-deepRed/30 bg-deepRed/5 rounded-lg flex items-center justify-center gap-2 hover:bg-deepRed/20 text-deepRed transition-all text-xs font-mono"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> FLAG CLONE
                    </button>
                  </div>
                ) : feedbackStatus === 'success' ? (
                  <div className="w-full py-2.5 bg-deepGreen/10 border border-deepGreen/30 text-deepGreen rounded-lg text-xs text-center font-mono font-medium">
                    Feedback recorded for active audio distillation refinement.
                  </div>
                ) : (
                  <div className="w-full py-2.5 bg-deepRed/10 border border-deepRed/30 text-deepRed rounded-lg text-xs text-center font-mono text-deepRed">
                    Failed to record feedback.
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
