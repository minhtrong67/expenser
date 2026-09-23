import { useMemo, useState } from 'react';
import Icon from '../components/ui/Icon';
import Emoji from '../components/ui/Emoji';
import Modal from '../components/ui/Modal';
import { EmptyState } from './Dashboard';
import { useData } from '../contexts/DataContext';
import { getCategoryEmoji } from '../utils/categoryEmoji';
import { formatMoney, formatDate, formatTime, formatCompactMoney } from '../utils/format';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function CalendarPage() {
  const { transactions, getCategory, getWallet } = useData();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const dayMap = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type !== 'transfer' && t.date.getFullYear() === year && t.date.getMonth() === month)
      .forEach((t) => {
        const d = t.date.getDate();
        if (!map[d]) map[d] = { income: 0, expense: 0, items: [] };
        if (t.type === 'income') map[d].income += t.amount;
        else map[d].expense += t.amount;
        map[d].items.push(t);
      });
    return map;
  }, [transactions, year, month]);

  const monthTotals = useMemo(() => {
    return Object.values(dayMap).reduce(
      (acc, d) => {
        acc.income += d.income;
        acc.expense += d.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [dayMap]);

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  function goToday() {
    setCursor(new Date());
  }

  const selectedItems = selectedDay ? (dayMap[selectedDay]?.items || []).sort((a, b) => b.date - a.date) : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <button onClick={() => changeMonth(-1)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Tháng trước">
          <Icon name="chevron_left" />
        </button>
        <button onClick={goToday} className="flex flex-col items-center">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Tháng {month + 1} / {year}</h2>
          {!isCurrentMonth && <span className="text-[11px] font-medium text-accent-600">Về hôm nay</span>}
        </button>
        <button onClick={() => changeMonth(1)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Tháng sau">
          <Icon name="chevron_right" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <Icon name="arrow_upward" size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-zinc-400">Thu nhập tháng</p>
            <p className="truncate text-sm font-bold tabular-nums text-zinc-900 sm:text-base dark:text-zinc-50">{formatMoney(monthTotals.income)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
            <Icon name="arrow_downward" size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-zinc-400">Chi tiêu tháng</p>
            <p className="truncate text-sm font-bold tabular-nums text-zinc-900 sm:text-base dark:text-zinc-50">{formatMoney(monthTotals.expense)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400">
          {WEEKDAYS.map((w) => <div key={w}>{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const data = dayMap[day];
            const isToday = isCurrentMonth && today.getDate() === day;
            const net = data ? data.income - data.expense : 0;
            const hasData = !!data;
            const tone = !hasData
              ? ''
              : net >= 0
              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20'
              : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20';
            return (
              <button
                key={day}
                onClick={() => data && setSelectedDay(day)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-center transition ${
                  hasData ? tone : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                } ${isToday ? 'ring-2 ring-accent-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900' : ''}`}
              >
                <span className={`text-[11px] font-semibold sm:text-xs ${isToday ? 'text-accent-600' : 'text-zinc-600 dark:text-zinc-300'}`}>{day}</span>
                {data?.income > 0 && (
                  <span className="text-[9px] font-bold leading-none text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                    +{formatCompactMoney(data.income)}
                  </span>
                )}
                {data?.expense > 0 && (
                  <span className="text-[9px] font-bold leading-none text-rose-500 sm:text-[10px] dark:text-rose-400">
                    -{formatCompactMoney(data.expense)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-5 border-t border-zinc-50 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Ngày có lãi (thu &ge; chi)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Ngày âm (chi &gt; thu)
          </span>
        </div>
      </div>

      <Modal open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? `Ngày ${selectedDay}/${month + 1}/${year}` : ''} size="md">
        {selectedItems.length === 0 ? (
          <EmptyState icon="event_busy" text="Không có giao dịch nào." />
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {selectedItems.map((t) => {
              const cat = getCategory(t.categoryId);
              const wallet = getWallet(t.walletId);
              return (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}>
                    <Emoji size={18}>{getCategoryEmoji(cat)}</Emoji>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{cat?.name} {t.note ? `· ${t.note}` : ''}</p>
                    <p className="text-xs text-zinc-400">{wallet?.name} · {formatDate(t.date)} · {formatTime(t.date)}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
