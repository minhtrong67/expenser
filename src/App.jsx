import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { DataProvider } from "./contexts/DataContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import RouteFallback from "./components/ui/RouteFallback";

// Every page is its own chunk, only fetched when the user actually
// navigates there - keeps the first paint (login screen) from having to
// download/parse recharts, jsPDF, and every other page's code up front.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TransactionsPage = lazy(() => import("./pages/Transactions"));
const CategoriesPage = lazy(() => import("./pages/Categories"));
const WalletsPage = lazy(() => import("./pages/Wallets"));
const StatisticsPage = lazy(() => import("./pages/Statistics"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'rgb(var(--toast-bg))',
                  color: 'rgb(var(--toast-fg))',
                  border: '1px solid rgb(var(--toast-border))',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
                error: { iconTheme: { primary: '#F43F5E', secondary: 'white' } },
              }}
            />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="wallets" element={<WalletsPage />} />
                  <Route path="statistics" element={<StatisticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Old routes kept as redirects so existing bookmarks/PWA shortcuts still work */}
                  <Route path="calendar" element={<Navigate to="/transactions" replace />} />
                  <Route path="budget" element={<Navigate to="/" replace />} />
                  <Route path="recurring" element={<Navigate to="/" replace />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
