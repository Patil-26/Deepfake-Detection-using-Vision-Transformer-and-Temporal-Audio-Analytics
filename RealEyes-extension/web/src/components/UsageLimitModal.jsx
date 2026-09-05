import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown, X } from 'lucide-react';

export default function UsageLimitModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 glass-panel border border-deepRed/30 p-8 shadow-[0_0_60px_rgba(255,42,42,0.15)] animate-[scaleIn_0.3s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-white hover:bg-deepCard transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-deepRed/10 border border-deepRed/20">
            <AlertTriangle className="w-10 h-10 text-deepRed" />
          </div>
        </div>

        <div className="text-center space-y-3 mb-8">
          <h3 className="text-xl font-display font-bold text-white">Detection Limit Reached</h3>
          <p className="text-sm text-textMuted leading-relaxed">
            You've reached your monthly detection limit. Upgrade to{' '}
            <span className="text-deepRed font-semibold">Premium</span> for unlimited AI and Deepfake Detection.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full py-3 rounded-xl bg-deepRed/10 border border-deepRed text-deepRed font-semibold text-sm uppercase tracking-wider hover:bg-deepRed hover:text-white hover:glow-red transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-deepBorder bg-deepCard text-textMuted font-semibold text-sm uppercase tracking-wider hover:text-white hover:bg-deepBase transition-all duration-300"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
