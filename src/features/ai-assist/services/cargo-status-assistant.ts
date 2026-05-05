import 'server-only';

import type { AppLocale } from '@/core/i18n/routing';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { AiAssistConfidence, AiAssistResponse, AiAssistSource } from '@/features/ai-assist/domain/types';
import { translateMock } from '@/shared/i18n/mock-content';
import messagesEn from '../../../../messages/en.json';
import messagesEs from '../../../../messages/es.json';
import messagesPt from '../../../../messages/pt-BR.json';

type Messages = typeof messagesPt;
type StatusBundle = {
  summary: string;
  nextSteps: string[];
  blockers: string[];
  risks: string[];
};

const bundles: Record<AppLocale, Messages> = {
  'pt-BR': messagesPt,
  en: messagesEn,
  es: messagesEs
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asStatusBundle(value: unknown): StatusBundle | null {
  if (!isRecord(value)) return null;
  const { summary, nextSteps, blockers, risks } = value;
  if (typeof summary !== 'string' || !Array.isArray(nextSteps) || !Array.isArray(blockers) || !Array.isArray(risks)) return null;
  if (!nextSteps.every((item) => typeof item === 'string')) return null;
  if (!blockers.every((item) => typeof item === 'string')) return null;
  if (!risks.every((item) => typeof item === 'string')) return null;
  return {
    summary,
    nextSteps: nextSteps as string[],
    blockers: blockers as string[],
    risks: risks as string[]
  };
}

function resolveBundle(messages: Messages, cargo: Cargo): { bundle: StatusBundle; source: AiAssistSource } {
  const statusNode = messages.cargoStatusAi.status[cargo.status as keyof typeof messages.cargoStatusAi.status];
  const parsed = asStatusBundle(statusNode);
  if (parsed) return { bundle: parsed, source: 'mock-ai' };
  const fallback = asStatusBundle(messages.cargoStatusAi.fallback);
  if (fallback) return { bundle: fallback, source: 'fallback-rule' };
  throw new Error('cargoStatusAi.fallback missing or invalid in messages');
}

function resolveConfidence(cargo: Cargo, source: AiAssistSource): AiAssistConfidence {
  if (source === 'fallback-rule') return 'low';
  switch (cargo.status) {
    case 'delivered':
      return 'high';
    case 'boarded':
    case 'contracting':
      return 'low';
    default:
      return 'medium';
  }
}

function extraBlocker(messages: Messages, cargo: Cargo): string | null {
  if (typeof cargo.documentReadiness !== 'number') return null;
  if (cargo.documentReadiness >= 50) return null;
  return messages.cargoStatusAi.extra.lowDocumentReadiness.replace('{value}', String(cargo.documentReadiness));
}

function translatedOperationalRisks(locale: AppLocale, cargo: Cargo): string[] {
  const raw = cargo.operationalRisks ?? [];
  return raw.map((risk) => translateMock(locale, risk));
}

export function buildCargoStatusAssist(cargo: Cargo, locale: AppLocale): AiAssistResponse {
  const messages = bundles[locale];
  const { bundle, source } = resolveBundle(messages, cargo);

  const blockers = [...bundle.blockers];
  const extra = extraBlocker(messages, cargo);
  if (extra) blockers.push(extra);

  const risks = [...bundle.risks, ...translatedOperationalRisks(locale, cargo)];

  return {
    summary: bundle.summary,
    nextSteps: [...bundle.nextSteps],
    blockers,
    risks,
    confidence: resolveConfidence(cargo, source),
    source
  };
}
