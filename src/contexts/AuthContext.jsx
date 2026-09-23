import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);

function mapAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'Email này đã được sử dụng.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password': 'Mật khẩu không chính xác.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
    'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
    'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra lại.',
  };
  return map[code] || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  async function ensureUserDoc(u) {
    if (!u) return;
    try {
      await setDoc(
        doc(db, 'users', u.uid),
        {
          email: u.email,
          displayName: u.displayName || '',
          photoURL: u.photoURL || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      /* ignore - profile doc is best-effort */
    }
  }

  async function register(name, email, password) {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name?.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await ensureUserDoc({ ...cred.user, displayName: name?.trim() });
      return { success: true, user: cred.user };
    } catch (err) {
      const msg = mapAuthError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  async function login(email, password) {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true, user: cred.user };
    } catch (err) {
      const msg = mapAuthError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  async function loginWithGoogle() {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(cred.user);
      return { success: true, user: cred.user };
    } catch (err) {
      const msg = mapAuthError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err) {
      return { success: false, error: mapAuthError(err.code) };
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: mapAuthError(err.code) };
    }
  }

  async function updateDisplayName(name) {
    if (!auth.currentUser) return { success: false };
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    await ensureUserDoc(auth.currentUser);
    setUser({ ...auth.currentUser });
    return { success: true };
  }

  const value = useMemo(
    () => ({
      user,
      loading: user === undefined,
      authError,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      updateDisplayName,
    }),
    [user, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
