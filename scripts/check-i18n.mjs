// Verifies that every t('key') used in src/ exists in BOTH dictionaries and
// that the two dictionaries have the same keys. Run: npm run i18n:check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import vi from '../src/i18n/vi.js';
import en from '../src/i18n/en.js';

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|mjs)$/.test(name) && !p.includes('/i18n/') && !p.includes('assets/fonts')) files.push(p);
  }
})('src');

const used = new Set();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/(?:labelKey|key):\s*'((?:nav|settings|emoji|defaults)\.[\w.]+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/'((?:settings\.(?:font|colors|mode)|stats\.range|auth\.error|emoji)\.[\w]+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/t\('(emoji\.[\w]+)'\)/g)) used.add(m[1]);
}
// keys built from template strings
['sm', 'md', 'lg'].forEach((k) => used.add(`settings.font.${k}`));
['blue', 'teal', 'green', 'amber', 'orange', 'rose', 'purple', 'indigo', 'custom'].forEach((k) => used.add(`settings.colors.${k}`));
['today', 'week', 'month', 'year', 'all'].forEach((k) => used.add(`stats.range.${k}`));

let problems = 0;
for (const k of used) {
  if (!(k in vi)) { console.error(`missing in vi.js: ${k}`); problems++; }
  if (!(k in en)) { console.error(`missing in en.js: ${k}`); problems++; }
}
for (const k of Object.keys(vi)) if (!(k in en)) { console.error(`only in vi.js: ${k}`); problems++; }
for (const k of Object.keys(en)) if (!(k in vi) && !(k.endsWith('_one') && k.slice(0, -4) in en)) { console.error(`only in en.js: ${k}`); problems++; }
const unused = Object.keys(vi).filter((k) => !used.has(k) && !k.endsWith('_one'));
if (unused.length) console.warn(`(info) ${unused.length} keys not found statically (may be built dynamically):\n  ${unused.join(', ')}`);
console.log(problems ? `\n${problems} problem(s)` : `\ni18n OK - ${Object.keys(vi).length} keys, vi/en in sync`);
process.exit(problems ? 1 : 0);
