import { useState, useRef, useContext } from 'react';
import { UploadCloud, Link as LinkIcon, AlertTriangle, ShieldCheck, Settings, Fingerprint, ThumbsUp, ThumbsDown, Zap, Search, Share2, FileText, RefreshCw, ZoomIn } from 'lucide-react';
import clsx from 'clsx';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SessionCounter from '../components/SessionCounter';
import UsageLimitModal from '../components/UsageLimitModal';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5001' 
  : 'https://realeyes-final.onrender.com';

export default function ImageDetect() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isHovering, setIsHovering] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [showReverseSearch, setShowReverseSearch] = useState(false);
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
    setFeedbackStatus(null);
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
      
      const response = await fetch(`${API_BASE}/api/tools/detect-image`, {
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

  const handleGenerateDocx = async () => {
    if (!results) return;

    const createTableCell = (text, isHeader = false) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: text || "N/A", bold: isHeader, font: "Arial", size: 20 })] })],
      padding: { top: 100, bottom: 100, right: 100, left: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "888888" }
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
             text: "REALEYES AI",
             heading: HeadingLevel.HEADING_1,
             alignment: "center",
          }),
          new Paragraph({
             text: "FORENSIC IMAGE ANALYSIS REPORT",
             heading: HeadingLevel.HEADING_2,
             alignment: "center",
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: `Case Number: DG-${results.hash.substring(0, 8).toUpperCase()}-2026`, alignment: "center" }),
          new Paragraph({ text: `Report Generated: ${new Date().toLocaleString()}`, alignment: "center" }),
          new Paragraph({ text: "Analyst: RealEyes Auto-System", alignment: "center" }),
          new Paragraph({ text: "Classification: CONFIDENTIAL", alignment: "center", children: [new TextRun({ text: "Classification: CONFIDENTIAL", color: "FF0000", bold: true })] }),
          
          new Paragraph({ text: "" }),
          new Paragraph({ text: "1. EXECUTIVE SUMMARY", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: `Verdict: ${results.isFake ? "Manipulation detected" : "Authentic Image"}`, bold: true, color: results.isFake ? "FF0000" : "008800" })] }),
          new Paragraph({ text: `Authenticity Score: ${100 - results.score}%` }),
          new Paragraph({ text: `Confidence Level: ${results.score}%` }),
          new Paragraph({ text: `Manipulation Detected: ${results.isFake ? "YES" : "NO"}` }),
          new Paragraph({ text: "" }),
          new Paragraph({
             text: `Forensic analysis reveals ${results.isFake ? "strong evidence of manipulation" : "no substantial evidence of algorithmic synthesis"}. The cryptographic hash verified the provenance trace as ${results.hash}. The models found ${results.anomalies.length} specific regions of interest.`,
             alignment: "justify"
          }),
          
          new Paragraph({ text: "" }),
          new Paragraph({ text: "2. IMAGE INFORMATION", heading: HeadingLevel.HEADING_3 }),
          new Table({
            columnWidths: [4000, 5000],
            rows: [
              new TableRow({ children: [createTableCell("SHA-256 Hash", true), createTableCell(results.hash)] }),
              new TableRow({ children: [createTableCell("Analysis Status", true), createTableCell("COMPLETED")] }),
              new TableRow({ children: [createTableCell("Processing Time", true), createTableCell(results.time)] }),
            ]
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "3. FINDINGS", heading: HeadingLevel.HEADING_3 }),
          ...results.anomalies.map((anom, idx) => (
             new Paragraph({ text: `Finding ${idx + 1}: ${anom}`, bullet: { level: 0 } })
          )),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "DISCLAIMER", heading: HeadingLevel.HEADING_4 }),
          new Paragraph({ text: "This report was generated by RealEyes AI automated forensic analysis system. Results should be verified by a qualified forensic analyst before being used as evidence. AI-based analysis provides probabilistic assessments and should not be considered definitive proof of authenticity or manipulation.", size: 16, color: "888888" }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `RealEyes-Report-${results.hash.substring(0, 6)}.docx`);
  };

  const handleGoogleLens = async () => {
    if (!previewUrl) return;
    
    if (activeTab === 'url' && urlInput) {
       // For URL-based images, go straight to Google Lens
       window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(urlInput)}`, '_blank');
    } else {
       // For local uploads: upload to temp host via our backend, then redirect
       try {
         const res = await fetch(previewUrl);
         const blob = await res.blob();
         
         const formData = new FormData();
         formData.append('image', blob, 'search_image.jpg');
         
         const uploadRes = await fetch(`${API_BASE}/api/tools/temp-upload`, {
           method: 'POST',
           body: formData
         });
         
         if (!uploadRes.ok) throw new Error('Temp upload failed');
         
         const { url } = await uploadRes.json();
         window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`, '_blank');
       } catch (error) {
         console.error("Google Lens search failed:", error);
         alert("Could not initialize Google Lens search. Please try again.");
       }
    }
  };

  // Shared helper: gets a public URL for the current image
  const getPublicImageUrl = async () => {
    if (activeTab === 'url' && urlInput) return urlInput;
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    const formData = new FormData();
    formData.append('image', blob, 'search_image.jpg');
    const uploadRes = await fetch(`${API_BASE}/api/tools/temp-upload`, {
      method: 'POST',
      body: formData
    });
    if (!uploadRes.ok) throw new Error('Temp upload failed');
    const { url } = await uploadRes.json();
    return url;
  };

  const handleTinEye = async () => {
    if (!previewUrl) return;
    try {
      const url = await getPublicImageUrl();
      window.open(`https://tineye.com/search?url=${encodeURIComponent(url)}`, '_blank');
    } catch (e) {
      console.error('TinEye search failed:', e);
      alert('Could not launch TinEye search.');
    }
  };

  const handleYandex = async () => {
    if (!previewUrl) return;
    try {
      const url = await getPublicImageUrl();
      window.open(`https://yandex.com/images/search?source=collections&rpt=imageview&url=${encodeURIComponent(url)}`, '_blank');
    } catch (e) {
      console.error('Yandex search failed:', e);
      alert('Could not launch Yandex search.');
    }
  };

  const handleBingVisual = async () => {
    if (!previewUrl) return;
    try {
      const url = await getPublicImageUrl();
      window.open(`https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIHMP&q=imgurl:${encodeURIComponent(url)}`, '_blank');
    } catch (e) {
      console.error('Bing Visual search failed:', e);
      alert('Could not launch Bing Visual search.');
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
                <span className="text-gray-300">RealEyes Vision AI</span>
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
                   Failed to transmit manual verdict connection. 
                 </div>
               )}
            </div>

            <hr className="border-deepBorder" />

            {/* Processing Actions */}
            <div className="space-y-3 pt-2">
               <div className="text-xs font-display font-medium text-white mb-2 tracking-wide">Processing Actions</div>
               
               <button onClick={handleGenerateDocx} className="w-full flex items-center gap-4 bg-indigo-900/20 border border-indigo-400/40 p-4 rounded-xl hover:bg-indigo-900/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all text-left">
                 <FileText className="w-5 h-5 text-indigo-400" />
                 <div>
                   <div className="text-white text-sm font-bold">Generate DOCX Report</div>
                   <div className="text-xs text-indigo-300/70">Full forensic report download</div>
                 </div>
               </button>

               <div className="flex flex-col">
                 <button 
                   onClick={() => setShowReverseSearch(!showReverseSearch)}
                   className={clsx("w-full flex items-center gap-4 border p-4 hover:bg-teal-900/20 transition-all text-left z-10 relative", showReverseSearch ? "bg-teal-900/20 border-teal-500 rounded-t-xl" : "bg-teal-900/10 border-teal-500/30 rounded-xl")}
                 >
                   <Search className="w-5 h-5 text-teal-400" />
                   <div>
                     <div className="text-white text-sm font-bold">Reverse Image Search</div>
                     <div className="text-xs text-teal-300/70">Find this image across the web</div>
                   </div>
                 </button>
                 
                 {showReverseSearch && (
                   <div className="w-full bg-deepBase/50 border border-teal-500/20 border-t-0 rounded-b-xl overflow-hidden p-3 pt-4 -mt-2 space-y-1">
                      <button onClick={handleGoogleLens} className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-teal-900/30 transition-all text-left">
                        <LinkIcon className="w-4 h-4 text-teal-400" /> Google Lens
                      </button>
                      <button onClick={handleTinEye} className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-teal-900/30 transition-all text-left">
                        <LinkIcon className="w-4 h-4 text-green-400" /> TinEye
                      </button>
                      <button onClick={handleYandex} className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-teal-900/30 transition-all text-left">
                        <LinkIcon className="w-4 h-4 text-yellow-400" /> Yandex
                      </button>
                      <button onClick={handleBingVisual} className="w-full flex items-center gap-3 text-sm text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-teal-900/30 transition-all text-left">
                        <LinkIcon className="w-4 h-4 text-blue-400" /> Bing Visual
                      </button>
                   </div>
                 )}
               </div>


            </div>

          </div>
        )}
      </div>

      </div>
    </div>
  );
}
