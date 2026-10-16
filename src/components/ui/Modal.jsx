import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n';
import IconButton from './IconButton';

// Several dialogs can stack (e.g. a confirm over a form) - only unlock page
// scrolling once the last one closes.
let openCount = 0;

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const DIALOG_WIDTH = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

/**
 * Material 3 overlay.
 *  - variant "dialog" (default): centred dialog on every screen size. For short
 *    content and confirmations.
 *  - variant "sheet": full-height side sheet (full-screen on phones, slides in
 *    from the right on larger screens). For forms with many fields.
 * Nothing is auto-focused (no keyboard popping up on phones); focus lands on
 * the panel itself and is trapped inside until the overlay closes.
 */
export default function Modal({ open, onClose, title, children, size = 'md', variant = 'dialog', footer }) {
  const t = useT();
  const panelRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    openCount += 1;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    panel?.focus({ preventScroll: true });

    function onKey(e) {
      if (e.key === 'Escape') {
        // Only the top-most overlay reacts.
        const dialogs = document.querySelectorAll('[data-modal]');
        if (dialogs[dialogs.length - 1] === panel) onCloseRef.current?.();
      } else if (e.key === 'Tab' && panel) {
        const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const [first, last] = [items[0], items[items.length - 1]];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openCount -= 1;
      if (openCount <= 0) {
        openCount = 0;
        document.body.style.overflow = '';
      }
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const isSheet = variant === 'sheet';

  return createPortal(
    <div className={`fixed inset-0 z-50 flex ${isSheet ? 'justify-end' : 'items-center justify-center p-4'}`}>
      <div className="absolute inset-0 animate-fade-in bg-scrim/32" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        data-modal
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={isSheet ? { paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
        className={`relative z-10 flex w-full flex-col overflow-hidden bg-surface-container-high shadow-elev-3 outline-none ${
          isSheet
            ? 'h-dvh animate-sheet-right sm:max-w-xl sm:rounded-l-4xl'
            : `max-h-[90dvh] animate-scale-in rounded-4xl ${DIALOG_WIDTH[size] || DIALOG_WIDTH.md}`
        }`}
      >
        <div className={`flex shrink-0 items-center gap-2 pb-2 ${isSheet ? 'px-4 pt-3 sm:px-6' : 'px-6 pt-5'}`}>
          {isSheet && <IconButton icon="close" label={t('common.close')} onClick={onClose} className="-ml-2" />}
          <h2 id={titleId} className={`min-w-0 flex-1 wrap-any text-on-surface ${isSheet ? 'text-title-lg' : 'text-headline-sm'}`}>
            {title}
          </h2>
          {!isSheet && <IconButton icon="close" label={t('common.close')} onClick={onClose} className="-mr-3" />}
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain py-3 ${isSheet ? 'px-4 sm:px-6' : 'px-6'}`}>{children}</div>
        {footer && <div className={`shrink-0 border-outline-variant pt-3 ${isSheet ? 'border-t px-4 pb-4 sm:px-6' : 'px-6 pb-6'}`}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
