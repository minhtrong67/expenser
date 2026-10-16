// Material "ink" ripple: one delegated listener for every `.ripple` element.
export function initRipple() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      const el = e.target.closest?.('.ripple');
      if (!el || el.disabled) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      el.appendChild(wave);
      // Remove when the animation ends - with a timer as a safety net so a wave can never get stuck.
      wave.addEventListener('animationend', () => wave.remove(), { once: true });
      setTimeout(() => wave.remove(), 800);
    },
    { passive: true },
  );
}
