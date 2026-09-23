import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import CategoriesPage from './pages/Categories';
import WalletsPage from './pages/Wallets';
import StatisticsPage from './pages/Statistics';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';

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
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
