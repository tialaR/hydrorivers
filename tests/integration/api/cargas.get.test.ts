import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock } = vi.hoisted(() => ({
  mockReadMock: vi.fn()
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { GET } from '@/app/api/cargas/route';

describe('GET /api/cargas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 e lista de cargas via repository boundary', async () => {
    mockReadMock.mockReturnValue([
      {
        id: 'cargo-1',
        title: 'Polpa',
        origin: 'Belém',
        destination: 'Santarém',
        volume: '120 t',
        window: 'mai',
        cargoType: 'Refrigerada',
        status: 'open',
        co2Saving: '-40%',
        targetPrice: 'R$ 6.000'
      }
    ]);

    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockReadMock).toHaveBeenCalledWith('cargoes');
    expect(body).toMatchObject({
      data: [
        expect.objectContaining({
          id: 'cargo-1',
          origin: 'Belém',
          destination: 'Santarém'
        })
      ]
    });
  });
});
