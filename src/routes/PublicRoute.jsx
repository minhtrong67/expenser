import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../components/ui/SplashScreen';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
