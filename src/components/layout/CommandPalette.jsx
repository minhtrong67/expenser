import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { NAV_ITEMS } from './navConfig';

export default function CommandPalette({ open, onClose, onAddTransaction }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const actions = useMemo(
    () => [
      { id: 'add-tx', label: 'Thêm giao dịch mới', icon: 'add_circle', run: () => onAddTransaction?.() },
      ...NAV_ITEMS.map((n) => ({
        id: n.to,
        label: `Đi tới: ${n.label}`,
        icon: n.icon,
        run: () => navigate(n.to),
      })),
    ],
    [navigate, onAddTransaction]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.trim().toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) {
          item.run();
          onClose();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, filtered, activeIndex, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32">
      <div className="absolute inset-0 animate-fade-in bg-zinc-900/40 backdrop-blur-sm dark:bg-zinc-950/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl mx-4 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
          <Icon name="search" className="text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm chức năng, trang, hoặc thao tác nhanh..."
            className="flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
          <kbd className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 dark:border-zinc-700">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-zinc-400">Không tìm thấy kết quả.</p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                item.run();
                onClose();
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                i === activeIndex ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400' : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
