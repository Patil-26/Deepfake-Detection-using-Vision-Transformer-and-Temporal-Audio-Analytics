import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ImageDetect from './pages/ImageDetect';
import VideoDetect from './pages/VideoDetect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Pricing from './pages/Pricing';

// Deepguard Web Application Portal
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upgrade" element={<Pricing />} />
              
              {/* Protected Core Tools */}
              <Route path="/detect-image" element={
                <ProtectedRoute>
                  <ImageDetect />
                </ProtectedRoute>
              } />
              
              {/* Placeholder routes for the other nav links */}
              <Route path="/detect-video" element={
                <ProtectedRoute>
                  <VideoDetect />
                </ProtectedRoute>
              } />
              <Route path="/detect-audio" element={<div className="p-20 text-center text-textMuted">Audio Detection Module Coming Soon</div>} />

            </Routes>
          </main>
        </div>
      </Router>
      </SubscriptionProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
