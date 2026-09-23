import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Field from '../components/ui/Field';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isNonEmpty, isStrongPassword, maxLength } from '../utils/validators';
import { GoogleIcon } from './Login';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function validate() {
    const errs = {};
    const name = form.name.trim();
    const email = form.email.trim();
    if (!isNonEmpty(name)) errs.name = 'Vui lòng nhập họ tên.';
    else if (!maxLength(name, 60)) errs.name = 'Họ tên tối đa 60 ký tự.';
    if (!isNonEmpty(email)) errs.email = 'Vui lòng nhập email.';
    else if (!isValidEmail(email)) errs.email = 'Email không hợp lệ.';
    if (!isNonEmpty(form.password)) errs.password = 'Vui lòng nhập mật khẩu.';
    else if (!isStrongPassword(form.password)) errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.confirm !== form.password) errs.confirm = 'Mật khẩu nhập lại không khớp.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await register(form.name, form.email.trim(), form.password);
    setLoading(false);
    if (res.success) {
      toast.success('Tạo tài khoản thành công!');
      navigate('/', { replace: true });
    } else {
      toast.error(res.error);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      toast.success('Tạo tài khoản thành công!');
      navigate('/', { replace: true });
    } else if (res.error) {
      toast.error(res.error);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tạo tài khoản mới</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Bắt đầu quản lý chi tiêu thông minh hơn ngay hôm nay.</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
        <Field label="Họ và tên" required error={errors.name}>
          <TextInput
            icon="person"
            placeholder="Nguyễn Văn A"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, name: e.target.value.trim() }))}
            error={errors.name}
            autoComplete="name"
          />
        </Field>
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
        <Field label="Mật khẩu" required error={errors.password} hint="Tối thiểu 6 ký tự">
          <div className="relative">
            <TextInput
              icon="lock"
              type={showPw ? 'text' : 'password'}
              placeholder="Tạo mật khẩu"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="new-password"
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
        <Field label="Nhập lại mật khẩu" required error={errors.confirm}>
          <TextInput
            icon="lock_reset"
            type={showPw ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            error={errors.confirm}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Tạo tài khoản
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400">hoặc</span>
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full" loading={googleLoading} onClick={handleGoogle}>
        <GoogleIcon /> Đăng ký với Google
      </Button>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-accent-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
