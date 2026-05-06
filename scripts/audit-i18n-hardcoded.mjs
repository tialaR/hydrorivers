#!/usr/bin/env node

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const REPORT_PATH = join(ROOT, 'reports', 'i18n-hardcoded-audit.md');
const MOCK_CONTENT_PATH = join(ROOT, 'src', 'shared', 'i18n', 'mock-content.ts');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.next',
  'coverage',
  'dist',
  '__tests__',
  '__mocks__'
]);

const EXCLUDED_FILE_PATTERNS = [
  /\.test\.(ts|tsx)$/i,
  /\.spec\.(ts|tsx)$/i,
  /\.scss$/i,
  /\.css$/i
];

const UI_TAGS = new Set(['h1', 'p', 'button', 'span', 'small', 'strong', 'li']);
const VISIBLE_PROPS = [
  'placeholder',
  'aria-label',
  'title',
  'alt',
  'label',
  'description',
  'helperText',
  'emptyText',
  'errorMessage',
  'successMessage'
];
const OBJECT_KEYS = ['title', 'subtitle', 'description', 'label', 'text', 'message', 'cta', 'empty', 'helper'];
const INTERNAL_STATUS = new Set(['open', 'bidding', 'pending', 'accepted', 'rejected', 'cancelled']);
const INTERNAL_API_CODES = new Set(['forbidden', 'invalid-login', 'not-found', 'unauthenticated', 'request-failed']);
const ALLOWLIST_EXACT = new Set(['HydroRivers']);

const HIGH_CONFIDENCE_PROPS = new Set([
  'placeholder',
  'aria-label',
  'title',
  'alt',
  'helperText',
  'emptyText',
  'errorMessage',
  'successMessage'
]);
const HIGH_CONFIDENCE_OBJECT_KEYS = new Set(['title', 'subtitle', 'description', 'label', 'message', 'cta', 'empty', 'helper']);

const findings = {
  HIGH_CONFIDENCE_UI_TEXT: [],
  NEEDS_REVIEW: [],
  POSSIBLE_MOCK_CONTENT: []
};

const ignoredCounts = new Map();
const localeAwareMockStrings = new Set();

function bumpIgnored(reason) {
  ignoredCounts.set(reason, (ignoredCounts.get(reason) ?? 0) + 1);
}

function loadLocaleAwareMockStrings() {
  const source = readFileSync(MOCK_CONTENT_PATH, 'utf8');
  const exactSection = source.match(/const exact:[\s\S]*?const patterns:/)?.[0] ?? '';
  for (const match of exactSection.matchAll(/'([^']+)':\s*\{/g)) {
    localeAwareMockStrings.add(match[1]);
  }
}

function normalizePath(path) {
  return path.replaceAll('\\', '/');
}

function shouldSkipPath(absPath) {
  const rel = normalizePath(relative(ROOT, absPath));
  if (rel.includes('/app/api/')) return true;
  return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(rel));
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    if (EXCLUDED_DIRS.has(name)) continue;

    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full, out);
      continue;
    }

    const extension = extname(name);
    if (extension !== '.ts' && extension !== '.tsx') continue;
    if (shouldSkipPath(full)) continue;
    out.push(full);
  }
  return out;
}

