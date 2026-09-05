import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import clsx from 'clsx';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      await register(name, email, password);
      navigate('/detect-image');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden flex flex-col items-center">
        
        {/* Decorative Grid & Glow */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-deepGreen/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="text-center mb-6 w-full">
          <div className="p-3 bg-deepBase border border-deepBorder rounded-xl inline-block mb-4">
            <UserPlus className="w-8 h-8 text-deepGreen animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold">Request Clearance</h2>
          <p className="text-textMuted text-sm mt-1">Register a new analyst account.</p>
        </div>

        <div className="w-full mb-6 flex justify-center relative z-10">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
          />
        </div>

        <div className="flex items-center gap-4 w-full mb-6 relative z-10">
          <div className="h-px bg-deepBorder flex-1" />
          <span className="text-xs font-mono text-textMuted">OR REGISTER EMAIL</span>
          <div className="h-px bg-deepBorder flex-1" />
        </div>

        {error && (
          <div className="w-full z-10 mb-4 text-xs font-mono text-white bg-deepRed/20 border border-deepRed/50 p-3 rounded-lg flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-deepRed" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-mono text-textMuted uppercase tracking-wider mb-2 block">Agent Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepGreen/50 focus:glow-green transition-all"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="text-xs font-mono text-textMuted uppercase tracking-wider mb-2 block">Personnel Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepGreen/50 focus:glow-green transition-all"
              placeholder="agent@deepguard.ai"
              required
            />
          </div>
          <div>
            <label className="text-xs font-mono text-textMuted uppercase tracking-wider mb-2 block">Security Token (Password)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepGreen/50 focus:glow-green transition-all"
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-deepGreen/10 border border-deepGreen text-deepGreen font-semibold py-3 rounded-lg mt-6 hover:glow-green transition-all flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center text-sm text-textMuted mt-6">
          Already have clearance? <Link to="/login" className="text-white hover:text-deepGreen transition-colors">Login</Link>
        </p>

      </div>
    </div>
  );
}
