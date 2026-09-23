import { forwardRef } from 'react';
import Icon from './Icon';

const TextInput = forwardRef(function TextInput(
  { error, className = '', icon, ...rest },
  ref
) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" style={{ transform: 'translateY(-50%)' }}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 dark:bg-zinc-900 dark:text-zinc-50 ${
          icon ? 'pl-11' : ''
        } ${error ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 dark:border-zinc-700'} ${className}`}
        {...rest}
      />
    </div>
  );
});

export default TextInput;
