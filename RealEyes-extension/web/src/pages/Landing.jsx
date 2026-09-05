import { Link } from 'react-router-dom';
import { Shield, FileText, Brain, MessageSquare, BookOpen, Lock, Image as ImageIcon, Zap, Target, Cpu, Activity } from 'lucide-react';
import Footer from '../components/Footer';
import wireframeHead from '../assets/wireframe_head.png';

export default function Landing() {
  const features = [
    {
      title: 'Deepfake Detection',
      desc: 'Powered by the ViT Deepfake Detector (dima806) architecture. Evaluates visual anomalies and synthetic artifacts frame-by-frame.',
      icon: <Shield className="w-6 h-6 text-deepRed" />,
      tag: 'Core'
    },
    {
      title: 'Real-Time Inference',
      desc: 'Hybrid processing: local inference for computer vision transformers and ultra-fast Groq LPU routing for LLM tasks.',
      icon: <Zap className="w-6 h-6 text-deepGreen" />,
      tag: 'Performance'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">

      {/* Hero Section */}
      <div className="relative w-full flex flex-col pt-20 pb-12 px-6 md:px-12 lg:px-20 h-[calc(100vh-64px)] justify-center overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-deepRed/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[400px] bg-red-900/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-row justify-between items-center gap-4">
          {/* Left: Text Content */}
          <div className="flex flex-col items-start text-left w-full md:w-[55%] flex-shrink-0">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-deepRed animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
              <span className="text-[11px] font-mono text-textMuted uppercase tracking-[0.25em]">Live &mdash; AI Detection System Active</span>
            </div>

            <h1 className="flex flex-col text-4xl md:text-5xl lg:text-[4.2rem] font-display font-extrabold uppercase tracking-[0.08em] leading-[1.15] mb-8">
              <div className="flex items-baseline gap-x-4 whitespace-nowrap">
                <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(150,150,150,0.7)]"><span className="text-[1.15em]">R</span>EAL<span className="text-[1.15em]">E</span>YES</span>
                <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(150,150,150,0.7)]">DEFENDING</span>
              </div>
              <span className="text-deepRed font-extrabold drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]" style={{ WebkitTextStroke: 'unset' }}>REALITY</span>
              <div className="flex items-baseline gap-x-4 whitespace-nowrap">
                <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(150,150,150,0.7)]">AGAINST</span>
                <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(150,150,150,0.7)]">SYNTHETIC</span>
              </div>
              <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(150,150,150,0.7)]">MEDIA</span>
            </h1>

            <div className="text-[13px] text-gray-400 mb-10 leading-relaxed font-mono border-l-2 border-deepRed/60 pl-4 py-1">
              Powered by Vision Transformers &middot; LLaMA-3 &middot; Grad-CAM &middot; Groq<br />
              Real-time KYC identity, image &amp; video verification with<br />
              explainable architectures.
            </div>

            <div className="flex flex-row items-center gap-4">
              <Link to="/detect-image" className="px-8 py-3.5 border border-deepRed/60 text-deepRed rounded-lg font-semibold flex items-center gap-2.5 hover:bg-deepRed hover:text-white hover:shadow-[0_0_25px_rgba(255,0,0,0.35)] transition-all duration-300 text-sm tracking-wide">
                <Shield className="w-4 h-4" />
                DETECT DEEPFAKE &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Red Wireframe Head */}
          <div className="hidden md:flex w-[45%] justify-center items-center relative pointer-events-none">
            <div className="absolute w-56 h-56 bg-red-700 blur-[120px] rounded-full animate-pulse opacity-30" />
            <img
              src={wireframeHead}
              alt="Red AI Wireframe Head"
              className="relative w-full max-w-[450px] h-auto object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="w-full max-w-6xl py-24 px-6 border-b border-deepBorder/50">
        <div className="text-center mb-16">
          <p className="text-xs text-textMuted uppercase tracking-wider font-mono mb-2">Technical Matrix</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold">The Complete <span className="text-deepRed glow-text-red">Defense Platform</span></h2>
          <p className="text-textMuted mt-4 max-w-2xl mx-auto">
            A comprehensive ecosystem combining real-time continuous detection, computer vision models, and LLM-powered context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel p-8 hover:-translate-y-2 transition-all duration-500 group cursor-default relative overflow-hidden bg-deepBase/40 hover:bg-deepCard/80 border border-deepBorder/60 hover:border-deepRed/40 hover:shadow-[0_8px_30px_rgba(255,0,0,0.12)] rounded-2xl backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-deepRed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 rounded-xl bg-deepCard border border-deepBorder group-hover:border-deepRed/30 transition-colors shadow-lg">
                  {feat.icon}
                </div>
                <span className="text-[10px] font-mono tracking-widest px-3 py-1.5 bg-black/50 border border-deepBorder rounded-full text-textMuted uppercase backdrop-blur-md">
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-deepRed transition-colors duration-300 relative z-10">{feat.title}</h3>
              <p className="text-sm text-textMuted leading-relaxed relative z-10">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing CTA Section */}
      <div className="w-full max-w-4xl py-20 px-6 text-center">
        <div className="glass-panel p-12 border border-deepBorder relative overflow-hidden group hover:border-deepRed/30 transition-all duration-500">
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
                <strong className="text-white">RealEyes AI</strong> is an AI-powered identity verification solution designed to combat the rising threat of deepfakes and synthetic media in digital onboarding processes. As financial institutions and organizations increasingly rely on remote KYC, ensuring the authenticity of submitted images and videos has become critical.
              </p>
              <p className="text-textMuted leading-relaxed">
                Our platform goes beyond traditional verification methods by analyzing visual artifacts, facial inconsistencies, and behavioral patterns to detect signs of manipulation. Instead of relying solely on black-box models, RealEyes combines computer vision techniques with explainable insights, allowing users to understand <em>why</em> a submission is flagged as suspicious.
              </p>
              <p className="text-textMuted leading-relaxed">
                We are focused on building a system that is not only accurate, but also transparent and easy to use for non-technical teams. By providing clear risk scores, highlighted anomalies, and actionable recommendations, RealEyes empowers organizations to make faster and more reliable verification decisions.
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
              {'>'} INITIATING FORENSIC KERNEL...<br />
              {'>'} LOADING TENSORS [||||||||||  ] 84%<br />
              {'>'} WAITING FOR QUERY...
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
