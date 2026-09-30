import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import ImageDetect from './pages/ImageDetect';
import VideoDetect from './pages/VideoDetect';
import AudioDetect from './pages/AudioDetect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

function App() {
  return (
    <GoogleOAuthProvider clientId="684963872923-sri19mctkrsitioh76a4l4sisrrhdrk6.apps.googleusercontent.com">
      <AuthProvider>
      <SubscriptionProvider>
      <Router>
        <div className="min-h-screen bg-deepBase text-white font-sans selection:bg-deepRed/30 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              
              {/* Authentication routes - commented out for direct access
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              */}
              
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/upgrade" element={<Pricing />} />
              
              {/* Direct Access Core Tools (Auth bypassed) */}
              <Route path="/detect-image" element={<ImageDetect />} />
              <Route path="/detect-video" element={<VideoDetect />} />
              <Route path="/detect-audio" element={<AudioDetect />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>

    </SubscriptionProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

