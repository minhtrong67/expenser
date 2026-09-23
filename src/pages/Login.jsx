import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Field from '../components/ui/Field';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isNonEmpty } from '../utils/validators';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const redirectTo = location.state?.from || '/';

  function validate() {
    const errs = {};
    const email = form.email.trim();
    if (!isNonEmpty(email)) errs.email = 'Vui lòng nhập email.';
    else if (!isValidEmail(email)) errs.email = 'Email không hợp lệ.';
    if (!isNonEmpty(form.password)) errs.password = 'Vui lòng nhập mật khẩu.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await login(form.email.trim(), form.password);
    setLoading(false);
    if (res.success) {
      toast.success('Đăng nhập thành công!');
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(res.error);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      toast.success('Đăng nhập thành công!');
      navigate(redirectTo, { replace: true });
    } else if (res.error) {
      toast.error(res.error);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Chào mừng trở lại</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Đăng nhập để tiếp tục quản lý chi tiêu của bạn.</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
        <Field label="Email" required error={errors.email}>
          <TextInput
            icon="mail"
            type="email"
            placeholder="ban@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
          />
        </Field>
        <Field label="Mật khẩu" required error={errors.password}>
          <div className="relative">
            <TextInput
              icon="lock"
              type={showPw ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              tabIndex={-1}
            >
              <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
            </button>
          </div>
        </Field>
        <div className="-mt-1 flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-accent-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Đăng nhập
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400">hoặc</span>
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        loading={googleLoading}
        onClick={handleGoogle}
      >
        <GoogleIcon /> Đăng nhập với Google
      </Button>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-accent-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthLayout>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.5 0-14 4.1-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.9 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
