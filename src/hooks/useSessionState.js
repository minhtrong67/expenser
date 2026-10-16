import { useEffect, useState, useCallback } from 'react';

const PREFIX = 'qlct:s:';

/**
 * Like useState, but remembered in sessionStorage so a page's filters, tabs and
 * sort order survive navigating to another page and back (and page reloads),
 * yet reset when the browser tab is closed. Values must be JSON-serialisable
 * (store dates as timestamps).
 */
export function useSessionState(key, initialValue) {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const initial = typeof initialValue === 'function' ? initialValue() : initialValue;
        // Merge object state so newly added fields keep their defaults.
        if (initial && typeof initial === 'object' && !Array.isArray(initial) && parsed && typeof parsed === 'object') {
          return { ...initial, ...parsed };
        }
        return parsed;
      }
    } catch {
      /* unavailable or corrupt - fall through to the default */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* storage full or unavailable - ignore */
    }
  }, [storageKey, value]);

  const reset = useCallback(() => {
    setValue(typeof initialValue === 'function' ? initialValue() : initialValue);
  }, [initialValue]);

  return [value, setValue, reset];
}
