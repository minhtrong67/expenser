import { useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import Icon from '../components/ui/Icon';
import Emoji from '../components/ui/Emoji';
import { CardSkeleton, ChartSkeleton, RowSkeleton } from '../components/ui/Skeleton';
import { useData } from '../contexts/DataContext';
import { getCategoryEmoji } from '../utils/categoryEmoji';
import { formatMoney, formatDateShort, formatTime, monthKey } from '../utils/format';

function ChangeBadge({ current, previous }) {
  if (!previous) return null;
  const diff = current - previous;
  const pct = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((diff / previous) * 100);
  const positive = diff >= 0;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
      <Icon name={positive ? 'trending_up' : 'trending_down'} size={14} />
      {Math.abs(pct)}%<span className="hidden sm:inline">&nbsp;so với tháng trước</span>
    </span>
  );
}

export default function Dashboard() {
  const { transactions, categories, wallets, stats, loading, getCategory, getWallet } = useData();
  const { openAddTx } = useOutletContext();

  const dailySeries = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const map = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      thu: 0,
      chi: 0,
    }));
    stats.thisMonthTx.forEach((t) => {
      const d = t.date.getDate() - 1;
      if (map[d]) {
        if (t.type === 'income') map[d].thu += t.amount;
        else map[d].chi += t.amount;
      }
    });
    return map;
  }, [stats.thisMonthTx]);

  const categoryBreakdown = useMemo(() => {
    const byCategory = {};
    stats.thisMonthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
      });
    return Object.entries(byCategory)
      .map(([catId, value]) => {
        const cat = getCategory(catId);
        return { name: cat?.name || 'Khác', value, color: cat?.color || '#94A3B8' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [stats.thisMonthTx, getCategory]);

  const recent = transactions.slice(0, 6);
  const remaining = stats.monthIncome - stats.monthExpense;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const noWallets = wallets.length === 0;
  const noCategories = categories.length === 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {(noWallets || noCategories) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <Icon name="info" className="mt-0.5 shrink-0" />
          <span>Đang khởi tạo ví và danh mục mặc định cho bạn. Vui lòng chờ trong giây lát hoặc tải lại trang.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          icon="account_balance_wallet"
          label="Tổng số dư"
          value={formatMoney(stats.totalBalance)}
          iconBg="bg-accent-50 text-accent-600 dark:bg-accent-500/10"
        />
        <SummaryCard
          icon="arrow_upward"
          label="Thu nhập tháng này"
          value={formatMoney(stats.monthIncome)}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
          badge={<ChangeBadge current={stats.monthIncome} previous={stats.lastMonthIncome} />}
        />
        <SummaryCard
          icon="arrow_downward"
          label="Chi tiêu tháng này"
          value={formatMoney(stats.monthExpense)}
          iconBg="bg-rose-50 text-rose-600 dark:bg-rose-500/10"
          badge={<ChangeBadge current={stats.monthExpense} previous={stats.lastMonthExpense} />}
        />
        <SummaryCard
          icon="savings"
          label="Còn lại tháng này"
          value={formatMoney(remaining)}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"
          valueClass={remaining < 0 ? 'text-rose-500' : ''}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Thu chi theo ngày trong tháng</h3>
          </div>
          {dailySeries.every((d) => d.thu === 0 && d.chi === 0) ? (
            <EmptyState icon="show_chart" text="Chưa có giao dịch nào trong tháng này." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailySeries}>
                <defs>
                  <linearGradient id="thuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="chiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}tr` : v >= 1000 ? `${v / 1000}k` : v)}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(v) => formatMoney(v)}
                  labelFormatter={(d) => `Ngày ${d}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="thu" name="Thu nhập" stroke="#10B981" fill="url(#thuGrad)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="chi" name="Chi tiêu" stroke="#F43F5E" fill="url(#chiGrad)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Chi tiêu theo danh mục</h3>
          {categoryBreakdown.length === 0 ? (
            <EmptyState icon="donut_large" text="Chưa có dữ liệu chi tiêu." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2} isAnimationActive={false}>
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {categoryBreakdown.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formatMoney(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Giao dịch gần đây</h3>
            <Link to="/transactions" className="text-xs font-semibold text-accent-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon="receipt_long" text="Chưa có giao dịch nào." action={{ label: 'Thêm giao dịch', onClick: openAddTx }} />
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {recent.map((t, idx) => {
                const cat = getCategory(t.categoryId);
                const wallet = getWallet(t.walletId);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 animate-slide-up hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${cat?.color || '#94A3B8'}20`, color: cat?.color || '#94A3B8' }}
                    >
                      <Emoji size={20}>{getCategoryEmoji(cat)}</Emoji>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {cat?.name || 'Khác'} {t.note ? `· ${t.note}` : ''}
                      </p>
                      <p className="text-xs text-zinc-400">{formatDateShort(t.date)} · {formatTime(t.date)} · {wallet?.name}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Số dư theo ví</h3>
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${w.color}20`, color: w.color }}>
                  <Icon name={w.icon} size={18} />
                </span>
                <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-300">{w.name}</span>
                <span className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                  {formatMoney(w.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, iconBg, badge, valueClass = '' }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200/60 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${iconBg}`}>
          <Icon name={icon} size={19} />
        </span>
        {badge}
      </div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className={`mt-1 truncate text-lg font-bold tabular-nums text-zinc-900 sm:text-xl dark:text-zinc-50 ${valueClass}`}>{value}</p>
    </div>
  );
}

export function EmptyState({ icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
        <Icon name={icon} size={28} />
      </span>
      <p className="max-w-xs text-sm text-zinc-400">{text}</p>
      {action && (
        <button onClick={action.onClick} className="text-sm font-semibold text-accent-600 hover:underline">
          {action.label}
        </button>
      )}
    </div>
  );
}
