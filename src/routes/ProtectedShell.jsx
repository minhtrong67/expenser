import { DataProvider } from '../contexts/DataContext';
import AppLayout from '../components/layout/AppLayout';

// Everything behind sign-in (Firestore data layer + app chrome) lives in this
// one lazily-loaded module, so the login screen stays lightweight.
export default function ProtectedShell() {
  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  );
}
