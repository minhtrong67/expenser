import Icon from "../components/ui/Icon";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-accent-600 p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Icon name="account_balance_wallet" fill size={20} />
          </div>
          <span className="text-lg font-bold">Expenser</span>
        </div>

        <div className="relative">
          <p className="mb-6 max-w-sm text-3xl font-bold leading-snug">
            Kiểm soát dòng tiền, an tâm mỗi ngày.
          </p>
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-medium text-white/70">Số dư tổng</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">12.500.000đ</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Icon
                  name="arrow_upward"
                  size={16}
                  className="text-emerald-300"
                />
                <span className="text-white/80">Thu 18.000.000đ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon
                  name="arrow_downward"
                  size={16}
                  className="text-rose-200"
                />
                <span className="text-white/80">Chi 5.500.000đ</span>
              </div>
            </div>
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-2/3 bg-white/80" />
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/60">
          Theo dõi thu chi, ngân sách và mục tiêu tài chính trong một nơi duy
          nhất.
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10 sm:px-10">
        {/* Mobile/tablet hero backdrop — below lg the brand panel is hidden, so this side
           needs its own presence instead of a flat bg-white/zinc-950. Desktop keeps the
           plain side since the accent-600 panel already carries the brand there. */}
        <div className="absolute inset-0 -z-10 lg:hidden">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#0a0a0c_0%,#101114_45%,#0b0d12_100%)]" />

          <svg
            className="absolute inset-x-0 bottom-0 h-[60%] w-full text-accent-400"
            viewBox="0 0 400 500"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="authTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-20 430 C 40 410, 70 370, 110 380 C 150 390, 170 320, 210 300 C 250 280, 265 220, 300 190 C 335 160, 350 120, 420 60 L 420 520 L -20 520 Z"
              fill="url(#authTrendFill)"
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

          <div className="absolute right-[10%] top-[16%] h-40 w-40 rounded-full bg-accent-500/20 blur-3xl motion-safe:animate-pulse [animation-duration:6s]" />
          <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>

        <div className="w-full max-w-sm animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
