import { Shield, Zap, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Image Detect', path: '/detect-image' },
    { name: 'Video Detect', path: '/detect-video' },
    { name: 'Audio Detect', path: '/detect-audio' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-deepBase/90 backdrop-blur-md sticky top-0 z-50 border-b border-deepBorder">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="p-2 border border-deepRed/30 rounded-lg group-hover:glow-red transition-all duration-300">
          <Shield className="w-5 h-5 text-deepRed" />
        </div>
        <span className="font-display font-bold text-xl tracking-wider uppercase text-white group-hover:glow-text-red transition-all duration-300">
          RealEyes <span className="text-deepRed">AI</span>
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

      {/* Auth Actions - Commented out for direct access without login */}
      {/* 
      <div className="flex items-center gap-3">
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
      */}
      <div className="flex items-center gap-3">
        <Link 
          to="/detect-image" 
          className="flex items-center gap-2 px-5 py-2.5 bg-deepCard border border-deepRed/60 rounded-lg text-deepRed text-sm font-semibold hover:bg-deepRed hover:text-white hover:glow-red transition-all duration-300 group shadow-[0_0_15px_rgba(255,59,48,0.15)]"
        >
          <Zap className="w-4 h-4 fill-deepRed group-hover:fill-white group-hover:animate-pulse" />
          START DETECTING
        </Link>
      </div>

    </nav>
  );
}
