import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Fingerprint, MailCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import clsx from 'clsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/detect-image');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/detect-image');
    } catch (err) {
      setError('Google Authentication Failed');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if(email) {
      setResetSent(true);
      setError(null);
    } else {
      setError('Enter your personnel email first.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden flex flex-col items-center">
        
        {/* Decorative Grid & Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-deepRed/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="text-center mb-6 w-full">
          <div className="p-3 bg-deepBase border border-deepBorder rounded-xl inline-block mb-4">
            <Fingerprint className="w-8 h-8 text-deepRed animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold">Access Terminals</h2>
          <p className="text-textMuted text-sm mt-1">Authenticate to use RealEyes AI tools.</p>
        </div>

        <div className="w-full mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
          />
        </div>

        <div className="flex items-center gap-4 w-full mb-6">
          <div className="h-px bg-deepBorder flex-1" />
          <span className="text-xs font-mono text-textMuted">OR SECURE LOGIN</span>
          <div className="h-px bg-deepBorder flex-1" />
        </div>

        {error && (
          <div className="w-full mb-4 text-xs font-mono text-white bg-deepRed/20 border border-deepRed/50 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {showForgot ? (
           resetSent ? (
            <div className="w-full text-center space-y-4 py-6">
              <MailCheck className="w-12 h-12 text-deepGreen mx-auto animate-bounce" />
              <p className="text-sm text-green-400 font-mono">Security override link dispatched to verified comms channel.</p>
              <button 
                onClick={() => { setShowForgot(false); setResetSent(false); }}
                className="text-white hover:text-deepRed text-sm underline"
              >
                Return to Login
              </button>
            </div>
           ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 w-full">
              <div>
                <label className="text-xs font-mono text-textMuted uppercase tracking-wider mb-2 block">Confirm Personnel Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepRed/50 focus:glow-red transition-all"
                  placeholder="agent@realeyes.ai"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-deepCard border border-deepBorder hover:border-deepRed text-white font-semibold py-3 rounded-lg mt-6 transition-all"
              >
                REQUEST OVERRIDE
              </button>
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="mt-4 text-sm text-textMuted hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
           )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label className="text-xs font-mono text-textMuted uppercase tracking-wider mb-2 block">Personnel Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepRed/50 focus:glow-red transition-all"
                placeholder="agent@realeyes.ai"
                required
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-textMuted uppercase tracking-wider">Access Code</label>
                <button 
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-mono text-deepRed/80 hover:text-deepRed transition-colors"
                >
                  Forgot Access Code?
                </button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepRed/50 focus:glow-red transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-deepRed/10 border border-deepRed text-deepRed font-semibold py-3 rounded-lg mt-6 hover:glow-red transition-all flex items-center justify-center gap-2 group"
            >
              <Shield className="w-5 h-5 group-hover:animate-pulse" />
              INITIALIZE SESSION
            </button>
          </form>
        )}

        <p className="text-center w-full text-sm text-textMuted mt-6">
          No access clearance? <Link to="/signup" className="text-white hover:text-deepRed transition-colors">Request Account</Link>
        </p>

      </div>
    </div>
  );
}
