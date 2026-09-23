import { useRef, useState } from 'react';
import Icon from './Icon';

const THRESHOLD = 72; // px drag distance to trigger an action
const SOFT_MAX = 96; // px where rubber-band resistance kicks in
const HARD_MAX = 130; // absolute px cap, even with resistance

// Adds rubber-band resistance once the drag passes SOFT_MAX, so the card
// keeps responding to a fast/long swipe but eases off instead of hard-stopping.
function withResistance(dx) {
  const sign = Math.sign(dx);
  const abs = Math.abs(dx);
  if (abs <= SOFT_MAX) return dx;
  const over = abs - SOFT_MAX;
  const damped = over * 0.35;
  return sign * Math.min(SOFT_MAX + damped, HARD_MAX);
}

/**
 * Wraps a list-item card with swipe gestures (works with touch AND mouse via
 * Pointer Events): swipe right reveals/triggers `onEdit`, swipe left
 * reveals/triggers `onDelete`, and a plain tap/click (no meaningful drag)
 * triggers `onTap`. Vertical scrolling of the page is left untouched until a
 * horizontal drag is clearly detected. The action panel underneath fills
 * with a solid color and grows in as the drag crosses the trigger threshold,
 * giving a clear "armed" state before release.
 */
export default function SwipeableItem({ onEdit, onDelete, onTap, children, className = '', style, rounded = 'rounded-2xl', disabled = false }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(null); // 'edit' | 'delete' | null
  const start = useRef({ x: 0, y: 0 });
  const axis = useRef(null); // 'x' | 'y' | null
  const moved = useRef(false);

  function vibrate() {
    try { navigator.vibrate?.(8); } catch { /* not supported, ignore */ }
  }

  function handlePointerDown(e) {
    if (disabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging || disabled) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (axis.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis.current !== 'x') return;
    moved.current = true;
    let next = dx;
    if (!onEdit && next > 0) next = 0;
    if (!onDelete && next < 0) next = 0;
    next = withResistance(next);
    setDragX(next);

    const nextArmed = next >= THRESHOLD ? 'edit' : next <= -THRESHOLD ? 'delete' : null;
    setArmed((prev) => {
      if (nextArmed && nextArmed !== prev) vibrate();
      return nextArmed;
    });
    e.preventDefault();
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (axis.current === 'x' && moved.current) {
      if (dragX >= THRESHOLD && onEdit) onEdit();
      else if (dragX <= -THRESHOLD && onDelete) onDelete();
    } else if (!moved.current && onTap && !disabled) {
      onTap();
    }
    setDragX(0);
    setArmed(null);
    axis.current = null;
  }

  const editProgress = Math.min(1, Math.max(0, dragX) / THRESHOLD);
  const deleteProgress = Math.min(1, Math.max(0, -dragX) / THRESHOLD);

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`} style={style}>
      {onEdit && (
        <div
          className="absolute inset-y-0 left-0 flex w-full items-center justify-start bg-accent-600 pl-5"
          style={{ opacity: editProgress, transition: dragging ? 'none' : 'opacity 0.25s ease' }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
            style={{ transform: `scale(${0.7 + editProgress * (armed === 'edit' ? 0.45 : 0.3)})`, transition: dragging ? 'none' : 'transform 0.25s ease' }}
          >
            <Icon name="edit" size={18} />
          </span>
        </div>
      )}
      {onDelete && (
        <div
          className="absolute inset-y-0 right-0 flex w-full items-center justify-end bg-rose-600 pr-5"
          style={{ opacity: deleteProgress, transition: dragging ? 'none' : 'opacity 0.25s ease' }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
            style={{ transform: `scale(${0.7 + deleteProgress * (armed === 'delete' ? 0.45 : 0.3)})`, transition: dragging ? 'none' : 'transform 0.25s ease' }}
          >
            <Icon name="delete" size={18} />
          </span>
        </div>
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
        className="relative touch-pan-y select-none"
      >
        {children}
      </div>
    </div>
  );
}
