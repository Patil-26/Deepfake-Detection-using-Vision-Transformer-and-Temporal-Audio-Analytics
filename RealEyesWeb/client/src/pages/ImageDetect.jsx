import { useState, useRef, useContext } from 'react';
import { UploadCloud, Link as LinkIcon, AlertTriangle, ShieldCheck, Settings, Fingerprint, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import clsx from 'clsx';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SessionCounter from '../components/SessionCounter';
import UsageLimitModal from '../components/UsageLimitModal';

export default function ImageDetect() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isHovering, setIsHovering] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const fileInputRef = useRef(null);
  const { canDetect, consumeSession } = useContext(SubscriptionContext);

  const startAnalysis = async (file) => {
    // Check session limit before proceeding
    if (!canDetect()) {
      setShowLimitModal(true);
      return;
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (urlInput && activeTab === 'url') {
      setPreviewUrl(urlInput);
    }
    setResults(null);
    setAnalyzing(true);

    // Consume one session
    consumeSession();
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      } else if (urlInput) {
        formData.append('url', urlInput);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tools/detect-image', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Error generating forensic analysis.");
    } finally {
      setAnalyzing(false);
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
      
      {/* Left Column - Input & Preview */}
      <div className="space-y-6">
        
        {/* Input Tabs */}
        <div className="flex items-center gap-4 border-b border-deepBorder pb-2">
          <button 
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === 'upload' ? "bg-deepRed/10 text-deepRed border border-deepRed/30" : "text-textMuted hover:text-white")}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud className="w-4 h-4" /> Upload Image
          </button>
          <button 
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all", activeTab === 'url' ? "bg-deepCard text-white border border-deepBorder" : "text-textMuted hover:text-white")}
            onClick={() => setActiveTab('url')}
          >
            <LinkIcon className="w-4 h-4" /> Image URL
          </button>
        </div>

        {/* Input Area */}
        {activeTab === 'upload' ? (
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
              accept="image/*"
              className="hidden" 
            />
            <UploadCloud className="w-8 h-8 text-textMuted mb-4" />
            <p className="text-sm text-gray-300 font-medium tracking-wide">Drop image here or click to browse</p>
            <p className="text-xs text-textMuted mt-2 font-mono">JPG &bull; PNG &bull; WEBP &bull; GIF &bull; BMP (max 10 MB)</p>
          </div>
        ) : (
          <div className="w-full h-48 rounded-xl border border-deepBorder bg-deepCard flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <LinkIcon className="w-8 h-8 text-textMuted mb-4" />
            <p className="text-sm text-gray-300 font-medium tracking-wide mb-4">Paste an external image URL for remote analysis</p>
            <div className="flex w-full gap-2 max-w-md mx-auto">
              <input 
                type="url" 
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-deepBase border border-deepBorder rounded-lg px-4 py-2 text-white focus:outline-none focus:border-deepRed/50 placeholder:text-textMuted/50 font-mono text-sm"
              />
              <button 
                onClick={() => {
                   if(urlInput) {
                     setPreviewUrl(urlInput);
                     startAnalysis(null);
                   }
                }}
                className="px-4 py-2 bg-deepRed/10 border border-deepRed text-deepRed rounded-lg hover:bg-deepRed/20 hover:glow-red transition-all font-semibold whitespace-nowrap text-sm flex items-center justify-center"
              >
                ANALYZE
              </button>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className="glass-panel p-4">
          <p className="text-xs text-textMuted uppercase font-mono mb-3">Preview</p>
          <div className="w-full aspect-video bg-deepBase rounded-lg overflow-hidden border border-deepBorder relative">
            <img 
              src={previewUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000"} 
              alt="Preview"
              className={clsx("w-full h-full object-cover transition-all duration-700", results && "brightness-50")}
            />
            
            {results && (
              <div className="absolute inset-0 border-2 border-deepRed glow-red rounded-lg pointer-events-none transition-opacity duration-1000" />
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-deepRed animate-pulse mb-3" />
                <p className="text-xs font-mono text-white tracking-widest uppercase">Analyzing Pixels...</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column - Results Panel */}
      <div className={clsx("glass-panel p-6 border transition-all duration-500", results ? "border-deepRed" : "border-deepBorder opacity-50")}>
        {!results && !analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <AlertTriangle className="w-12 h-12 text-deepBorder" />
             <p className="text-textMuted text-sm">Upload an image to see detection results.</p>
           </div>
        )}

        {analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin" />
             <div className="space-y-2">
                <p className="text-sm font-mono text-white animate-pulse">Running Vision Models...</p>
                <p className="text-xs text-textMuted">Calculating ELA Heuristics</p>
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

            {/* Warning Banner */}
            <div className={clsx("w-full border rounded-lg p-3 flex items-center justify-between", results.isFake ? "bg-deepRed/5 border-deepRed/20" : "bg-deepGreen/5 border-deepGreen/20")}>
              <span className="text-sm text-textMuted font-mono">
                {results.isFake ? "Ledger Hash Mismatch: Unregistered Provenance" : "Cryptographic Hash Verified: Live Human Capture"}
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
                  <div className="h-full bg-deepRed glow-red" style={{ width: `${results.isFake ? results.score : 100 - results.score}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-textMuted">Real Probability</span>
                  <span className="text-deepGreen">{results.isFake ? 100 - results.score : results.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-deepBase rounded-full overflow-hidden">
                  <div className="h-full bg-deepGreen glow-green" style={{ width: `${results.isFake ? 100 - results.score : results.score}%` }} />
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
                <span className="text-gray-300">Deepguard Vision AI</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-deepBase rounded-full overflow-hidden flex justify-end">
                    <div className={clsx("h-full", results.isFake ? "bg-deepRed" : "bg-deepGreen")} style={{ width: `${results.models?.vision || results.score}%` }} />
                  </div>
                  <span className={clsx("font-mono text-xs", results.isFake ? "text-deepRed" : "text-deepGreen")}>{results.models?.vision || results.score}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">ELA Heuristic</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-deepBase rounded-full overflow-hidden flex justify-end">
                    <div className={clsx("h-full", results.isFake ? "bg-deepRed" : "bg-deepGreen")} style={{ width: `${results.models?.ela || 12}%` }} />
                  </div>
                  <span className={clsx("font-mono text-xs", results.isFake ? "text-deepRed" : "text-deepGreen")}>{results.models?.ela || 12}%</span>
                </div>
              </div>
            </div>

            {/* Suspicious Regions Labels */}
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
               <div className="flex gap-3">
                  <button className="flex-1 py-2 border border-deepBorder rounded-lg flex items-center justify-center gap-2 hover:bg-deepBase hover:text-white transition-colors text-sm text-textMuted">
                    <ThumbsUp className="w-4 h-4" /> REAL
                  </button>
                  <button className="flex-1 py-2 border border-deepRed/30 bg-deepRed/5 rounded-lg flex items-center justify-center gap-2 hover:bg-deepRed/20 text-deepRed transition-colors text-sm">
                    <ThumbsDown className="w-4 h-4" /> FAKE
                  </button>
               </div>
            </div>

          </div>
        )}
      </div>

      </div>
    </div>
  );
}
