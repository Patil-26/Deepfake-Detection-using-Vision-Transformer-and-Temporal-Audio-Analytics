import { Shield, Zap, LogOut, User, Download, X, MonitorPlay, Tag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Image Detect', path: '/detect-image' },
    { name: 'Video Detect', path: '/detect-video' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-deepBase/90 backdrop-blur-md sticky top-0 z-50 border-b border-deepBorder">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group cursor-pointer">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-deepRed/30 group-hover:glow-red transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.3)]">
          <img src="/logo.png?v=3" alt="RealEyes Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-display font-bold text-xl tracking-wider uppercase text-white group-hover:glow-text-red transition-all duration-300 flex items-baseline">
          <span className="text-[1.25em]">R</span>EAL<span className="text-[1.25em]">E</span>YES
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={clsx(
                "text-sm font-medium transition-colors duration-200",
                isActive 
                  ? "text-white" 
                  : "text-textMuted hover:text-white"
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Auth Actions */}
      <div className="flex items-center gap-3">
        {/* Pricing Button */}
        <Link
          to="/pricing"
          className="text-xs font-bold tracking-wide flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-800 to-rose-600 border border-rose-500/80 rounded shadow-[0_0_25px_rgba(225,29,72,0.9)] text-white hover:scale-105 hover:shadow-[0_0_35px_rgba(225,29,72,1)] hover:from-red-700 hover:to-rose-500 transition-all duration-300 cursor-pointer"
        >
          <Tag className="w-3.5 h-3.5" />
          PRICING
        </Link>

        {/* Extension Download Button (Highlighted) */}
        <a
          href="/realeyes-extension-v1.zip"
          download
          onClick={() => setIsExtModalOpen(true)}
          className="text-xs font-bold tracking-wide flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-800 to-rose-600 border border-rose-500/80 rounded shadow-[0_0_25px_rgba(225,29,72,0.9)] text-white hover:scale-105 hover:shadow-[0_0_35px_rgba(225,29,72,1)] hover:from-red-700 hover:to-rose-500 transition-all duration-300 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          EXTENSION
        </a>
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-deepBorder rounded bg-deepCard text-xs font-mono text-textMuted">
              <User className="w-3 h-3 text-deepGreen" /> {user.name}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-deepBorder rounded-lg text-textMuted text-sm font-semibold hover:bg-deepBase hover:text-white transition-all flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-textMuted hover:text-white transition-colors">
              LOGIN
            </Link>
            <Link to="/signup" className="flex items-center gap-2 px-6 py-2.5 bg-deepCard border border-deepRed/50 rounded-lg text-deepRed text-sm font-semibold hover:bg-deepRed/10 hover:glow-red transition-all duration-300 group whitespace-nowrap">
              <Zap className="w-4 h-4 fill-deepRed group-hover:animate-pulse" />
              SIGN UP
            </Link>
          </>
        )}
      </div>

      </nav>

      {/* Modern Hackathon Installation Modal */}
      {isExtModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative bg-[#0a0a0a] border border-blue-500/20 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(37,99,235,0.15)] flex flex-col gap-6">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsExtModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <MonitorPlay className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-wide text-white">Installation Guide</h3>
                <p className="text-sm text-slate-400 mt-0.5">Test RealEyes directly on your browser.</p>
              </div>
            </div>

            {/* Stepper Instructions */}
            <div className="flex flex-col gap-6 pl-2 mt-2">
              
              <div className="flex items-start gap-4 relative before:content-[''] before:absolute before:left-[11px] before:top-6 before:bottom-[-24px] before:w-[2px] before:bg-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 relative z-10">1</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Automatic Download Started!</h4>
                  <p className="text-xs text-slate-400 mt-1">The compiled ZIP file should now be in your Downloads folder.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative before:content-[''] before:absolute before:left-[11px] before:top-6 before:bottom-[-24px] before:w-[2px] before:bg-slate-800">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 relative z-10">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Extract the Archive</h4>
                  <p className="text-xs text-slate-400 mt-1">Unzip the downloaded file to a permanent folder on your computer.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 relative before:content-[''] before:absolute before:left-[11px] before:top-6 before:bottom-[-24px] before:w-[2px] before:bg-slate-800">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 relative z-10">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Open Extension Center</h4>
                  <p className="text-xs text-slate-400 mt-1">Type <code className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-blue-400 font-mono">chrome://extensions</code> in your address bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 relative z-10">4</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Load Unpacked</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Toggle <strong>Developer Mode</strong> ON (top right corner) and click <strong>Load Unpacked</strong> to select the entire folder.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
