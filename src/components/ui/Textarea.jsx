import { forwardRef, useEffect, useRef } from 'react';
import Icon from './Icon';

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((r) => {
      if (typeof r === 'function') r(node);
      else if (r) r.current = node;
    });
  };
}

const Textarea = forwardRef(function Textarea(
  { error, className = '', icon, value, onChange, ...rest },
  ref
) {
  const innerRef = useRef(null);

  function resize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    resize(innerRef.current);
  }, [value]);

  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-3.5 text-zinc-400">
          <Icon name={icon} size={20} />
        </span>
      )}
      <textarea
        ref={mergeRefs(innerRef, ref)}
        rows={1}
        value={value}
        onChange={(e) => {
          resize(e.target);
          onChange?.(e);
        }}
        className={`w-full resize-none overflow-hidden rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 dark:bg-zinc-900 dark:text-zinc-50 ${
          icon ? 'pl-11' : ''
        } ${error ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 dark:border-zinc-700'} ${className}`}
        {...rest}
      />
    </div>
  );
});

export default Textarea;
