import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock } = vi.hoisted(() => ({
  mockReadMock: vi.fn()
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { GET } from '@/app/api/embarcacoes/route';

describe('GET /api/embarcacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 e lista de embarcações no contrato atual', async () => {
    mockReadMock.mockReturnValue([
      { id: 'vessel-1', name: 'Comboio Rio Negro', status: 'available' },
      { id: 'vessel-2', name: 'Frio Tapajós', status: 'route' }
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockReadMock).toHaveBeenCalledWith('vessels');
    expect(body).toMatchObject({
      data: [
        { id: 'vessel-1', name: 'Comboio Rio Negro' },
        { id: 'vessel-2', name: 'Frio Tapajós' }
      ]
    });
  });
});
