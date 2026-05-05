/**
 * Logs estruturados de casos de uso no terminal (estritamente opt-in).
 * Emite apenas quando HYDRORIVERS_USE_CASE_LOGS === "true".
 */

import { isUseCaseLogsEnabled } from '@/shared/config/env';
import { cookieNames } from '@/shared/http/cookie-names';

export const USE_CASE_IDS = [
  'AI_CARGO_STATUS_ASSISTANT',
  'MOCK_MODE_RESET',
  'CARGO_DETAIL_ACCESS',
  'NEGOTIATION_UPDATE',
  'I18N_LOCALE_SWITCH'
] as const;

export type UseCaseId = (typeof USE_CASE_IDS)[number];

export const USE_CASE_STATUSES = ['started', 'success', 'blocked', 'failed', 'fallback'] as const;

export type UseCaseStatus = (typeof USE_CASE_STATUSES)[number];

export type UseCaseActor = {
  userId?: string;
  role?: string;
};

export type UseCaseError = {
  code?: string;
  message?: string;
};

export type LogUseCaseEventParams = {
  useCase: UseCaseId;
  step: string;
  status: UseCaseStatus;
  actor?: UseCaseActor;
  context?: Record<string, unknown>;
  error?: UseCaseError;
};

const USE_CASE_ID_SET = new Set<string>(USE_CASE_IDS);
const USE_CASE_STATUS_SET = new Set<string>(USE_CASE_STATUSES);

function normalizeKey(key: string): string {
  return key.replace(/[\s_-]/g, '').toLowerCase();
}

/** Chaves cujo valor nunca deve aparecer literal no log. */
const SENSITIVE_KEY_NORMALIZED = new Set([
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'password',
  'passwordhash',
  'authorization',
  'cookie',
  'cookies',
  'set-cookie',
  'setcookie',
  normalizeKey(cookieNames.session),
  'sessionid',
  'apikey',
  'api_key',
  'secret',
  'clientsecret',
  'otp',
  'otpcode',
  'otp_code'
]);

/** Valores inteiros omitidos (evita payload bruto / corpo completo). */
const OMIT_VALUE_KEY_NORMALIZED = new Set(['payload', 'body', 'rawbody', 'raw_body', 'requestbody', 'request_body']);

const MAX_DEPTH = 8;
const MAX_ERROR_MESSAGE_LEN = 480;

function isSensitiveKey(key: string): boolean {
  const n = normalizeKey(key);
  if (SENSITIVE_KEY_NORMALIZED.has(n)) return true;
  if (n.includes('password') || n.includes('authorization')) return true;
  if (n === 'cookie' || n === 'cookies' || n.endsWith('cookie')) return true;
  if (n.includes('token')) return true;
  return false;
}

function shouldOmitValueKey(key: string): boolean {
  return OMIT_VALUE_KEY_NORMALIZED.has(normalizeKey(key));
}

/**
 * Remove/mascara dados sensíveis em objetos planos aninhados (para context e error).
 * Exportado para testes unitários.
 */
export function sanitizeUseCaseLogValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[max-depth]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => sanitizeUseCaseLogValue(item, depth + 1));

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const out: Record<string, unknown> = {};
    for (const [key, child] of entries) {
      if (isSensitiveKey(key)) {
        out[key] = '[redacted]';
        continue;
      }
      if (shouldOmitValueKey(key)) {
        out[key] = '[omitted]';
        continue;
      }
      out[key] = sanitizeUseCaseLogValue(child, depth + 1);
    }
    return out;
  }

  return '[unserializable]';
}

function truncateErrorMessage(message: string): string {
  if (message.length <= MAX_ERROR_MESSAGE_LEN) return message;
  return `${message.slice(0, MAX_ERROR_MESSAGE_LEN)}…`;
}

function sanitizeError(error: UseCaseError): Record<string, unknown> {
  const raw = sanitizeUseCaseLogValue({ ...(error as Record<string, unknown>) }) as Record<string, unknown>;
  if (typeof raw.message === 'string') {
    raw.message = truncateErrorMessage(raw.message);
  }
  return raw;
}

function isValidUseCaseId(value: string): value is UseCaseId {
  return USE_CASE_ID_SET.has(value);
}

function isValidStatus(value: string): value is UseCaseStatus {
  return USE_CASE_STATUS_SET.has(value);
}

function formatLines(params: LogUseCaseEventParams): string {
  const { useCase, step, status, actor, context, error } = params;
  const safeContext = context !== undefined ? sanitizeUseCaseLogValue(context) : undefined;
  const safeError = error !== undefined ? sanitizeError(error) : undefined;
  const actorLine = actor && (actor.userId !== undefined || actor.role !== undefined)
    ? JSON.stringify(sanitizeUseCaseLogValue(actor))
    : '(none)';

  const lines = [
    '[HydroRivers Use Case]',
    `  useCase: ${useCase}`,
    `  step: ${step}`,
    `  status: ${status}`,
    `  actor: ${actorLine}`,
    `  context: ${safeContext !== undefined ? JSON.stringify(safeContext) : '(none)'}`,
    `  error: ${safeError !== undefined ? JSON.stringify(safeError) : '(none)'}`
  ];
  return lines.join('\n');
}

/**
 * Registra um evento de caso de uso no terminal, quando habilitado por ambiente.
 * Nunca inclui token, cookie, senha, authorization ou payload bruto — ver sanitização.
 */
export function logUseCaseEvent(params: LogUseCaseEventParams): void {
  if (!isUseCaseLogsEnabled()) {
    return;
  }
  if (!isValidUseCaseId(params.useCase) || !isValidStatus(params.status)) {
    return;
  }
  console.log(formatLines(params));
}
