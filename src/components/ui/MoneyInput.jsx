import { useState, useEffect } from 'react';
import { formatNumber, parseMoneyInput } from '../../utils/format';

export default function MoneyInput({ value, onChange, placeholder = '0', error, suffix = 'đ', autoFocus, id }) {
  const [display, setDisplay] = useState(value ? formatNumber(value) : '');

  useEffect(() => {
    setDisplay(value === '' || value === undefined || value === null ? '' : formatNumber(value));
  }, [value]);

  function handleChange(e) {
    const raw = parseMoneyInput(e.target.value);
    setDisplay(raw ? formatNumber(raw) : '');
    onChange(raw);
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoFocus={autoFocus}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-lg font-semibold tabular-nums text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 focus:border-accent-500 dark:bg-zinc-900 dark:text-zinc-50 ${
          error ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
        }`}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
        {suffix}
      </span>
    </div>
  );
}
