import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockUpsertUser, mockToPublicUser } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockUpsertUser: vi.fn(),
  mockToPublicUser: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser,
  isNonEmptyText: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
  toPublicUser: mockToPublicUser
}));

vi.mock('@/shared/server/mock-db', () => ({
  upsertUser: mockUpsertUser
}));

import { PUT } from '@/app/api/auth/profile/route';

describe('PUT /api/auth/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await PUT(new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({})
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
    expect(mockUpsertUser).not.toHaveBeenCalled();
  });

  it('retorna 400 para json inválido', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-1' });

    const response = await PUT(new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      body: '{'
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-json'
    });
  });

  it('retorna 400 para campos obrigatórios ausentes', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-1' });

    const response = await PUT(new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: '', email: '', company: '' })
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'missing-required-fields'
    });
  });

  it('retorna 200 e persiste perfil atualizado', async () => {
    const currentUser = {
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@hydrorivers.com',
      company: 'Cooperativa Açaí Norte',
      role: 'shipper',
      approved: true,
      passwordHash: 'hash'
    };

    mockGetSessionUser.mockResolvedValue(currentUser);
    mockToPublicUser.mockImplementation((user: any) => ({ id: user.id, email: user.email, company: user.company }));

    const response = await PUT(new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Tiala Rocha',
        email: 'tiala@hydrorivers.com',
        company: 'Cooperativa Açaí Norte',
        phone: '91 99999-0000',
        city: 'Belém'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpsertUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true,
      passwordHash: 'hash',
      phone: '91 99999-0000',
      city: 'Belém'
    }));
    expect(body.user).toMatchObject({
      id: 'u-shipper-1',
      email: 'tiala@hydrorivers.com'
    });
  });

  it('mantém id/role/approved originais mesmo se payload tentar sobrescrever', async () => {
    const currentUser = {
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@hydrorivers.com',
      company: 'Cooperativa Açaí Norte',
      role: 'shipper',
      approved: true,
      passwordHash: 'hash'
    };

    mockGetSessionUser.mockResolvedValue(currentUser);
    mockToPublicUser.mockImplementation((user: any) => ({
      id: user.id,
      role: user.role,
      approved: user.approved,
      email: user.email
    }));

    const response = await PUT(new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'u-admin-1',
        role: 'admin',
        approved: false,
        name: 'Tiala Rocha',
        email: 'tiala@hydrorivers.com',
        company: 'Cooperativa Açaí Norte'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpsertUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true
    }));
    expect(body.user).toMatchObject({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true
    });
  });
});
