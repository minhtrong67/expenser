import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = location.state?.from || "/";

  async function handleGoogle() {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      toast.success("Đăng nhập thành công!");
      navigate(redirectTo, { replace: true });
    } else if (res.error) {
      toast.error(res.error);
    }
  }

  return (
    <AuthLayout>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
        {/* Base wash: deep zinc with a faint warm-to-cool drift, dark by design so the chart line reads as the bright element */}
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0a0a0c_0%,#101114_45%,#0b0d12_100%)]" />

        {/* The trend line: a hero motif, not decoration — an expense/wallet app is fundamentally about a line going the right direction */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[68%] w-full text-accent-400 sm:h-[75%]"
          viewBox="0 0 400 500"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="loginTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-20 430 C 40 410, 70 370, 110 380 C 150 390, 170 320, 210 300 C 250 280, 265 220, 300 190 C 335 160, 350 120, 420 60 L 420 520 L -20 520 Z"
            fill="url(#loginTrendFill)"
          />
          <path
            d="M-20 430 C 40 410, 70 370, 110 380 C 150 390, 170 320, 210 300 C 250 280, 265 220, 300 190 C 335 160, 350 120, 420 60"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="300"
            cy="190"
            r="4"
            fill="currentColor"
            fillOpacity="0.7"
          />
          <circle
            cx="300"
            cy="190"
            r="4"
            fill="currentColor"
            fillOpacity="0.35"
            className="motion-safe:animate-ping [animation-duration:3.5s]"
          />
        </svg>

        {/* Quiet depth glow behind the line's peak — the one soft accent, kept subtle */}
        <div className="absolute right-[8%] top-[22%] h-40 w-40 rounded-full bg-accent-500/20 blur-3xl motion-safe:animate-pulse [animation-duration:6s] sm:h-56 sm:w-56" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl sm:h-72 sm:w-72" />

        {/* Faint vignette so light-mode content still sits on a controlled dark stage */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>

      {/* Login content */}
      <div className="relative mx-auto w-full max-w-sm px-1">
        <div
          className="
            rounded-2xl
            border border-white/70
            bg-white/90
            p-5
            shadow-[0_16px_50px_-20px_rgba(0,0,0,0.28)]
            backdrop-blur-xl
            sm:rounded-[2rem]
            sm:p-8
            sm:shadow-[0_24px_80px_-28px_rgba(0,0,0,0.28)]
            dark:border-zinc-800/80
            dark:bg-zinc-900/90
            dark:shadow-[0_16px_50px_-20px_rgba(0,0,0,0.7)]
            dark:sm:shadow-[0_24px_80px_-28px_rgba(0,0,0,0.7)]
          "
        >
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center sm:items-start sm:text-left">
            <div
              className="
                mb-4
                flex h-11 w-11 items-center justify-center
                rounded-2xl
                bg-accent-500
                text-white
                shadow-lg shadow-accent-500/20
                sm:mb-5 sm:h-12 sm:w-12
              "
            >
              <Icon name="account_balance_wallet" size={22} />
            </div>

            <h1
              className="
                text-xl
                font-bold
                tracking-tight
                text-zinc-900
                sm:text-[28px]
                dark:text-zinc-50
              "
            >
              Chào mừng trở lại
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500 sm:max-w-sm dark:text-zinc-400">
              Đăng nhập để tiếp tục quản lý chi tiêu của bạn.
            </p>
          </div>

          <Button
            type="button"
            variant="customwhite"
            size="lg"
            className="
              w-full
              justify-center
              gap-2
              border border-zinc-200/90
              bg-white/90
              font-semibold
              text-zinc-700
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-zinc-300
              hover:bg-white
              hover:shadow-md
              active:translate-y-0
              dark:border-zinc-700
              dark:bg-zinc-800/80
              dark:text-zinc-100
              dark:hover:border-zinc-600
              dark:hover:bg-zinc-800
            "
            loading={googleLoading}
            onClick={handleGoogle}
          >
            <GoogleIcon />
            <span>Đăng nhập với Google</span>
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <Icon name="lock" size={14} />
            <span>Thông tin đăng nhập được bảo mật</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.5 0-14 4.1-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.9 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
