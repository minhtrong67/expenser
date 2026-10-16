import Icon from './Icon';

// Material 3 button types
const VARIANTS = {
  filled: 'bg-primary text-on-primary hover:shadow-elev-1',
  tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-elev-1',
  outlined: 'border border-outline text-primary',
  text: 'text-primary',
  danger: 'bg-error text-on-error hover:shadow-elev-1',
  'outlined-danger': 'border border-outline text-error',
  'text-danger': 'text-error',
};

const SIZES = {
  sm: 'h-9 px-4 text-label-lg',
  md: 'h-10 px-6 text-label-lg',
  lg: 'h-12 px-8 text-title-sm',
};

export default function Button({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`state-layer ripple inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full transition-shadow duration-200 ease-emphasized disabled:cursor-not-allowed disabled:bg-on-surface/10 disabled:text-on-surface/40 disabled:shadow-none disabled:[border-color:transparent] ${VARIANTS[variant]} ${SIZES[size]} ${icon || loading ? 'pl-4' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      {children}
    </button>
  );
}
