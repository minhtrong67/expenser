import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../components/ui/SplashScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
