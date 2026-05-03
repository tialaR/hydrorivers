import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockUpsertCargo } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockUpsertCargo: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser,
  isNonEmptyText: (value: unknown, maxLength = 180) =>
    typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: vi.fn(),
  upsertCargo: mockUpsertCargo
}));

import { POST } from '@/app/api/cargas/route';

describe('POST /api/cargas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
  });

  it('retorna 403 quando role é carrier', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true });

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'role-not-allowed' });
  });

  it('retorna 403 quando usuário não está aprovado', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: false });

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'user-not-approved' });
  });

  it('retorna 400 para json inválido', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true, company: 'Cooperativa Açaí Norte' });

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: '{'
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-json' });
  });

  it('retorna 400 para campos obrigatórios ausentes', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true, company: 'Cooperativa Açaí Norte' });

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: JSON.stringify({ origin: '', destination: '', cargoType: '' })
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'missing-required-fields' });
  });

  it('retorna 201 e persiste carga no sucesso', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true,
      company: 'Cooperativa Açaí Norte'
    });

    const response = await POST(new Request('http://localhost/api/cargas', {
      method: 'POST',
      body: JSON.stringify({
        origin: 'Belém, PA',
        destination: 'Santarém, PA',
        cargoType: 'Refrigerada',
        title: 'Polpa de açaí',
        amount: '1000'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockUpsertCargo).toHaveBeenCalledWith(expect.objectContaining({
      origin: 'Belém, PA',
      destination: 'Santarém, PA',
      cargoType: 'Refrigerada',
      producer: 'Cooperativa Açaí Norte'
    }));
    expect(body.data).toMatchObject({
      origin: 'Belém, PA',
      destination: 'Santarém, PA',
      cargoType: 'Refrigerada'
    });
  });
});
