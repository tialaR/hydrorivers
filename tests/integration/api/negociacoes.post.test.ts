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

import { POST } from '@/app/api/negociacoes/route';

describe('POST /api/negociacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
  });

  it('retorna 403 quando role é shipper', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper' });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'role-not-allowed'
    });
  });

  it('retorna 403 quando role é admin', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-admin-1', role: 'admin', approved: true });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'role-not-allowed'
    });
  });

  it('retorna 403 quando carrier não está aprovado', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-3', role: 'carrier', approved: false });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'user-not-approved'
    });
  });

  it('retorna 400 quando payload obrigatório é inválido', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({ cargoId: '', vesselId: '', amount: '' })
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'missing-required-fields'
    });
  });

  it('retorna 404 quando carga não existe', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [];
      return [];
    });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({ cargoId: 'cargo-1', vesselId: 'vessel-1', amount: 'R$ 1000' })
    }));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'cargo-not-found' });
  });

  it('retorna 404 quando embarcação não existe', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [{ id: 'cargo-1', ownerId: 'u-shipper-1', title: 'Carga', producer: 'Coop', origin: 'Belém', destination: 'Santarém', corridor: 'Belém–Santarém' }];
      if (key === 'vessels') return [];
      return [];
    });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({ cargoId: 'cargo-1', vesselId: 'vessel-1', amount: 'R$ 1000' })
    }));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'vessel-not-found' });
  });

  it('retorna 201 e grava negociação + atualização da carga', async () => {
    const cargoes = [{
      id: 'cargo-1',
      ownerId: 'u-shipper-1',
      title: 'Polpa de açaí',
      producer: 'Cooperativa Açaí Norte',
      origin: 'Belém',
      destination: 'Santarém',
      corridor: 'Belém–Santarém',
      negotiationIds: []
    }];
    const vessels = [{ id: 'vessel-1', name: 'Rio Norte', ownerId: 'u-carrier-1' }];
    const negotiations: any[] = [];

    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true, company: 'Navega Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return cargoes;
      if (key === 'vessels') return vessels;
      if (key === 'negotiations') return negotiations;
      return [];
    });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({
        cargoId: 'cargo-1',
        vesselId: 'vessel-1',
        amount: 'R$ 8.000',
        estimatedTime: '3 dias',
        vesselCompatibility: 'Comboio refrigerado',
        contactChannel: 'WhatsApp',
        proposalMessage: 'Operação com janela noturna.'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toMatchObject({
      cargoId: 'cargo-1',
      vesselId: 'vessel-1',
      carrierId: 'u-carrier-1',
      shipperId: 'u-shipper-1',
      status: 'pending',
      estimatedTime: '3 dias',
      vesselCompatibility: 'Comboio refrigerado',
      contactChannel: 'WhatsApp',
      proposalMessage: 'Operação com janela noturna.'
    });
    expect(mockWriteMock).toHaveBeenCalledTimes(2);
    expect(mockWriteMock).toHaveBeenNthCalledWith(1, 'negotiations', expect.any(Array));
    expect(mockWriteMock).toHaveBeenNthCalledWith(
      2,
      'cargoes',
      expect.arrayContaining([expect.objectContaining({ id: 'cargo-1', status: 'bidding' })])
    );
  });

  it('retorna 201 sem vesselId explícito, resolvendo embarcação do carrier', async () => {
    const cargoes = [{
      id: 'cargo-1',
      ownerId: 'u-shipper-1',
      title: 'Polpa de açaí',
      producer: 'Cooperativa Açaí Norte',
      origin: 'Belém',
      destination: 'Santarém',
      corridor: 'Belém–Santarém',
      negotiationIds: []
    }];
    const vessels = [{ id: 'vessel-own', name: 'Rio Norte', ownerId: 'u-carrier-1' }];
    const negotiations: any[] = [];

    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true, company: 'Navega Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return cargoes;
      if (key === 'vessels') return vessels;
      if (key === 'negotiations') return negotiations;
      return [];
    });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({ cargoId: 'cargo-1', amount: 'R$ 8.000' })
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toMatchObject({
      cargoId: 'cargo-1',
      vesselId: 'vessel-own',
      carrierId: 'u-carrier-1'
    });
  });

  it('retorna 403 quando vesselId informado não pertence ao carrier', async () => {
    const cargoes = [{
      id: 'cargo-1',
      ownerId: 'u-shipper-1',
      title: 'Polpa de açaí',
      producer: 'Cooperativa Açaí Norte',
      origin: 'Belém',
      destination: 'Santarém',
      corridor: 'Belém–Santarém',
      negotiationIds: []
    }];
    const vessels = [{ id: 'vessel-other', name: 'Rio Sul', ownerId: 'u-carrier-2' }];

    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true, company: 'Navega Norte' });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return cargoes;
      if (key === 'vessels') return vessels;
      return [];
    });

    const response = await POST(new Request('http://localhost/api/negociacoes', {
      method: 'POST',
      body: JSON.stringify({ cargoId: 'cargo-1', vesselId: 'vessel-other', amount: 'R$ 8.000' })
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'vessel-not-owned'
    });
  });
});
