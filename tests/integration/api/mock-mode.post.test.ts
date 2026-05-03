import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockResetMockScenario } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockResetMockScenario: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/shared/server/mock-scenarios', () => ({
  mockScenarioIds: ['market-active', 'in-transit', 'completed']
}));

vi.mock('@/shared/server/mock-db', () => ({
  getActiveMockScenario: vi.fn(() => 'base'),
  resetMockScenario: mockResetMockScenario
}));

import { POST } from '@/app/api/mock-mode/route';

describe('POST /api/mock-mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const request = new Request('http://localhost/api/mock-mode', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'market-active' })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
  });

  it('retorna 403 quando usuário não é admin', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier' });

    const request = new Request('http://localhost/api/mock-mode', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'market-active' })
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden' });
  });

  it('retorna 200 e contagens quando admin reseta cenário', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-admin-1', role: 'admin' });
    mockResetMockScenario.mockReturnValue({
      scenario: 'market-active',
      data: {
        users: [{ id: 'u-admin-1' }],
        cargoes: [{ id: 'cargo-1' }, { id: 'cargo-2' }],
        vessels: [{ id: 'vessel-1' }],
        negotiations: [{ id: 'neg-1' }],
        trackingEvents: [{ id: 'track-1' }]
      }
    });

    const request = new Request('http://localhost/api/mock-mode', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'market-active' })
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockResetMockScenario).toHaveBeenCalledWith('market-active');
    expect(body.data).toMatchObject({
      activeScenario: 'market-active',
      counts: {
        users: 1,
        cargoes: 2,
        vessels: 1,
        negotiations: 1,
        trackingEvents: 1
      }
    });
  });
});
