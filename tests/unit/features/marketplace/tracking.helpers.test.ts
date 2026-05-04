import { describe, expect, it } from 'vitest';
import { trackingEvents } from '@/features/marketplace/data/marketplace.mock';
import type { TrackingEvent } from '@/features/marketplace/domain/marketplace.types';
import { OPERATIONAL_TRACKING_EVENT_KINDS, resolveOperationalTrackingKind } from '@/features/marketplace/domain/tracking.helpers';

describe('resolveOperationalTrackingKind', () => {
  it('prioriza kind explícito quando presente', () => {
    const event = {
      id: 't1',
      title: 'Qualquer',
      description: 'Texto ambíguo com navegação em curso',
      location: 'X',
      timestamp: 'hoje',
      status: 'pending' as const,
      kind: 'cargo_created' as const
    };
    expect(resolveOperationalTrackingKind(event)).toBe('cargo_created');
  });

  it('infere shipment_confirmed para checklist documental sem kind', () => {
    const event: TrackingEvent = {
      id: 't2',
      title: 'Documentos validados',
      description: 'NF-e e romaneio conferidos.',
      location: 'Belém, PA',
      timestamp: '06 mai • 08:30',
      status: 'done',
      evidence: 'Checklist documental assinado'
    };
    expect(resolveOperationalTrackingKind(event)).toBe('shipment_confirmed');
  });

  it('normaliza kind legado boarding_confirmed para shipment_confirmed', () => {
    const event = {
      id: 't-legacy-kind',
      title: 'Legado',
      description: '',
      location: '',
      timestamp: '',
      status: 'done' as const,
      kind: 'boarding_confirmed'
    } as unknown as TrackingEvent;
    expect(resolveOperationalTrackingKind(event)).toBe('shipment_confirmed');
  });

  it('infere documentation_pending para pendência explícita', () => {
    const event: TrackingEvent = {
      id: 't3',
      title: 'Documentação',
      description: 'NF-e pendente de anexação.',
      location: 'Terminal',
      timestamp: 'hoje',
      status: 'pending'
    };
    expect(resolveOperationalTrackingKind(event)).toBe('documentation_pending');
  });

  it('infere in_transit para navegação em curso', () => {
    const event: TrackingEvent = {
      id: 't4',
      title: 'Navegação em curso',
      description: 'Sincronização normal.',
      location: 'Rio Amazonas',
      timestamp: 'hoje',
      status: 'current'
    };
    expect(resolveOperationalTrackingKind(event)).toBe('in_transit');
  });

  it('infere proof_attached para POD', () => {
    const event: TrackingEvent = {
      id: 't5',
      title: 'POD recebido',
      description: 'Aceite digital.',
      location: 'Santarém, PA',
      timestamp: 'hoje',
      status: 'pending',
      evidence: 'Assinatura do recebedor'
    };
    expect(resolveOperationalTrackingKind(event)).toBe('proof_attached');
  });

  it('mantém lista de kinds estável para contratos futuros', () => {
    expect(OPERATIONAL_TRACKING_EVENT_KINDS).toHaveLength(9);
    expect(new Set(OPERATIONAL_TRACKING_EVENT_KINDS).size).toBe(9);
  });

  it('seed mock cobre todos os kinds operacionais para demo auditável', () => {
    const kinds = new Set(trackingEvents.map((event) => resolveOperationalTrackingKind(event)));
    expect(OPERATIONAL_TRACKING_EVENT_KINDS.every((kind) => kinds.has(kind))).toBe(true);
  });
});