function sanitizeLine(line) {
  return line
    .replace(/\/\/.*$/g, '')
    .replace(/\/\*.*?\*\//g, '')
    .trim();
}

function isLikelyRoute(value) {
  return /^\/[a-zA-Z0-9/_:[\]-]*$/.test(value) || value.startsWith('./') || value.startsWith('../');
}

function isUrl(value) {
  return /^https?:\/\//i.test(value) || /^www\./i.test(value);
}

function hasI18nPattern(line) {
  return /\bt\s*\(/.test(line)
    || /\bcommon\s*\(/.test(line)
    || /\bgetTranslations\s*\(/.test(line)
    || /\buseTranslations\s*\(/.test(line);
}

function isImportOrExport(line) {
  return /^\s*(import|export)\b/.test(line);
}

function hasTypeLikeContext(line) {
  return /\btype\b/.test(line) || /\binterface\b/.test(line) || /\benum\b/.test(line);
}

function looksLikeCodeIdentifier(value) {
  return /^[a-z][a-zA-Z0-9-_.]*$/.test(value);
}

function shouldIgnoreString(value, line, keyOrAttr) {
  const text = value.trim();
  if (!text) return 'empty';
  if (text.length < 2) return 'too_short';
  if (ALLOWLIST_EXACT.has(text)) return 'allowlist_exact';
  if (/^[\d\s.,:%$€\-–—+°/]+$/.test(text)) return 'numeric_or_symbolic';
  if (isUrl(text)) return 'url';
  if (isLikelyRoute(text)) return 'route_or_path';
  if (hasI18nPattern(line)) return 'already_i18n_usage';
  if (isImportOrExport(line)) return 'import_export';
  if (hasTypeLikeContext(line)) return 'type_context';
  if (INTERNAL_STATUS.has(text)) return 'internal_status';
  if (INTERNAL_API_CODES.has(text)) return 'internal_api_code';
  if (keyOrAttr && ['className', 'data-testid', 'id', 'href', 'src'].includes(keyOrAttr)) return 'non_ui_attr';
  if (keyOrAttr === 'text' && looksLikeCodeIdentifier(text)) return 'identifier_like_text';
  if (/^\$\{template\.title\}\s*•\s*lote\s*\$\{index \+ 2\}$/.test(text)) return 'dynamic_locale_aware_template';
  if (localeAwareMockStrings.has(text)) return 'locale_aware_mock_content';
  return null;
}

function classify(relPath, type, keyOrAttr) {
  if (/mock/i.test(relPath)) return 'POSSIBLE_MOCK_CONTENT';
  if (type === 'TOAST_TEXT') return 'HIGH_CONFIDENCE_UI_TEXT';
  if (type === 'JSX_TEXT') return 'HIGH_CONFIDENCE_UI_TEXT';
  if (type === 'PROP_TEXT') return HIGH_CONFIDENCE_PROPS.has(keyOrAttr) ? 'HIGH_CONFIDENCE_UI_TEXT' : 'NEEDS_REVIEW';
  if (type === 'OBJECT_TEXT') return HIGH_CONFIDENCE_OBJECT_KEYS.has(keyOrAttr) ? 'NEEDS_REVIEW' : 'NEEDS_REVIEW';
  return 'NEEDS_REVIEW';
}

function recommendation(type) {
  if (type === 'TOAST_TEXT') return 'Mover para chave i18n e renderizar com next-intl (ex.: t("toast.successAction")).';
  if (type === 'JSX_TEXT') return 'Substituir texto literal por t("...")/common("...") no componente.';
  if (type === 'PROP_TEXT') return 'Extrair valor para mensagens i18n e passar via t("...") na prop.';
  return 'Revisar se o texto é visível; se sim, mover para mensagens i18n e consumir com next-intl.';
}

function pushFinding({ relPath, lineNo, type, snippet, keyOrAttr }) {
  const bucket = classify(relPath, type, keyOrAttr);
  findings[bucket].push({
    file: relPath,
    line: lineNo,
    type,
    snippet,
    recommendation: recommendation(type)
  });
}

function captureJsxText(line, relPath, lineNo) {
  const matches = line.matchAll(/<([a-z][\w-]*)[^>]*>\s*([^<{][^<]*?)\s*<\/\1>/g);
  for (const match of matches) {
    const tag = match[1];
    const text = match[2]?.trim() ?? '';
    if (!UI_TAGS.has(tag)) continue;
    const reason = shouldIgnoreString(text, line, null);
    if (reason) {
      bumpIgnored(`jsx:${reason}`);
      continue;
    }
    pushFinding({
      relPath,
      lineNo,
      type: 'JSX_TEXT',
      snippet: text,
      keyOrAttr: null
    });
  }
}

function capturePropText(line, relPath, lineNo) {
  for (const attr of VISIBLE_PROPS) {
    const regex = new RegExp(`\\b${attr}\\s*=\\s*(["'\`])([^"'\\\`]+)\\1`, 'g');
    for (const match of line.matchAll(regex)) {
      const value = match[2]?.trim() ?? '';
      const reason = shouldIgnoreString(value, line, attr);
      if (reason) {
        bumpIgnored(`prop:${reason}`);
        continue;
      }
      pushFinding({
        relPath,
        lineNo,
        type: 'PROP_TEXT',
        snippet: `${attr}="${value}"`,
        keyOrAttr: attr
      });
    }
  }
}

function captureObjectText(line, relPath, lineNo) {
  for (const key of OBJECT_KEYS) {
    const regex = new RegExp(`\\b${key}\\s*:\\s*(["'\`])([^"'\\\`]+)\\1`, 'g');
    for (const match of line.matchAll(regex)) {
      const value = match[2]?.trim() ?? '';
      const reason = shouldIgnoreString(value, line, key);
      if (reason) {
        bumpIgnored(`object:${reason}`);
        continue;
      }
      pushFinding({
        relPath,
        lineNo,
        type: 'OBJECT_TEXT',
        snippet: `${key}: "${value}"`,
        keyOrAttr: key
      });
    }
  }
}

function captureToastText(line, relPath, lineNo) {
  const regexes = [
    /toast\.(success|error)\s*\(\s*(["'`])([^"'`]+)\2/g,
    /showToast\s*\(\s*(["'`])([^"'`]+)\1/g,
    /notify\s*\(\s*(["'`])([^"'`]+)\1/g
  ];

  for (const regex of regexes) {
    for (const match of line.matchAll(regex)) {
      const value = match[3] ?? match[2] ?? '';
      const reason = shouldIgnoreString(value, line, null);
      if (reason) {
        bumpIgnored(`toast:${reason}`);
        continue;
      }
      pushFinding({
        relPath,
        lineNo,
        type: 'TOAST_TEXT',
        snippet: value.trim(),
        keyOrAttr: null
      });
    }
  }
}

function scanFile(absPath) {
  const relPath = normalizePath(relative(ROOT, absPath));
  const source = readFileSync(absPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const rawLine = lines[i];
    const line = sanitizeLine(rawLine);
    if (!line) continue;
    if (isImportOrExport(line)) continue;

    captureJsxText(line, relPath, lineNo);
    capturePropText(line, relPath, lineNo);
    captureObjectText(line, relPath, lineNo);
    captureToastText(line, relPath, lineNo);
  }
}

function sortFindings(items) {
  return items.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });
}

function renderSection(title, items) {
  const sorted = sortFindings(items);
  const lines = [`## ${title}`, ''];
  if (sorted.length === 0) {
    lines.push('- Nenhum item detectado.', '');
    return lines.join('\n');
  }

  for (const item of sorted) {
    lines.push(`- arquivo: \`${item.file}\``);
    lines.push(`- linha: ${item.line}`);
    lines.push(`- tipo encontrado: ${item.type}`);
    lines.push(`- trecho: \`${item.snippet.replaceAll('`', '\\`')}\``);
    lines.push(`- recomendação: ${item.recommendation}`);
    lines.push('');
  }
  return lines.join('\n');
}

function renderIgnoredSummary() {
  const entries = [...ignoredCounts.entries()].sort((a, b) => b[1] - a[1]);
  const lines = ['## IGNORED_FALSE_POSITIVES_SUMMARY', ''];

  if (entries.length === 0) {
    lines.push('- Nenhum falso positivo ignorado por heurística.');
    lines.push('');
    return lines.join('\n');
  }

  for (const [reason, count] of entries) {
    lines.push(`- ${reason}: ${count}`);
  }
  lines.push('');
  return lines.join('\n');
}

function writeReport(scannedFiles) {
  const totalFindings = Object.values(findings).reduce((acc, list) => acc + list.length, 0);
  const report = [
    '# i18n Hardcoded Audit',
    '',
    `- Scanned files: ${scannedFiles}`,
    `- Total findings: ${totalFindings}`,
    '',
    renderSection('HIGH_CONFIDENCE_UI_TEXT', findings.HIGH_CONFIDENCE_UI_TEXT),
    renderSection('NEEDS_REVIEW', findings.NEEDS_REVIEW),
    renderSection('POSSIBLE_MOCK_CONTENT', findings.POSSIBLE_MOCK_CONTENT),
    renderIgnoredSummary()
  ].join('\n');

  mkdirSync(join(ROOT, 'reports'), { recursive: true });
  writeFileSync(REPORT_PATH, report, 'utf8');
}

function main() {
  loadLocaleAwareMockStrings();
  const files = walk(SRC);
  for (const file of files) scanFile(file);
  writeReport(files.length);

  console.log('i18n hardcoded audit completed.');
  console.log(`Report: ${normalizePath(relative(ROOT, REPORT_PATH))}`);
  console.log(`HIGH_CONFIDENCE_UI_TEXT: ${findings.HIGH_CONFIDENCE_UI_TEXT.length}`);
  console.log(`NEEDS_REVIEW: ${findings.NEEDS_REVIEW.length}`);
  console.log(`POSSIBLE_MOCK_CONTENT: ${findings.POSSIBLE_MOCK_CONTENT.length}`);
}

main();
