import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      className="fixed bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-600 shadow-lg ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:text-accent-600 animate-fade-in lg:bottom-8 lg:right-8 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
    >
      <Icon name="arrow_upward" size={20} />
    </button>
  );
}
