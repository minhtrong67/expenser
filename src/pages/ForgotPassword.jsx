import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Field from '../components/ui/Field';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isNonEmpty } from '../utils/validators';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!isNonEmpty(trimmed)) return setError('Vui lòng nhập email.');
    if (!isValidEmail(trimmed)) return setError('Email không hợp lệ.');
    setError('');
    setLoading(true);
    const res = await resetPassword(trimmed);
    setLoading(false);
    if (res.success) {
      setSent(true);
      toast.success('Đã gửi email đặt lại mật khẩu.');
    } else {
      toast.error(res.error);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Quên mật khẩu</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
      </p>

      {sent ? (
        <div className="mt-7 flex flex-col items-center gap-3 rounded-2xl bg-accent-50 px-5 py-8 text-center dark:bg-accent-500/10">
          <Icon name="mark_email_read" size={36} className="text-accent-600" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Email đặt lại mật khẩu đã được gửi tới <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
          <Field label="Email" required error={error}>
            <TextInput
              icon="mail"
              type="email"
              placeholder="ban@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Gửi liên kết đặt lại
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link to="/login" className="font-semibold text-accent-600 hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
