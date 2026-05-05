import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockReadMock, mockLogUseCase } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockReadMock: vi.fn(),
  mockLogUseCase: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

vi.mock('@/shared/observability/use-case-logger', () => ({
  logUseCaseEvent: mockLogUseCase
}));

import { POST } from '@/app/api/ai/cargo-status/route';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

const baseCargo: Cargo = {
  id: 'cargo-test-1',
  title: 'Test cargo',
  origin: 'A',
  destination: 'B',
  volume: '10 t',
  window: 'mai',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-40%',
  targetPrice: 'R$ 1',
  ownerId: 'u-shipper-1'
};

function post(body: unknown) {
  return POST(new Request('http://localhost/api/ai/cargo-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }));
}

function callsPayload() {
  return mockLogUseCase.mock.calls.map((call) => JSON.stringify(call[0]));
}

describe('POST /api/ai/cargo-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
    expect(mockLogUseCase).not.toHaveBeenCalled();
  });

  it('retorna 403 quando usuário não aprovado', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-carrier-3',
      name: 'Ana',
      email: 'ana@test.com',
      company: 'RiosLog',
      role: 'carrier',
      approved: false
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden', reason: 'user-not-approved' });
    expect(mockLogUseCase).toHaveBeenCalledTimes(1);
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'ACCESS_DENIED',
      status: 'blocked'
    }));
  });

  it('retorna 403 quando embarcador não é o ownerId da carga', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-2',
      name: 'Mariana',
      email: 'mariana@test.com',
      company: 'BioAmazônia',
      role: 'shipper',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden', reason: 'cargo-access-denied' });
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'REQUEST_RECEIVED',
      status: 'started'
    }));
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'ACCESS_DENIED',
      status: 'blocked'
    }));
  });

  it('retorna 403 quando transportador não participa da carga', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-carrier-2',
      name: 'Carlos',
      email: 'carlos@test.com',
      company: 'Hidrovias',
      role: 'carrier',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') {
        return [{ id: 'n1', cargoId: 'cargo-test-1', carrierId: 'u-carrier-1', shipperId: 'u-shipper-1' }];
      }
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden', reason: 'cargo-access-denied' });
  });

  it('retorna 404 quando carga não existe', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@test.com',
      company: 'Coop',
      role: 'shipper',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'missing-id', locale: 'pt-BR' });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'not-found', reason: 'cargo-not-found' });
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'CARGO_NOT_FOUND',
      status: 'failed'
    }));
  });

  it('retorna 200 quando transportador participa da negociação da carga', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-carrier-1',
      name: 'João',
      email: 'joao@test.com',
      company: 'Navega Norte',
      role: 'carrier',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') {
        return [{ id: 'n1', cargoId: 'cargo-test-1', carrierId: 'u-carrier-1', shipperId: 'u-shipper-1' }];
      }
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.source).toMatch(/^(mock-ai|fallback-rule)$/);
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'RESPONSE_GENERATED',
      status: 'success'
    }));
  });

  it('retorna 200 com contrato correto para embarcador dono da carga', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@test.com',
      company: 'Coop',
      role: 'shipper',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'en' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toMatchObject({
      summary: expect.any(String),
      nextSteps: expect.any(Array),
      blockers: expect.any(Array),
      risks: expect.any(Array),
      confidence: expect.stringMatching(/^(low|medium|high)$/),
      source: 'mock-ai'
    });
    expect(body.data.nextSteps.length).toBeGreaterThan(0);
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'REQUEST_RECEIVED',
      status: 'started'
    }));
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'RESPONSE_GENERATED',
      status: 'success',
      context: expect.objectContaining({ source: 'mock-ai' })
    }));
    expect(mockLogUseCase).not.toHaveBeenCalledWith(expect.objectContaining({ step: 'FALLBACK_USED' }));
  });

  it('usa fallback-rule quando o status não tem pacote i18n', async () => {
    const odd = { ...baseCargo, status: 'open' as const };
    Object.assign(odd, { status: 'unknown_status' });

    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [odd as Cargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.source).toBe('fallback-rule');
    expect(body.data.confidence).toBe('low');
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'FALLBACK_USED',
      status: 'fallback'
    }));
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'RESPONSE_GENERATED',
      status: 'success'
    }));
  });

  it('retorna 400 quando cargoId ausente', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });

    const response = await post({ locale: 'pt-BR' });
    expect(response.status).toBe(400);
    expect(mockLogUseCase).toHaveBeenCalledWith(expect.objectContaining({
      step: 'REQUEST_RECEIVED',
      status: 'failed',
      error: expect.objectContaining({ code: 'missing-cargo-id' })
    }));
  });

  it('logs de observabilidade não incluem passwordHash nem corpo bruto do usuário', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@test.com',
      company: 'Coop',
      role: 'shipper',
      approved: true,
      passwordHash: 'NEVER_LOG_THIS_HASH_VALUE'
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    const blob = callsPayload().join('\n');
    expect(blob).not.toContain('NEVER_LOG_THIS_HASH_VALUE');
    expect(blob).not.toContain('passwordHash');
  });
});
