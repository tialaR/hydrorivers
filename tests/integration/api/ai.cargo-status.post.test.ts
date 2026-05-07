import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockReadMock } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockReadMock: vi.fn()
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { POST } from '@/app/api/ai/cargo-status/route';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import { apiRoutes } from '@/shared/routing/api-routes';

const cargoStatusPostUrl = `http://localhost${apiRoutes.ai.cargoStatus}`;

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
  return POST(new Request(cargoStatusPostUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }));
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

    const response = await post({ cargoId: 'cargo-test-1', locale: 'en-US' });
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
  });

  it('retorna 400 quando cargoId é string vazia', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });

    const response = await post({ cargoId: '   ', locale: 'pt-BR' });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-payload', reason: 'missing-cargo-id' });
  });

  it('locale inválido usa fallback para defaultLocale', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
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
    const expected = buildCargoStatusAssist(baseCargo, 'pt-BR');
    expect(body.data).toMatchObject(expected);
  });

  it('locale en-US funciona explicitamente', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'en-US' });
    expect(response.status).toBe(200);
    const body = await response.json();
    const expected = buildCargoStatusAssist(baseCargo, 'en-US');
    expect(body.data).toMatchObject(expected);
  });

  it('locale es funciona explicitamente', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'es' });
    expect(response.status).toBe(200);
    const body = await response.json();
    const expected = buildCargoStatusAssist(baseCargo, 'es');
    expect(body.data).toMatchObject(expected);
  });

  it('locale pt-BR funciona explicitamente', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(200);
    const body = await response.json();
    const expected = buildCargoStatusAssist(baseCargo, 'pt-BR');
    expect(body.data).toMatchObject(expected);
  });

  it('JSON da resposta não expõe passwordHash nem outros campos da sessão', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      name: 'Tiala',
      email: 'tiala@test.com',
      company: 'Coop',
      role: 'shipper',
      approved: true,
      passwordHash: 'NEVER_LEAK_THIS_HASH_VALUE'
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') return [baseCargo];
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(200);
    const bodyText = JSON.stringify(await response.json());
    expect(bodyText).not.toContain('NEVER_LEAK_THIS_HASH_VALUE');
    expect(bodyText).not.toContain('passwordHash');
    expect(bodyText).not.toContain('token');
    expect(bodyText).not.toContain('session');
  });

  it('resposta 200 inclui apenas contrato público do assistente', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true,
      passwordHash: 'HASH_SHOULD_NOT_LEAK'
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') {
        return [{
          ...baseCargo,
          ownerId: 'u-shipper-1',
          shipperId: 'u-shipper-1',
          carrierId: 'u-carrier-1',
          negotiationIds: ['n1']
        }];
      }
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      data: expect.objectContaining({
        summary: expect.any(String),
        nextSteps: expect.any(Array),
        blockers: expect.any(Array),
        risks: expect.any(Array),
        confidence: expect.stringMatching(/^(low|medium|high)$/),
        source: expect.stringMatching(/^(mock-ai|fallback-rule)$/)
      })
    });

    const bodyText = JSON.stringify(body);
    expect(bodyText).not.toContain('HASH_SHOULD_NOT_LEAK');
    expect(bodyText).not.toContain('passwordHash');
    expect(bodyText).not.toContain('ownerId');
    expect(bodyText).not.toContain('shipperId');
    expect(bodyText).not.toContain('carrierId');
    expect(bodyText).not.toContain('negotiationIds');
  });

  it('retorna 500 genérico quando ocorre erro interno inesperado', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      name: 'Admin',
      email: 'admin@test.com',
      company: 'Hydro',
      role: 'admin',
      approved: true
    });
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') throw new Error('database connection failed: secret details');
      if (key === 'negotiations') return [];
      return [];
    });

    const response = await post({ cargoId: 'cargo-test-1', locale: 'pt-BR' });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: 'internal-server-error' });
    expect(JSON.stringify(body)).not.toContain('secret details');
  });
});
