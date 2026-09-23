import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import Emoji from './Emoji';

export default function ChoiceSelect({ options, value, onChange, placeholder = 'Chọn...', error, emptyLabel = 'Chưa có mục nào' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 text-left text-sm outline-none transition dark:bg-zinc-900 ${
          error ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-700'
        }`}
      >
        {selected ? (
          <>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${selected.color}20`, color: selected.color }}
            >
              {selected.emoji ? <Emoji size={18}>{selected.emoji}</Emoji> : <Icon name={selected.icon} size={18} />}
            </span>
            <span className="flex-1 truncate font-medium text-zinc-800 dark:text-zinc-100">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-zinc-400">{placeholder}</span>
        )}
        <Icon name="expand_more" className="text-zinc-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-scale-in dark:border-zinc-700 dark:bg-zinc-900">
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-zinc-400">{emptyLabel}</p>
          )}
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                opt.id === value ? 'bg-accent-50 dark:bg-accent-500/10' : ''
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${opt.color}20`, color: opt.color }}
              >
                {opt.emoji ? <Emoji size={18}>{opt.emoji}</Emoji> : <Icon name={opt.icon} size={18} />}
              </span>
              <span className="flex-1 truncate font-medium text-zinc-700 dark:text-zinc-200">{opt.name}</span>
              {opt.subtitle && <span className="text-xs text-zinc-400">{opt.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
