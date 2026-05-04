import type { OperationalTrackingEventKind, TrackingEvent } from '@/features/marketplace/domain/marketplace.types';

export const OPERATIONAL_TRACKING_EVENT_KINDS: OperationalTrackingEventKind[] = [
  'cargo_created',
  'proposal_sent',
  'negotiation_accepted',
  'documentation_pending',
  'shipment_confirmed',
  'in_transit',
  'delay_reported',
  'delivered',
  'proof_attached'
];

/** Kind persistido em JSON legado antes da renomeação para `shipment_confirmed`. */
const LEGACY_SHIPMENT_KIND = 'boarding_confirmed' as const;

function blob(event: TrackingEvent): string {
  return `${event.title} ${event.description} ${event.location} ${event.evidence ?? ''}`.toLowerCase();
}

/**
 * Resolve o tipo operacional do evento.
 * Mantém compatibilidade: registros antigos só com title/description/evidence/status usam heurística.
 */
export function resolveOperationalTrackingKind(event: TrackingEvent): OperationalTrackingEventKind {
  const rawKind = (event as { kind?: string }).kind;
  if (rawKind === LEGACY_SHIPMENT_KIND) return 'shipment_confirmed';
  if (event.kind) return event.kind;

  const text = blob(event);

  if (/\bcarga criada\b|\bcargo created\b/i.test(text)) return 'cargo_created';
  if (/\bproposta enviada\b|\bproposal sent\b|\bcontraproposta\b/i.test(text)) return 'proposal_sent';
  if (/\bnegocia[cç][aã]o aceita\b|\bdeal accepted\b/i.test(text)) return 'negotiation_accepted';
  if (
    /\bdocumenta[cç][aã]o pendente\b|\bpending documentation\b|\bnf-e pendente\b|\bmanifesto pendente\b/i.test(text)
  ) {
    return 'documentation_pending';
  }
  if (
    /\bpod\b|\bcomprovante de entrega\b|\bproof of delivery\b|\bcomprovante anexado\b|\bassinatura do recebedor\b/i.test(
      text
    )
  ) {
    return 'proof_attached';
  }
  if (/\bentregue\b|\bdelivered\b/i.test(text)) return 'delivered';
  if (/\batraso\b|\bdelay\b|\bsincroniza[cç][aã]o tardia\b|\batualiza[cç][aã]o operacional pendente\b/i.test(text)) {
    return 'delay_reported';
  }
  if (
    /\bnavega[cç][aã]o em curso\b|\bem tr[aâ]nsito\b|\bin transit\b|\brota\b.*\bnavega/i.test(text) ||
    /\bnavega[cç][aã]o\b.*\brio\b/i.test(text)
  ) {
    return 'in_transit';
  }
  if (
    /\bembarque confirmado\b|\bshipment confirmed\b|\blacre\b|\btemperatura conferida\b|\bjanela de atraca[cç][aã]o\b|\bdocumentos validados\b/i.test(
      text
    )
  ) {
    return 'shipment_confirmed';
  }
  if (/\bdocumento\b|\bchecklist documental\b|\bromaneio\b|\bnf-e\b/i.test(text)) return 'documentation_pending';

  if (event.status === 'done') return 'shipment_confirmed';
  if (event.status === 'current') return 'in_transit';
  return 'documentation_pending';
}
