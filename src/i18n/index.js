import { createContext, useContext } from 'react';
import vi from './vi';
import en from './en';

export const LANGUAGES = [
  { id: 'vi', label: 'Tiếng Việt', short: 'VI', locale: 'vi-VN' },
  { id: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
];

const DICTS = { vi, en };

export function detectLanguage() {
  try {
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'vi';
    return nav.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  } catch {
    return 'vi';
  }
}

/**
 * Builds a translate function for a language.
 *  - `{name}` placeholders are replaced from `params`.
 *  - Passing `{ n }` on English picks `key_one` when n === 1 (simple plural rule).
 *  - Missing keys fall back to English, then to the key itself.
 */
export function createT(lang) {
  const dict = DICTS[lang] || DICTS.vi;
  return function t(key, params) {
    let str = dict[key];
    if (params && lang === 'en' && params.n === 1 && dict[`${key}_one`]) str = dict[`${key}_one`];
    if (str === undefined) str = DICTS.en[key] ?? DICTS.vi[key] ?? key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
  };
}

export const I18nContext = createContext(null);

/** Returns { t, lang, locale } — re-renders when the language changes. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within SettingsProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
