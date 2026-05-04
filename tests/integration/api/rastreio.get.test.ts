import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock } = vi.hoisted(() => ({
  mockReadMock: vi.fn()
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { GET } from '@/app/api/rastreio/route';

describe('GET /api/rastreio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 e eventos com campos legados e operacionais opcionais', async () => {
    mockReadMock.mockReturnValue([
      {
        id: 'track-legacy',
        title: 'Evento legado',
        description: 'Sem kind nem timestamps ISO.',
        location: 'Belém',
        timestamp: '06 mai • 08:30',
        status: 'done'
      },
      {
        id: 'track-rich',
        title: 'POD recebido',
        description: 'Comprovante.',
        location: 'Santarém',
        timestamp: '07 mai • 15:30',
        status: 'pending',
        kind: 'proof_attached',
        occurredAt: '2026-05-07T18:30:00.000Z',
        recordedAt: '2026-05-07T18:31:00.000Z',
        cargoId: 'cargo-001',
        negotiationId: 'neg-001'
      }
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockReadMock).toHaveBeenCalledWith('trackingEvents');
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({
      id: 'track-legacy',
      title: 'Evento legado',
      status: 'done'
    });
    expect(body.data[1]).toMatchObject({
      id: 'track-rich',
      kind: 'proof_attached',
      cargoId: 'cargo-001',
      negotiationId: 'neg-001',
      occurredAt: '2026-05-07T18:30:00.000Z'
    });
  });
});
