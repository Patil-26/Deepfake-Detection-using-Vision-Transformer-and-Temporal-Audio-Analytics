import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen bg-deepBase flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin"/></div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
