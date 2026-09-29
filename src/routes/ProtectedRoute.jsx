import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-zinc-200 border-t-accent-600 dark:border-zinc-800 dark:border-t-accent-500" />
          <img
            src="/icons/icon-192.png"
            alt="Expenser"
            draggable={false}
            className="h-9 w-9"
          />
        </div>
        <p className="text-sm text-zinc-400">Đang tải...</p>
        <span className="sr-only">Đang tải Expenser, vui lòng chờ trong giây lát</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
