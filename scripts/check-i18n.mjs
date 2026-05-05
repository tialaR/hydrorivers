import { readFileSync } from 'node:fs';

const locales = ['pt-BR', 'en-US', 'es'];

function flatten(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, nested]) => flatten(nested, prefix ? `${prefix}.${key}` : key));
  }

  return [prefix];
}

const entries = Object.fromEntries(
  locales.map((locale) => {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8'));
    return [locale, new Set(flatten(messages))];
  })
);

const base = entries['pt-BR'];
let failed = false;

for (const locale of locales.filter((item) => item !== 'pt-BR')) {
  const missing = [...base].filter((key) => !entries[locale].has(key));
  const extra = [...entries[locale]].filter((key) => !base.has(key));

  if (missing.length || extra.length) {
    failed = true;
    console.error(`\n${locale}`);
    if (missing.length) console.error('Missing:', missing.join(', '));
    if (extra.length) console.error('Extra:', extra.join(', '));
  }
}

if (failed) process.exit(1);
console.log(`i18n ok: ${base.size} keys aligned in ${locales.join(', ')}`);
