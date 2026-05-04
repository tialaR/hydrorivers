import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockReadMock, mockWriteMock } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockReadMock: vi.fn(),
  mockWriteMock: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser,
  isNonEmptyText: (value: unknown) => typeof value === 'string' && value.trim().length > 0
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock,
  writeMock: mockWriteMock
}));

import { PATCH } from '@/app/api/negociacoes/route';

describe('PATCH /api/negociacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'accepted' })
    });
    const response = await PATCH(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
  });

  it('retorna 400 para payload inválido', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', company: 'Cooperativa Açaí Norte' });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'invalid-status' })
    });
    const response = await PATCH(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-payload' });
  });

  it('retorna 404 quando negociação não existe', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', company: 'Cooperativa Açaí Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'negotiations') return [];
      return [];
    });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-missing', status: 'accepted' })
    });
    const response = await PATCH(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'negotiation-not-found' });
  });

  it('retorna 403 quando usuário não participa da negociação', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-9', company: 'Outra Transportadora' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'negotiations') {
        return [{ id: 'neg-1', shipperId: 'u-shipper-1', carrierId: 'u-carrier-1', stage: 'quote', cargoId: 'cargo-1', history: [] }];
      }
      return [];
    });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'accepted' })
    });
    const response = await PATCH(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden' });
  });

  it('retorna 403 quando admin autenticado não é shipper nem carrier da negociação', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-admin-1', role: 'admin', company: 'HydroRivers Admin' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'negotiations') {
        return [{ id: 'neg-1', shipperId: 'u-shipper-1', carrierId: 'u-carrier-1', stage: 'quote', cargoId: 'cargo-1', history: [] }];
      }
      return [];
    });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'accepted' })
    });
    const response = await PATCH(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden' });
    expect(mockWriteMock).not.toHaveBeenCalled();
  });

  it('atualiza status para accepted e reserva a carga no sucesso', async () => {
    const negotiations = [
      {
        id: 'neg-1',
        shipperId: 'u-shipper-1',
        carrierId: 'u-carrier-1',
        stage: 'quote',
        status: 'pending',
        cargoId: 'cargo-1',
        history: []
      }
    ];
    const cargoes = [{ id: 'cargo-1', status: 'open' }];

    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', company: 'Navega Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'negotiations') return negotiations;
      if (key === 'cargoes') return cargoes;
      return [];
    });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'accepted' })
    });
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      id: 'neg-1',
      status: 'accepted',
      stage: 'contract'
    });
    expect(mockWriteMock).toHaveBeenCalledTimes(2);
    expect(mockWriteMock).toHaveBeenNthCalledWith(1, 'negotiations', expect.any(Array));
    expect(mockWriteMock).toHaveBeenNthCalledWith(
      2,
      'cargoes',
      expect.arrayContaining([expect.objectContaining({ id: 'cargo-1', status: 'reserved' })])
    );
  });

  it('retorna 200 quando participante válido é o shipper', async () => {
    const negotiations = [
      {
        id: 'neg-1',
        shipperId: 'u-shipper-1',
        carrierId: 'u-carrier-1',
        stage: 'quote',
        status: 'pending',
        cargoId: 'cargo-1',
        history: []
      }
    ];

    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', company: 'Cooperativa Açaí Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'negotiations') return negotiations;
      if (key === 'cargoes') return [{ id: 'cargo-1', status: 'open' }];
      return [];
    });

    const request = new Request('http://localhost/api/negociacoes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'neg-1', status: 'rejected' })
    });
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      id: 'neg-1',
      status: 'rejected'
    });
    expect(mockWriteMock).toHaveBeenCalledWith('negotiations', expect.any(Array));
  });
});
