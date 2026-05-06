#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'http://localhost:3000';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPORT_PATH = join(ROOT, 'reports', 'i18n-rendered-audit.md');

const MARKETPLACE_MOCK_PATH = join(ROOT, 'src', 'features', 'marketplace', 'data', 'marketplace.mock.ts');
const IMPACT_MOCK_PATH = join(ROOT, 'src', 'features', 'impact', 'data', 'impact.mock.ts');

/**
 * Extrai o primeiro id de um array mock (ex.: id: 'cargo-001') sem executar TypeScript.
 */
function firstIdInMockFile(filePath, entityPrefix) {
  const text = readFileSync(filePath, 'utf8');
  const re = new RegExp(`\\bid:\\s*'(${entityPrefix}-[^']+)'`, 'g');
  const m = re.exec(text);
  if (!m) {
    throw new Error(`audit-i18n-rendered: não encontrou id '${entityPrefix}-*' em ${filePath}`);
  }
  return m[1];
}

/**
 * Slug de detalhe de impacto: no app é o id do card (ex. regional = "Amazonía conectada" em es).
 * Nota: a rota /impacto/amazonia-conectada não existe no código; o segmento válido é /impacto/regional.
 */
function impactDetailSlugFromMock() {
  const text = readFileSync(IMPACT_MOCK_PATH, 'utf8');
  /** Card “regional” / Amazonía conectada (es) usa icon 'route'. */
  const m = text.match(/\{\s*id:\s*'([^']+)',\s*icon:\s*'route'\s*\}/);
  if (m) return m[1];
  const fallback = text.match(/\{\s*id:\s*'([^']+)',\s*icon:/);
  if (fallback) return fallback[1];
  throw new Error(`audit-i18n-rendered: não encontrou id de card em ${IMPACT_MOCK_PATH}`);
}

const MOCK_IDS = {
  cargo: firstIdInMockFile(MARKETPLACE_MOCK_PATH, 'cargo'),
  /** Segunda carga no mock (bioeconomia / título longo) para auditar detalhe real adicional. */
  cargoBio: 'cargo-006',
  vessel: firstIdInMockFile(MARKETPLACE_MOCK_PATH, 'vessel'),
  negotiation: firstIdInMockFile(MARKETPLACE_MOCK_PATH, 'neg'),
  impactDetail: impactDetailSlugFromMock()
};

/** Rotas de detalhe derivadas dos mocks (mesmos ids em en-US e es). */
const DETAIL_ROUTES = [
  `/en-US/impacto/${MOCK_IDS.impactDetail}`,
  `/es/impacto/${MOCK_IDS.impactDetail}`,
  `/en-US/cargas/${MOCK_IDS.cargo}`,
  `/es/cargas/${MOCK_IDS.cargo}`,
  `/en-US/cargas/${MOCK_IDS.cargoBio}`,
  `/es/cargas/${MOCK_IDS.cargoBio}`,
  `/en-US/embarcacoes/${MOCK_IDS.vessel}`,
  `/es/embarcacoes/${MOCK_IDS.vessel}`,
  `/en-US/negociacoes/${MOCK_IDS.negotiation}`,
  `/es/negociacoes/${MOCK_IDS.negotiation}`
];

/** Ordem explícita solicitada: home, nova carga, impacto, embarcações, negociações, dashboard, cargas, minhas-cargas, rastreio, governo */
const ROUTES = [
  '/en-US',
  '/es',
  '/en-US/cargas/nova',
  '/es/cargas/nova',
  '/en-US/impacto',
  '/es/impacto',
  ...DETAIL_ROUTES,
  '/en-US/embarcacoes',
  '/es/embarcacoes',
  '/en-US/negociacoes',
  '/es/negociacoes',
  '/en-US/dashboard',
  '/es/dashboard',
  '/en-US/cargas',
  '/es/cargas',
  '/en-US/minhas-cargas',
  '/es/minhas-cargas',
  '/en-US/rastreio',
  '/es/rastreio',
  '/en-US/governo',
  '/es/governo'
];

/**
 * Textos claramente em português que não deveriam aparecer em páginas /en-US.
 * Frases mais longas primeiro reduzem ruído ao exibir contexto; a busca ainda é por substring normalizada.
 */
