import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockToPublicUser } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockToPublicUser: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser,
  toPublicUser: mockToPublicUser
}));

import { GET } from '@/app/api/auth/me/route';

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthenticated', user: null });
  });

  it('retorna usuário público quando há sessão', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', email: 'tiala@hydrorivers.com' });
    mockToPublicUser.mockReturnValue({ id: 'u-shipper-1', email: 'tiala@hydrorivers.com' });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockToPublicUser).toHaveBeenCalled();
    expect(body).toEqual({
      user: { id: 'u-shipper-1', email: 'tiala@hydrorivers.com' }
    });
  });
});
