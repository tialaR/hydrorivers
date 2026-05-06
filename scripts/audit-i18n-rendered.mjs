#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'http://localhost:3000';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPORT_PATH = join(ROOT, 'reports', 'i18n-rendered-audit.md');

const ROUTES = [
  '/en-US/dashboard',
  '/es/dashboard',
  '/en-US/cargas',
  '/es/cargas',
  '/en-US/minhas-cargas',
  '/es/minhas-cargas',
  '/en-US/embarcacoes',
  '/es/embarcacoes',
  '/en-US/negociacoes',
  '/es/negociacoes',
  '/en-US/rastreio',
  '/es/rastreio',
  '/en-US/governo',
  '/es/governo'
];

const PROHIBITED_TERMS = [
  'Painel HydroRivers',
  'Resumo das cargas',
  'Cargas abertas',
  'Embarcações disponíveis',
  'Negociações ativas',
  'Economia média',
  'Corredores em destaque',
  'operação',
  'cargas abertas',
  'embarcações',
  'negociações',
  'Ver detalhes',
  'Nova carga',
  'Minhas cargas',
  'Entrar',
  'Sair',
  'Salvar',
  'Cancelar',
  'Polpa de açaí',
  'Farinha de mandioca',
  'Castanha beneficiada',
  'cadeia fria',
  'rastreabilidade'
];

const IGNORE_TERMS = new Set([
  'HydroRivers',
  'Manaus',
  'Belém',
  'Santarém',
  'Tapajós',
  'Solimões',
  'Rio Negro',
  'ANTAQ',
  'DOF',
  'NF-e',
  'POD',
  'TEU'
]);

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(input) {
  return input.replace(/\s+/g, ' ').trim();
}

function extractVisibleText(html) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
  );
}

function isIgnoredMatch(text) {
  return IGNORE_TERMS.has(text);
}

function findMatches(route, text) {
  const findings = [];
  const lowerText = text.toLocaleLowerCase('pt-BR');

  for (const term of PROHIBITED_TERMS) {
    if (isIgnoredMatch(term)) continue;
    const lowerTerm = term.toLocaleLowerCase('pt-BR');
    let index = lowerText.indexOf(lowerTerm);

    while (index !== -1) {
      const start = Math.max(0, index - 60);
      const end = Math.min(text.length, index + term.length + 60);
      const around = normalizeWhitespace(text.slice(start, end));
      findings.push({
        route,
        term,
        context: around
      });
      index = lowerText.indexOf(lowerTerm, index + lowerTerm.length);
    }
  }

  return findings;
}

function renderReport(findings, failures) {
  const lines = [
    '# i18n Rendered HTML Audit',
    '',
    `- Base URL: ${BASE_URL}`,
    `- Rotas auditadas: ${ROUTES.length}`,
    `- Achados: ${findings.length}`,
    ''
  ];

  if (failures.length > 0) {
    lines.push('## Route Fetch Failures', '');
    for (const failure of failures) {
      lines.push(`- rota: \`${failure.route}\``);
      lines.push(`- erro: ${failure.error}`);
      lines.push('');
    }
  }

  lines.push('## Findings', '');
  if (findings.length === 0) {
    lines.push('- Nenhum texto proibido encontrado.');
    lines.push('');
    return lines.join('\n');
  }

  for (const finding of findings) {
    lines.push(`- rota: \`${finding.route}\``);
    lines.push(`- texto encontrado: \`${finding.term}\``);
    lines.push(`- trecho ao redor: \`${finding.context.replaceAll('`', '\\`')}\``);
    lines.push('');
  }

  return lines.join('\n');
}

async function assertServerAvailable() {
  try {
    const response = await fetch(`${BASE_URL}/en-US/dashboard`, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida';
    console.error(`Servidor local não está acessível em ${BASE_URL}. Inicie a aplicação e rode novamente.`);
    console.error(`Detalhe: ${message}`);
    process.exit(2);
  }
}

async function main() {
  await assertServerAvailable();

  const findings = [];
  const failures = [];

  for (const route of ROUTES) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, { redirect: 'follow' });
      if (!response.ok) {
        failures.push({ route, error: `HTTP ${response.status}` });
        continue;
      }
      const html = await response.text();
      const visibleText = extractVisibleText(html);
      findings.push(...findMatches(route, visibleText));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha desconhecida';
      failures.push({ route, error: message });
    }
  }

  mkdirSync(join(ROOT, 'reports'), { recursive: true });
  const report = renderReport(findings, failures);
  writeFileSync(REPORT_PATH, report, 'utf8');

  console.log(`Relatório gerado em: ${REPORT_PATH.replace(`${ROOT}/`, '')}`);
  console.log(`Achados: ${findings.length}`);
  if (failures.length > 0) console.log(`Falhas de fetch: ${failures.length}`);

  if (findings.length > 0) process.exit(1);
  process.exit(0);
}

main();
