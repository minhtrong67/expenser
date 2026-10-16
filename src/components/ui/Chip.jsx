import Icon from './Icon';

/** Material 3 filter chip. */
export default function Chip({ selected = false, onClick, children, icon, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`state-layer ripple inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-label-lg transition-colors duration-200 ${
        selected
          ? 'border-transparent bg-secondary-container text-on-secondary-container'
          : 'border-outline text-on-surface-variant'
      } ${className}`}
    >
      {selected ? <Icon name="check" size={16} /> : icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}
