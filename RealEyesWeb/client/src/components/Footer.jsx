import { Link } from 'react-router-dom';
import { Shield, Hash, Terminal, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-deepBase border-t border-deepBorder mt-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[100px] bg-deepRed/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="p-2 border border-deepRed rounded-lg bg-deepRed/10 group-hover:glow-red transition-all">
                <Shield className="w-5 h-5 text-deepRed" />
              </div>
              <span className="font-display font-bold uppercase tracking-wider text-xl">
                Deepguard <span className="text-white">AI</span>
              </span>
            </Link>
            <p className="text-sm text-textMuted max-w-sm leading-relaxed">
              Democratizing cryptographic truth and defending digital reality against the weaponization of synthetic media.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-deepCard border border-deepBorder text-textMuted hover:text-white hover:border-textMuted transition-colors">
                <Hash className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-deepCard border border-deepBorder text-textMuted hover:text-white hover:border-textMuted transition-colors">
                <Terminal className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-deepCard border border-deepBorder text-textMuted hover:text-white hover:border-textMuted transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider font-semibold">Core Engines</h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li><Link to="/detect-image" className="hover:text-deepRed hover:underline underline-offset-4 transition-colors">Vision Net (Images)</Link></li>
              <li><Link to="/detect-video" className="hover:text-deepRed hover:underline underline-offset-4 transition-colors">Temporal Net (Video)</Link></li>
              <li><Link to="/detect-audio" className="hover:text-deepRed hover:underline underline-offset-4 transition-colors">Acoustic Net (Voice)</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Documentation</span></li>
            </ul>
          </div>

        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-deepBorder/50 mt-12 pt-8 text-xs text-textMuted font-mono">
          <p>&copy; {new Date().getFullYear()} Deepguard Foundation. All system protocols operational.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Mail className="w-3 h-3" /> Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
