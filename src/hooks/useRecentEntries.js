import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Overall safety cap across every category+wallet combo put together.
const MAX_RECENT = 30;
// How many distinct amounts to remember PER category+wallet combo. This is
// the actual fix for the "15.000 ăn sáng, then 20.000 ăn sáng pushes the
// 15.000 one out" bug: without a per-group cap, a single popular category
// with varying amounts competed for the same shared MAX_RECENT slots as
// every other category, so a second amount for "ăn sáng" could still end up
// evicting the first one once enough other transactions piled up. Capping
// per group means "ăn sáng" always keeps its own last few amounts
// regardless of what else the user has been entering.
const MAX_PER_GROUP = 4;

function entryKey(e) {
  return `${e.type}|${e.categoryId}|${e.walletId}|${e.amount}|${(e.note || '').toLowerCase()}`;
}

function groupKey(e) {
  return `${e.type}|${e.categoryId}|${e.walletId}`;
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
        // Move an exact repeat (same category+wallet+amount+note) to the front
        // instead of duplicating it.
        let next = [clean, ...prev.filter((p) => entryKey(p) !== entryKey(clean))];
        // Enforce the per-group cap: only trim entries that belong to the
        // SAME category+wallet as the one just added, so unrelated groups
        // are never touched by this.
        const myGroup = groupKey(clean);
        let seenInGroup = 0;
        next = next.filter((item) => {
          if (groupKey(item) !== myGroup) return true;
          seenInGroup += 1;
          return seenInGroup <= MAX_PER_GROUP;
        });
        return next.slice(0, MAX_RECENT);
      });
    },
    [setRecent]
  );

  const forType = useCallback((type) => recent.filter((r) => r.type === type), [recent]);

  return { recent, remember, forType };
}
