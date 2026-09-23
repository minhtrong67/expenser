import Icon from './Icon';

export function IconPicker({ icons, value, onChange }) {
  return (
    <div className="grid max-h-52 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-zinc-100 p-2.5 sm:grid-cols-8 dark:border-zinc-800">
      {icons.map((ic) => (
        <button
          key={ic}
          type="button"
          onClick={() => onChange(ic)}
          title={ic}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
            value === ic
              ? 'border-accent-500 bg-accent-50 text-accent-600 dark:bg-accent-500/10'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
          }`}
        >
          <Icon name={ic} />
        </button>
      ))}
    </div>
  );
}

export function ColorPicker({ colors, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-white transition dark:ring-offset-zinc-900"
          style={{ backgroundColor: c, boxShadow: value === c ? `0 0 0 2px ${c}` : 'none' }}
          aria-label={c}
        >
          {value === c && <Icon name="check" className="text-white" size={16} />}
        </button>
      ))}
    </div>
  );
}
