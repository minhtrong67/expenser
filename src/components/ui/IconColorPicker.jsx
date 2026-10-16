import Icon from './Icon';

export function IconPicker({ icons, value, onChange }) {
  return (
    <div className="grid max-h-52 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-outline-variant p-2.5 sm:grid-cols-8">
      {icons.map((ic) => (
        <button
          key={ic}
          type="button"
          onClick={() => onChange(ic)}
          title={ic}
          aria-pressed={value === ic}
          className={`state-layer flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            value === ic ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
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
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          aria-pressed={value === c}
          className="flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface-container-high transition-transform duration-200 ease-emphasized hover:scale-110"
          style={{ backgroundColor: c, boxShadow: value === c ? `0 0 0 2px ${c}` : 'none' }}
        >
          {value === c && <Icon name="check" className="text-white" size={16} />}
        </button>
      ))}
    </div>
  );
}