const PROHIBITED_TERMS_EN_US = [
  'Simule a abertura de uma carga para receber cotações de embarcações aptas.',
  'Aguardar aceite do embarcador',
  'Equipamentos solares para comunidades ribeirinhas',
  'Medicamentos refrigerados para abastecimento territorial',
  'O marketplace que transforma rios em corredores digitais de carga',
  'Por que HydroRivers gera mais valor',
  'Redução de custo logístico',
  'Operação com baixa conectividade',
  'autorização e janela de vazante',
  'Anexar laudo sanitário',
  'Embarcação regional refrigerada',
  'Baixa conectividade pendente',
  'Checklist digital pronto',
  'Baixa conectividade pronta',
  'Comboio de barcaças',
  'Empurrador + barcaça',
  'Necessidade regional',
  'Custo e sustentabilidade',
  'Aderência ao BR do Mar',
  'Confiança documental',
  'Rotas otimizadas',
  'Menos CO₂ por tonelada',
  'Menos burocracia',
  'Desburocratização',
  'FRETE FLUVIAL E CABOTAGEM',
  'Publicar nova carga',
  'Explorar cargas',
  'Ver impacto',
  'Documento verificado',
  'Painel HydroRivers',
  'Resumo das cargas',
  'Embarcações disponíveis',
  'Negociações ativas',
  'Corredores em destaque',
  'Economia média',
  'Polpa de açaí congelada',
  'Castanha beneficiada',
  'Farinha de mandioca',
  'Polpa de açaí',
  'rastreabilidade',
  'cadeia fria',
  'cargas abertas',
  'embarcações',
  'negociações',
  'Nova carga',
  'Minhas cargas',
  'Ver detalhes',
  'Entrar',
  'Sair',
  'Salvar',
  'Cancelar',
  'Disponível',
  'Em manutenção',
  'Em rota',
  'Em revisão',
  'Checklist pendente',
  'Proprietário',
  'Calado',
  'Cotação',
  'Contraproposta',
  'Contrato',
  'Hoje',
  'Ontem',
  'piloto Gov',
  'PUBLICAÇÃO',
  'Simule a abertura',
  'Impacto',
  'Resumo',
  'operação',
  'pronto',
  'CARGA',
  'Cargas',
  'Cacau e cupuaçu',
  'cadeia de bioeconomia',
  'lote',
  'Embarcação',
  'Negociação',
  'Amazônia conectada',
  'Onde o rio é estrada'
];

/**
 * Em /es: marcar trechos claramente em português. Não incluir palavras que também são espanhol válido
 * (ex.: impacto, carga(s), documento(s), perfil, publicar, operación) como termos isolados.
 */
const PROHIBITED_TERMS_ES = [
  'Simule a abertura de uma carga para receber cotações de embarcações aptas.',
  'Aguardar aceite do embarcador',
  'Baixa conectividade pendente',
  'Baixa conectividade pronta',
  'Checklist digital pronto',
  'Checklist pendente',
  'Embarcação regional refrigerada',
  'Empurrador + barcaça',
  'Comboio de barcaças',
  'Anexar laudo sanitário',
  'autorização e janela de vazante',
  'Redução de custo',
  'Desburocratização',
  'Menos burocracia',
  'Publicar nova carga',
  'Simule a abertura',
  'Embarcações',
  'Embarcação',
  'Disponível',
  'Em manutenção',
  'Em rota',
  'Em revisão',
  'Proprietário',
  'Aguardar aceite',
  'Anexar laudo',
  'cadeia de bioeconomia',
  'Cacau e cupuaçu',
  'Onde o rio é estrada'
];

const IGNORE_TERMS = new Set([
  'HydroRivers',
  'Manaus',
  'Belém',
  'Santarém',
  'Macapá',
  'Tefé',
  'Porto Velho',
  'Tapajós',
  'Solimões',
  'Rio Negro',
  'PA',
  'AM',
  'AP',
  'ANTAQ',
  'DOF',
  'NF-e',
  'CT-e',
  'POD',
  'TEU'
]);

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

