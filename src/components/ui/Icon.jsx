import { HelpCircle } from 'lucide-react';
import ICON_MAP from './iconMap';

export default function Icon({ name, className = '', fill = false, size = 20, style, ...rest }) {
  const Cmp = ICON_MAP[name];
  if (!Cmp) {
    if (import.meta.env.DEV && name) {
      // eslint-disable-next-line no-console
      console.warn(`[Icon] Không tìm thấy icon lucide cho tên: "${name}"`);
    }
    return (
      <HelpCircle
        className={className}
        size={size}
        strokeWidth={2}
        aria-hidden="true"
        style={style}
        {...rest}
      />
    );
  }
  return (
    <Cmp
      className={className}
      size={size}
      strokeWidth={2}
      fill={fill ? 'currentColor' : 'none'}
      aria-hidden="true"
      style={style}
      {...rest}
    />
  );
}
