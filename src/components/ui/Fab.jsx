import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import Icon from './Icon';

/**
 * Page-level floating action button. Rendered into the layout's FAB column (so
 * it stacks with the back-to-top button). Only the pages that render <Fab>
 * show one. Extended (with label) on large screens.
 */
export default function Fab({ label, onClick, icon = 'add' }) {
  const ctx = useOutletContext();
  const slot = ctx?.fabSlot;
  if (!slot) return null;
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="state-layer ripple flex h-14 animate-scale-in items-center justify-center gap-3 rounded-2xl bg-primary px-4 text-on-primary shadow-elev-3 transition-[transform,box-shadow] duration-200 ease-emphasized hover:shadow-elev-2 active:scale-95 lg:px-5"
    >
      <Icon name={icon} size={24} />
      <span className="hidden text-label-lg lg:inline">{label}</span>
    </button>,
    slot,
  );
}
