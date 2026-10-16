import { useEffect } from 'react';

/** Sets document.title (re-applied whenever the text changes, e.g. on language switch). */
export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
