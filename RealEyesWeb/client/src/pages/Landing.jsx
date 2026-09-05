import { Link } from 'react-router-dom';
import { Shield, FileText, Brain, MessageSquare, BookOpen, Lock, Image as ImageIcon, Zap, Target, Cpu, Activity } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      title: 'Deepfake Detection',
      desc: 'Hybrid LLaMA-3.1 heuristic pipeline built on Groq infrastructure. Metadata hashing ensures consistency.',
      icon: <Shield className="w-6 h-6 text-deepRed" />,
      tag: 'Core'
    },
    {
      title: 'Explainable AI (XAI)',
      desc: 'Advanced architectural matrices explain which regions generated the fake verdict.',
      icon: <Brain className="w-6 h-6 text-cyan-400" />,
      tag: 'XAI'
    },
    {
      title: 'Blockchain Trust Hash',
      desc: 'SHA-256 authenticity fingerprint for every analysis — simulated verification layer.',
      icon: <Lock className="w-6 h-6 text-orange-500" />,
      tag: 'Trust'
    },
    {
      title: 'URL Image Scanning',
      desc: 'Paste any public image URL and the system fetches, analyses, and returns results.',
      icon: <ImageIcon className="w-6 h-6 text-pink-500" />,
      tag: 'Feature'
    },
    {
      title: 'Real-Time Inference',
      desc: 'Optimized batching and local caching pipeline. Accelerated Groq endpoints.',
      icon: <Zap className="w-6 h-6 text-deepGreen" />,
      tag: 'Performance'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center pt-24 pb-20 px-4 min-h-[80vh] justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-deepGreen/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-deepBorder bg-deepCard mb-8 shadow-[0_0_15px_rgba(30,30,30,0.5)]">
            <div className="w-2 h-2 rounded-full bg-deepRed animate-pulse" />
            <span className="text-xs font-mono text-textMuted uppercase tracking-wider">Live &mdash; AI Detection System Active</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-display font-bold uppercase tracking-tight mb-4 drop-shadow-2xl">
            Deepguard <span className="text-deepGreen glow-text-green">AI</span>
          </h1>
          
          <p className="text-3xl text-textMuted font-light mb-8">
            Defending reality against <span className="text-deepRed glow-text-red font-medium">Synthetic Media</span>
          </p>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-mono">
            Powered by Vision Transformers &middot; LLaMA-3 &middot; Grad-CAM &middot; Groq<br/>
            Real-time KYC identity, image & video verification with explainable architectures.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/detect-image" className="w-full sm:w-auto px-8 py-4 bg-deepRed/10 border border-deepRed text-deepRed rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-deepRed hover:text-white hover:glow-red transition-all duration-300">
              <Shield className="w-5 h-5" />
              DETECT DEEPFAKE &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="w-full max-w-6xl py-24 px-6 border-b border-deepBorder/50">
        <div className="text-center mb-16">
          <p className="text-xs text-textMuted uppercase tracking-wider font-mono mb-2">Technical Matrix</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold">The Complete <span className="text-deepRed glow-text-red">Defense Platform</span></h2>
          <p className="text-textMuted mt-4 max-w-2xl mx-auto">
            A comprehensive ecosystem combining real-time detection, explainability, and cryptographic trust tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel p-6 hover:-translate-y-2 transition-transform duration-300 group cursor-default relative overflow-hidden bg-deepBase/50 hover:bg-deepCard border border-deepBorder">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-lg bg-deepCard border border-deepBorder group-hover:border-opacity-50 transition-colors shadow-lg">
                  {feat.icon}
                </div>
                <span className="text-[10px] font-mono tracking-wide px-2 py-1 bg-deepBase border border-deepBorder rounded text-textMuted uppercase">
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3 text-white group-hover:text-deepRed transition-colors duration-300">{feat.title}</h3>
              <p className="text-sm text-textMuted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing CTA Section */}
      <div className="w-full max-w-4xl py-20 px-6 text-center">
        <div className="glass-panel p-12 border border-deepBorder relative overflow-hidden group hover:border-deepRed/30 transition-all duration-500">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-deepRed/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10">
            <p className="text-xs text-deepRed uppercase tracking-wider font-mono font-bold mb-3">Flexible Plans</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Start <span className="text-deepGreen glow-text-green">Free</span>, Scale When Ready
            </h2>
            <p className="text-textMuted max-w-lg mx-auto mb-8">
              Get 20 free detection sessions every month. Need more? Upgrade to Premium for unlimited scans, faster processing, and priority support.
            </p>
            <Link
              to="/upgrade"
              className="inline-flex items-center gap-2 px-8 py-4 bg-deepRed/10 border border-deepRed text-deepRed rounded-xl font-bold hover:bg-deepRed hover:text-white hover:glow-red transition-all duration-300"
            >
              Upgrade to Premium &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="w-full bg-black/40 border-y border-deepBorder py-24 relative overflow-hidden" id="about">
         <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-deepRed/5 to-transparent pointer-events-none" />
         
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-deepRed font-mono text-sm uppercase tracking-wider font-bold">
                 <Target className="w-4 h-4" /> About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Deepfake and Synthetic Media Detector for <span className="text-white relative z-10">KYC</span>.
              </h2>
              <div className="space-y-5 pt-2">
                <p className="text-textMuted leading-relaxed">
                  <strong className="text-white">KYC Shield</strong> is an AI-powered identity verification solution designed to combat the rising threat of deepfakes and synthetic media in digital onboarding processes. As financial institutions and organizations increasingly rely on remote KYC, ensuring the authenticity of submitted images and videos has become critical.
                </p>
                <p className="text-textMuted leading-relaxed">
                  Our platform goes beyond traditional verification methods by analyzing visual artifacts, facial inconsistencies, and behavioral patterns to detect signs of manipulation. Instead of relying solely on black-box models, KYC Shield combines computer vision techniques with explainable insights, allowing users to understand <em>why</em> a submission is flagged as suspicious.
                </p>
                <p className="text-textMuted leading-relaxed">
                  We are focused on building a system that is not only accurate, but also transparent and easy to use for non-technical teams. By providing clear risk scores, highlighted anomalies, and actionable recommendations, KYC Shield empowers fintech and HR professionals to make faster and more reliable identity verification decisions.
                </p>
                <p className="text-gray-300 leading-relaxed font-medium italic">
                  "Our mission is to make digital identity verification more secure, trustworthy, and accessible — helping organizations stay one step ahead of evolving fraud techniques."
                </p>
              </div>
            </div>

            {/* Abstract Graphic */}
            <div className="relative h-[400px] w-full rounded-2xl border border-deepBorder bg-deepBase overflow-hidden flex items-center justify-center group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')] opacity-20 pointer-events-none" />
               <div className="w-32 h-32 rounded-full border border-deepRed/50 flex items-center justify-center animate-spin-slow">
                 <div className="w-24 h-24 rounded-full border border-deepRed border-t-transparent animate-spin" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <Shield className="w-12 h-12 text-deepRed" />
               </div>
               {/* Terminal overlay abstract */}
               <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-4 border border-deepBorder rounded font-mono text-[10px] text-green-500 opacity-50 group-hover:opacity-100 transition-opacity">
                 {'>'} INITIATING FORENSIC KERNEL...<br/>
                 {'>'} LOADING TENSORS [||||||||||  ] 84%<br/>
                 {'>'} WAITING FOR QUERY...
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
