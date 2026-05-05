/**
 * HydroRivers Dev Scenario Reporter — blocos legíveis no terminal para QA/manual em mock/dev.
 * Não usa dependências externas. Nunca registra senha digitada, token real nem Authorization.
 */

import { sanitizeUseCaseLogValue } from '@/shared/observability/use-case-logger';
import { isDevScenarioLogsEnabled, isDevScenarioVerboseEnabled } from '@/shared/config/env';

export type DevScenarioStatus =
  | 'started'
  | 'success'
  | 'failed'
  | 'blocked'
  | 'waiting_for_otp'
  | 'fallback';

/** Metadados opcionais para QA (sanitizados antes de imprimir). */
export type DevScenarioVerboseHints = Record<string, unknown>;

export type ReportDevScenarioParams = {
  title: string;
  /** mock ou dev — em runtime mock-first usamos ambos como rótulo de cenário. */
  mode?: 'mock' | 'dev';
  status: DevScenarioStatus;
  actor?: {
    userId?: string;
    role?: string;
    email?: string;
    company?: string;
    approved?: boolean;
    /** Nunca passe senha ou token aqui. */
  };
  /** Ex.: login, cargo status assistant */
  resource?: string;
  whatWorked?: string[];
  whatFailed?: string[];
  whyBlocked?: string[];
  expectedResult?: string[];
  nextManualStep?: string[];
  /** Em modo verbose, chaves são sanitizadas (sem secrets). */
  verboseHints?: DevScenarioVerboseHints;
};

const BAR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

/** Somente com HYDRORIVERS_DEV_SCENARIO_LOGS=true (evita poluir o terminal em dev/mock). */
export function shouldEmitDevScenarioReports(): boolean {
  return isDevScenarioLogsEnabled();
}

export function isDevScenarioVerbose(): boolean {
  return isDevScenarioVerboseEnabled();
}

function fmtSection(label: string, lines: string[] | undefined): string[] {
  if (!lines?.length) return [];
  const out: string[] = [` ${label}`, ...lines.map((l) => `   • ${l}`)];
  return out;
}

function fmtActor(actor: ReportDevScenarioParams['actor']): string {
  if (!actor || Object.keys(actor).length === 0) return '(none)';
  const safe = sanitizeUseCaseLogValue(actor) as Record<string, unknown>;
  return JSON.stringify(safe);
}

function fmtVerbose(hints: DevScenarioVerboseHints | undefined): string[] {
  if (!hints || !isDevScenarioVerbose() || !shouldEmitDevScenarioReports()) return [];
  const safe = sanitizeUseCaseLogValue(hints) as Record<string, unknown>;
  const keys = Object.keys(safe).sort();
  if (!keys.length) return [];
  const lines = [` Mock hints (verbose):`];
  for (const k of keys) {
    const v = safe[k];
    const rendered =
      v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v);
    lines.push(`   ${k}: ${rendered}`);
  }
  return lines;
}

function formatDevScenarioBlock(params: ReportDevScenarioParams): string {
  const modeLabel = params.mode === 'dev' ? 'dev' : 'mock/dev';
  const verboseLines = fmtVerbose(params.verboseHints);
  const lines: string[] = [
    '',
    BAR,
    ' HydroRivers Dev Scenario Reporter',
    BAR,
    ` Scenario        : ${params.title}`,
    ` Mode            : ${modeLabel}`,
    ` Status          : ${params.status}`,
    ` Resource        : ${params.resource ?? '(unspecified)'}`,
    ` Actor           : ${fmtActor(params.actor)}`,
    '',
    ...fmtSection('What worked', params.whatWorked),
    ...(params.whatWorked?.length ? [''] : []),
    ...fmtSection('What failed', params.whatFailed),
    ...(params.whatFailed?.length ? [''] : []),
    ...fmtSection('Why blocked', params.whyBlocked),
    ...(params.whyBlocked?.length ? [''] : []),
    ...fmtSection('Expected result', params.expectedResult),
    ...(params.expectedResult?.length ? [''] : []),
    ...fmtSection('Next manual step', params.nextManualStep),
    ...(params.nextManualStep?.length ? [''] : []),
    ...verboseLines,
    ...(verboseLines.length ? [''] : []),
    BAR,
    ''
  ];
  return lines.join('\n');
}

/**
 * Imprime um bloco visual de cenário para QA/dev quando habilitado pelo ambiente.
 * Segredos em verboseHints são mascarados por sanitizeUseCaseLogValue.
 */
export function reportDevScenario(params: ReportDevScenarioParams): void {
  if (!shouldEmitDevScenarioReports()) return;
  console.log(formatDevScenarioBlock(params));
}
