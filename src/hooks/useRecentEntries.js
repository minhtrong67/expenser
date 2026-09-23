import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_RECENT = 8;

function entryKey(e) {
  return `${e.type}|${e.categoryId}|${e.walletId}|${e.amount}|${(e.note || '').toLowerCase()}`;
}

/**
 * Remembers the user's recent transaction entries (per device) so they can
 * be offered as one-tap suggestions next time they add a transaction,
 * instead of retyping the same amount/category/note.
 */
export function useRecentEntries(uid) {
  const storageKey = `qlct:recentEntries:${uid || 'anon'}`;
  const [recent, setRecent] = useLocalStorage(storageKey, []);

  const remember = useCallback(
    (entry) => {
      if (!entry?.categoryId || !entry?.walletId || !entry?.amount) return;
      const clean = {
        type: entry.type,
        categoryId: entry.categoryId,
        walletId: entry.walletId,
        amount: Number(entry.amount),
        note: (entry.note || '').trim(),
      };
      setRecent((prev) => {
        const filtered = prev.filter((p) => entryKey(p) !== entryKey(clean));
        return [clean, ...filtered].slice(0, MAX_RECENT);
      });
    },
    [setRecent]
  );

  const forType = useCallback((type) => recent.filter((r) => r.type === type), [recent]);

  return { recent, remember, forType };
}
