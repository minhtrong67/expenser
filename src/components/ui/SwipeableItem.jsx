import { useRef, useState } from 'react';
import Icon from './Icon';
import IconButton from './IconButton';
import { useT } from '../../i18n';

const THRESHOLD = 72; // px drag distance that arms an action
const SOFT_MAX = 96; // rubber-band starts here
const HARD_MAX = 130;

function withResistance(dx) {
  const abs = Math.abs(dx);
  if (abs <= SOFT_MAX) return dx;
  return Math.sign(dx) * Math.min(SOFT_MAX + (abs - SOFT_MAX) * 0.35, HARD_MAX);
}

/**
 * Swipe right = edit, swipe left = delete (touch + mouse via Pointer Events).
 * Vertical scrolling is untouched until a horizontal drag is clearly detected,
 * and pointer capture only starts then - so inner buttons stay clickable.
 */
export default function SwipeableItem({ onEdit, onDelete, children, className = '', style, rounded = 'rounded-2xl', disabled = false }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(null);
  const start = useRef({ x: 0, y: 0 });
  const axis = useRef(null);
  const dragRef = useRef(0);

  function vibrate() {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* not supported */
    }
  }

  function onPointerDown(e) {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    setDragging(true);
  }

  function onPointerMove(e) {
    if (!dragging || disabled) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (axis.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis.current === 'x') e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (axis.current !== 'x') return;
    let next = dx;
    if (!onEdit && next > 0) next = 0;
    if (!onDelete && next < 0) next = 0;
    next = withResistance(next);
    dragRef.current = next;
    setDragX(next);
    const nextArmed = next >= THRESHOLD ? 'edit' : next <= -THRESHOLD ? 'delete' : null;
    setArmed((prev) => {
      if (nextArmed && nextArmed !== prev) vibrate();
      return nextArmed;
    });
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (axis.current === 'x') {
      if (dragRef.current >= THRESHOLD && onEdit) onEdit();
      else if (dragRef.current <= -THRESHOLD && onDelete) onDelete();
    }
    dragRef.current = 0;
    setDragX(0);
    setArmed(null);
    axis.current = null;
  }

  const editProgress = Math.min(1, Math.max(0, dragX) / THRESHOLD);
  const deleteProgress = Math.min(1, Math.max(0, -dragX) / THRESHOLD);
  const anim = dragging ? 'none' : 'opacity 250ms ease, transform 250ms ease';

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`} style={style}>
      {onEdit && (
        <div className="absolute inset-y-0 left-0 flex w-full items-center justify-start bg-primary pl-5 text-on-primary" style={{ opacity: editProgress, transition: anim }}>
          <span style={{ transform: `scale(${0.7 + editProgress * (armed === 'edit' ? 0.45 : 0.3)})`, transition: anim }}>
            <Icon name="edit" size={22} />
          </span>
        </div>
      )}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 flex w-full items-center justify-end bg-error pr-5 text-on-error" style={{ opacity: deleteProgress, transition: anim }}>
          <span style={{ transform: `scale(${0.7 + deleteProgress * (armed === 'delete' ? 0.45 : 0.3)})`, transition: anim }}>
            <Icon name="delete" size={22} />
          </span>
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 350ms cubic-bezier(0.2, 0, 0, 1)',
          willChange: dragging ? 'transform' : 'auto',
        }}
        className="group relative touch-pan-y select-none"
      >
        {children}
      </div>
    </div>
  );
}

/** Edit/delete buttons for mouse users (swipe is hard to discover on desktop). Place inside the card. */
export function ItemActions({ onEdit, onDelete }) {
  const t = useT();
  return (
    <div className="hidden shrink-0 items-center opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 lg:flex">
      {onEdit && <IconButton icon="edit" label={t('common.edit')} onClick={onEdit} />}
      {onDelete && <IconButton icon="delete" label={t('common.delete')} variant="danger" onClick={onDelete} />}
    </div>
  );
}
