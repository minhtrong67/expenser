import { HelpCircle } from 'lucide-react';
import ICON_MAP from './iconMap';

export default function Icon({ name, className = '', fill = false, size = 20, style, ...rest }) {
  const Cmp = ICON_MAP[name] || HelpCircle;
  return (
    <Cmp
      className={`shrink-0 ${className}`}
      size={size}
      strokeWidth={2}
      fill={fill ? 'currentColor' : 'none'}
      aria-hidden="true"
      style={style}
      {...rest}
    />
  );
}