/** Remove duplicatas preservando ordem (termos mais longos já estão primeiro na lista fonte). */
function uniqueTerms(terms, locale) {
  const seen = new Set();
  const out = [];
  for (const t of terms) {
    const key = t.toLocaleLowerCase(locale);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Evita que termos curtos (ex.: `CARGA`) casem dentro de palavras maiores (ex.: `Cargas`, `Cargoes`). */
function isAlphanumericChar(ch) {
  if (!ch) return false;
  return /[\p{L}\p{N}]/u.test(ch);
}

function findMatches(route, text) {
  const findings = [];
  const localeForCompare = route.startsWith('/en-US') ? 'en-US' : route.startsWith('/es') ? 'es' : 'pt-BR';
  const prohibitedTermsRaw = route.startsWith('/en-US')
    ? PROHIBITED_TERMS_EN_US
    : route.startsWith('/es')
      ? PROHIBITED_TERMS_ES
      : [];
  const prohibitedTerms = uniqueTerms(prohibitedTermsRaw, localeForCompare);
  const lowerText = text.toLocaleLowerCase(localeForCompare);

  for (const term of prohibitedTerms) {
    if (isIgnoredMatch(term)) continue;
    const lowerTerm = term.toLocaleLowerCase(localeForCompare);
    let index = lowerText.indexOf(lowerTerm);

    while (index !== -1) {
      const before = index === 0 ? '' : lowerText[index - 1];
      const afterIdx = index + lowerTerm.length;
      const after = afterIdx >= lowerText.length ? '' : lowerText[afterIdx];
      if (isAlphanumericChar(before) || isAlphanumericChar(after)) {
        index = lowerText.indexOf(lowerTerm, index + lowerTerm.length);
        continue;
      }
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

function summarizeByRoute(findings) {
  /** @type {Map<string, number>} */
  const map = new Map();
  for (const f of findings) {
    map.set(f.route, (map.get(f.route) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderReport(findings, failures) {
  const byRoute = summarizeByRoute(findings);
  const affectedRoutes = [...new Set(findings.map((f) => f.route))].sort();

  const lines = [
    '# i18n Rendered HTML Audit',
    '',
    `- Base URL: ${BASE_URL}`,
    `- Rotas auditadas: ${ROUTES.length}`,
    `- Achados: ${findings.length}`,
    `- Rotas com achados: ${affectedRoutes.length}`,
    '',
    '## Detalhes auditados (ids dos mocks)',
    '',
    `- Impacto: \`/impacto/${MOCK_IDS.impactDetail}\` (slug real no app; o card es “Amazonía conectada” usa este id — **não** existe \`/impacto/amazonia-conectada\` neste repositório).`,
    `- Carga: \`${MOCK_IDS.cargo}\` (e bioeconomia \`${MOCK_IDS.cargoBio}\`) · Embarcação: \`${MOCK_IDS.vessel}\` · Negociação: \`${MOCK_IDS.negotiation}\``,
    `- Rotas de detalhe incluídas: ${DETAIL_ROUTES.length} (${DETAIL_ROUTES.map((r) => `\`${r}\``).join(', ')})`,
    ''
  ];

  if (affectedRoutes.length > 0) {
    lines.push('## Resumo por rota', '');
    for (const [r, count] of byRoute) {
      lines.push(`- \`${r}\`: ${count} ocorrência(s) listada(s)`);
    }
    lines.push('');
    lines.push('### Rotas afetadas (lista única)', '');
    for (const r of affectedRoutes) {
      lines.push(`- \`${r}\``);
    }
    lines.push('');
  }

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
    const response = await fetch(`${BASE_URL}/en-US`, { redirect: 'follow' });
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

  const affectedRoutes = [...new Set(findings.map((f) => f.route))].sort();

  console.log(`Relatório gerado em: ${REPORT_PATH.replace(`${ROOT}/`, '')}`);
  console.log(
    `Detalhe (mocks): impacto=${MOCK_IDS.impactDetail}, cargo=${MOCK_IDS.cargo}, cargoBio=${MOCK_IDS.cargoBio}, vessel=${MOCK_IDS.vessel}, neg=${MOCK_IDS.negotiation}`
  );
  console.log(`Achados: ${findings.length}`);
  console.log(`Rotas com achados: ${affectedRoutes.length}`);
  if (affectedRoutes.length > 0) {
    console.log('Rotas afetadas:');
    for (const r of affectedRoutes) {
      console.log(`  - ${r}`);
    }
  }
  if (failures.length > 0) console.log(`Falhas de fetch: ${failures.length}`);

  if (findings.length > 0) process.exit(1);
  process.exit(0);
}

main();
