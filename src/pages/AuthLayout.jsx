import Icon from '../components/ui/Icon';

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
                <Icon name="arrow_upward" size={16} className="text-emerald-300" />
                <span className="text-white/80">Thu 18.000.000đ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="arrow_downward" size={16} className="text-rose-200" />
                <span className="text-white/80">Chi 5.500.000đ</span>
              </div>
            </div>
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-2/3 bg-white/80" />
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/60">
          Theo dõi thu chi, ngân sách và mục tiêu tài chính trong một nơi duy nhất.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
