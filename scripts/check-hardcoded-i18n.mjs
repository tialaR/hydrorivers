#!/usr/bin/env node
/**
 * Auditoria conservadora de possíveis textos hardcoded em TSX (next-intl).
 * Saída informativa; exit code 0 (não falha CI nesta versão).
 *
 * @see docs/I18N-HARDCODED-AUDIT.md
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');

const EXCLUDE_DIR_NAMES = new Set(['node_modules', 'dist', '.next', '__tests__']);
const EXCLUDE_FILE = /\.(test|spec)\.tsx$/;
const EXCLUDE_PATH_SNIPPETS = ['/messages/', '/.mock-data/'];

/** Marca / produto — não é bug de i18n nesta auditoria */
const ALLOWLIST_EXACT = new Set([
  'HydroRivers',
  'M',
  '—',
  '…',
  '/',
  '|',
  '•',
  '→',
  '·',
  'OK',
  'ID',
  'URL',
  'API',
  'OTP',
  'JSON',
  'PDF',
  'NF-e',
  'CT-e',
  'DOF',
  'GTA',
  'BR',
  'CO₂',
  'CO2',
  'ETA',
  'SLA',
  'DOF',
  'ANTAQ',
  'P&I'
]);

const IGNORE_IF_LINE_INCLUDES = [
  'className=',
  'data-testid',
  '{/*',
  '//',
  'http://',
  'https://',
  'from "@/',
  "from '@/",
  'from "next/',
  "from 'next/",
  'dangerouslySetInnerHTML',
  'content: ',
  'fontFamily:',
  '@keyframes',
  'console.',
  'process.env',
  'type: ',
  'typeof ',
  'satisfies ',
  'extends ',
  'implements '
];

const I18N_HELPERS = [
  /\bt\s*\(/,
  /\bpage\s*\(/,
  /\bcommon\s*\(/,
  /\bauth\s*\(/,
  /\bf\s*\(/,
  /\bnav\s*\(/,
  /\bgetTranslations\b/,
  /\buseTranslations\b/,
  /\btranslateMock\b/,
  /\buseFormatter\b/,
  /\bformat\s*\(/
];

function hasI18nCall(line) {
  return I18N_HELPERS.some((re) => re.test(line));
}

function shouldExcludeFile(relPath) {
  if (EXCLUDE_FILE.test(relPath)) return true;
  if (EXCLUDE_PATH_SNIPPETS.some((s) => relPath.includes(s))) return true;
  return false;
}

function walkTsx(dir, base = dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.')) continue;
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(name.name)) continue;
      walkTsx(full, base, out);
    } else if (name.name.endsWith('.tsx')) {
      const rel = relative(ROOT, full).replaceAll('\\', '/');
      if (!shouldExcludeFile(rel)) out.push(full);
    }
  }
  return out;
}

function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function isNoiseText(s) {
  const t = s.trim();
  if (t.length < 3) return true;
  if (ALLOWLIST_EXACT.has(t)) return true;
  if (/^[\d\s.,:%$€\-–—+°/]+$/.test(t)) return true;
  /** Máscara visual de senha / campo sensível */
  if (/^[•·.\s]+$/.test(t)) return true;
  if (/^[A-Z0-9_-]{1,12}$/.test(t)) return true;
  if (/^u-[a-z]+-\d+$/.test(t)) return true;
  if (/^cargo-\d+$/.test(t)) return true;
  if (/^vessel-\d+$/.test(t)) return true;
  if (/^neg-\d+$/.test(t)) return true;
  if (/^mock-/.test(t)) return true;
  return false;
}

function lineIgnorable(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('import ')) return true;
  if (IGNORE_IF_LINE_INCLUDES.some((s) => line.includes(s))) return true;
  if (hasI18nCall(line)) return true;
  return false;
}

/**
 * Atributos com string literal (aspas) — candidato forte a i18n se não for técnico.
 */
function scanQuotedAttr(line, attr, findings, file, lineNo) {
  const re = new RegExp(`${attr}=["']([^"']{3,})["']`, 'g');
  let m;
  while ((m = re.exec(line)) !== null) {
    const val = m[1].trim();
    if (isNoiseText(val)) continue;
    if (/^#[0-9a-fA-F]{3,8}$/.test(val)) continue;
    if (/^[./@][\w./@-]+$/.test(val)) continue;
    findings.push({ file, line: lineNo, kind: attr, text: val.slice(0, 120) });
  }
}

/**
 * JSX texto cru: > texto < na mesma linha, sem { no conteúdo.
 */
function scanJsxTextLine(line, findings, file, lineNo) {
  if (line.includes('</')) {
    const re = />\s*([^<{\n][^<\n]*?)\s*</g;
    let m;
    while ((m = re.exec(line)) !== null) {
      const inner = m[1].trim();
      if (!inner || inner.startsWith('/')) continue;
      if (inner.includes('{')) continue;
      if (inner.includes('`')) continue;
      if (isNoiseText(inner)) continue;
      if (/^svg$/i.test(inner)) continue;
      findings.push({ file, line: lineNo, kind: 'jsx-text', text: inner.slice(0, 120) });
    }
  }
}

function scanFile(absPath) {
  const rel = relative(ROOT, absPath).replaceAll('\\', '/');
  const raw = readFileSync(absPath, 'utf8');
  const source = stripBlockComments(raw);
  const lines = source.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, i) => {
    const lineNo = i + 1;
    if (lineIgnorable(line)) return;

    scanQuotedAttr(line, 'placeholder', findings, rel, lineNo);
    scanQuotedAttr(line, 'aria-label', findings, rel, lineNo);
    scanQuotedAttr(line, 'title', findings, rel, lineNo);
    scanQuotedAttr(line, 'alt', findings, rel, lineNo);

    scanJsxTextLine(line, findings, rel, lineNo);
  });

  return findings;
}

function main() {
  const files = walkTsx(SRC);
  const all = [];

  for (const f of files) {
    all.push(...scanFile(f));
  }

  const byFile = new Map();
  for (const item of all) {
    if (!byFile.has(item.file)) byFile.set(item.file, []);
    byFile.get(item.file).push(item);
  }

  console.log('\n=== Hardcoded i18n audit (conservative) ===\n');
  console.log(`Scanned: ${files.length} .tsx files under src/\n`);
  console.log(`Findings: ${all.length} (informational; exit code always 0)\n`);

  if (all.length === 0) {
    console.log('No candidate lines matched the current rules.\n');
    process.exit(0);
  }

  const sorted = [...byFile.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [file, items] of sorted) {
    console.log(`--- ${file} (${items.length}) ---`);
    for (const it of items) {
      console.log(`  L${it.line} [${it.kind}] ${JSON.stringify(it.text)}`);
    }
    console.log('');
  }

  console.log('Notes:');
  console.log('- Review each hit; many may be acceptable (brand, examples, a11y fallbacks).');
  console.log('- Lines using t(), page(), translateMock(), etc. are skipped entirely.');
  console.log('- See docs/I18N-HARDCODED-AUDIT.md for scope and limitations.\n');

  process.exit(0);
}

main();
