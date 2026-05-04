/**
 * Verifica documentação e scripts npm esperados pelo onboarding.
 * exit 0 = tudo OK | exit 1 = algo obrigatório ausente
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DOC_CHECKS = [
  'docs/DEVELOPER-AI-ONBOARDING.md',
  'docs/API-SECURITY-AUDIT.md',
  'docs/SECURITY-PRODUCT-DECISIONS.md',
  'docs/E2E-PLAYWRIGHT.md'
];

const SCRIPT_NAMES = ['lint', 'typecheck', 'check:i18n', 'test'];

function loadScripts() {
  const pkgPath = resolve(root, 'package.json');
  const raw = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  return pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
}

function scriptOk(scripts, name) {
  const v = scripts[name];
  return typeof v === 'string' && v.trim().length > 0;
}

function main() {
  console.log('\nOnboarding progress check\n');

  let allOk = true;
  const lines = [];

  for (const rel of DOC_CHECKS) {
    const path = resolve(root, rel);
    const ok = existsSync(path);
    if (!ok) allOk = false;
    lines.push(`  ${ok ? 'OK' : 'FAIL'}  ${rel}`);
  }

  let scripts;
  try {
    scripts = loadScripts();
  } catch {
    console.log('  FAIL  package.json (leitura ou parse)');
    console.log('\nOnboarding incomplete ❌\n');
    process.exit(1);
  }

  for (const name of SCRIPT_NAMES) {
    const ok = scriptOk(scripts, name);
    if (!ok) allOk = false;
    lines.push(`  ${ok ? 'OK' : 'FAIL'}  package.json scripts.${name}`);
  }

  console.log(lines.join('\n'));
  console.log('');

  if (allOk) {
    console.log('Onboarding ready ✅\n');
    process.exit(0);
  }

  console.log('Onboarding incomplete ❌\n');
  process.exit(1);
}

main();
