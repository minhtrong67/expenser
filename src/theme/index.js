import { DEFAULT_SEED, DEFAULT_SCHEME } from './defaultScheme';

export { DEFAULT_SEED, DEFAULT_SCHEME };

// Preset seed colours offered in Settings. The first one is the Material Theme
// Builder export shipped with the project; the rest are generated on demand.
export const THEME_PRESETS = [
  { id: 'blue', seed: '#2196F3' },
  { id: 'teal', seed: '#26A69A' },
  { id: 'green', seed: '#66BB6A' },
  { id: 'amber', seed: '#F2B84B' },
  { id: 'orange', seed: '#F28C4B' },
  { id: 'rose', seed: '#E8648B' },
  { id: 'purple', seed: '#9575CD' },
  { id: 'indigo', seed: '#5C6BC0' },
];

const SCHEME_CACHE_KEY = 'qlct:scheme';

const kebab = (key) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function hexToTriplet(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
}

/** { primary: '#36618E' } -> "--md-primary:54 97 142;..." (also used by the pre-paint script) */
export function rolesToCss(roles) {
  return Object.entries(roles)
    .map(([key, hex]) => `--md-${kebab(key)}:${hexToTriplet(hex)}`)
    .join(';');
}

export function applyRoles(roles, root = document.documentElement) {
  Object.entries(roles).forEach(([key, hex]) => {
    root.style.setProperty(`--md-${kebab(key)}`, hexToTriplet(hex));
  });
}

export function isValidHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function readCachedScheme(seed) {
  try {
    const cached = JSON.parse(localStorage.getItem(SCHEME_CACHE_KEY));
    return cached && cached.seed === seed ? cached.scheme : null;
  } catch {
    return null;
  }
}

/** Cached together with ready-to-apply CSS so index.html can paint the right colours before React boots. */
export function cacheScheme(seed, scheme) {
  try {
    localStorage.setItem(
      SCHEME_CACHE_KEY,
      JSON.stringify({
        seed,
        scheme,
        css: { light: rolesToCss(scheme.light), dark: rolesToCss(scheme.dark) },
      }),
    );
  } catch {
    /* storage unavailable - the scheme is simply regenerated next time */
  }
}
