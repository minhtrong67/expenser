import Icon from './Icon';

/**
 * Material 3 segmented button. options: [{ id, label, icon?, activeClass? }]
 * `activeClass` lets a segment use semantic colours (e.g. income / expense).
 */
export default function SegmentedButton({ options, value, onChange, className = '', ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`flex h-10 w-full overflow-hidden rounded-full border border-outline ${className}`}
    >
      {options.map((o, i) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`state-layer ripple flex flex-1 items-center justify-center gap-1.5 px-3 text-label-lg transition-colors duration-200 ${
              i > 0 ? 'border-l border-outline' : ''
            } ${active ? o.activeClass || 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'}`}
          >
            {active ? <Icon name="check" size={16} /> : o.icon ? <Icon name={o.icon} size={16} /> : null}
            <span className="wrap-any">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
