import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionUser, mockUpsertCargo, mockRevalidatePath, mockRevalidateTag } = vi.hoisted(() => ({
  mockGetSessionUser: vi.fn(),
  mockUpsertCargo: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRevalidateTag: vi.fn()
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

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag
}));

import { POST } from '@/app/api/cargas/route';
import { cargoCacheRevalidateProfile, cargoCacheTags } from '@/features/cargos/cache/cargo-cache-tags';
import { apiRoutes } from '@/shared/routing/api-routes';
import { appRoutes } from '@/shared/routing/app-routes';

const cargoPostUrl = `http://localhost${apiRoutes.cargos.collection}`;

describe('POST /api/cargas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não há sessão', async () => {
    mockGetSessionUser.mockResolvedValue(null);

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'unauthenticated' });
  });

  it('retorna 403 quando role é carrier', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-carrier-1', role: 'carrier', approved: true });

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'role-not-allowed'
    });
  });

  it('retorna 403 quando usuário não está aprovado', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: false });

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'user-not-approved'
    });
  });

  it('retorna 400 para json inválido', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true, company: 'Cooperativa Açaí Norte' });

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: '{'
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-json'
    });
  });

  it('retorna 400 para campos obrigatórios ausentes', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true, company: 'Cooperativa Açaí Norte' });

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: JSON.stringify({ origin: '', destination: '', cargoType: '' })
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'missing-required-fields'
    });
  });

  it('retorna 201 e persiste carga no sucesso', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true,
      company: 'Cooperativa Açaí Norte'
    });

    const response = await POST(new Request(cargoPostUrl, {
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
      ownerId: 'u-shipper-1',
      shipperId: 'u-shipper-1',
      origin: 'Belém, PA',
      destination: 'Santarém, PA',
      cargoType: 'Refrigerada',
      producer: 'Cooperativa Açaí Norte'
    }));
    expect(body.data).toMatchObject({
      ownerId: 'u-shipper-1',
      shipperId: 'u-shipper-1',
      origin: 'Belém, PA',
      destination: 'Santarém, PA',
      cargoType: 'Refrigerada'
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith(cargoCacheTags.allCargos, cargoCacheRevalidateProfile);
    expect(mockRevalidateTag).toHaveBeenCalledWith(cargoCacheTags.cargoMarketplace, cargoCacheRevalidateProfile);
    expect(mockRevalidateTag).toHaveBeenCalledWith(cargoCacheTags.userCargos('u-shipper-1'), cargoCacheRevalidateProfile);
    expect(mockRevalidateTag).toHaveBeenCalledWith(cargoCacheTags.cargoDetail(body.data.id), cargoCacheRevalidateProfile);
  });

  it('retorna 201 quando admin aprovado publica carga', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-admin-1',
      role: 'admin',
      approved: true,
      company: 'Órgão Piloto'
    });

    const response = await POST(new Request(cargoPostUrl, {
      method: 'POST',
      body: JSON.stringify({
        origin: 'Manaus, AM',
        destination: 'Belém, PA',
        cargoType: 'Geral',
        title: 'Carga institucional demo'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockUpsertCargo).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: 'u-admin-1',
      shipperId: 'u-admin-1',
      origin: 'Manaus, AM',
      destination: 'Belém, PA',
      cargoType: 'Geral',
      producer: 'Órgão Piloto'
    }));
    expect(body.data).toMatchObject({
      ownerId: 'u-admin-1',
      shipperId: 'u-admin-1',
      origin: 'Manaus, AM',
      destination: 'Belém, PA',
      cargoType: 'Geral'
    });
  });

  it('revalida páginas de cargas, minhas-cargas e dashboard por locale após POST', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true,
      company: 'Cooperativa Açaí Norte'
    });

    await POST(new Request(cargoPostUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Belém, PA',
        destination: 'Santarém, PA',
        cargoType: 'Refrigerada',
        title: 'Revalidação'
      })
    }));

    expect(mockRevalidateTag).toHaveBeenCalledTimes(4);
    expect(mockRevalidatePath).toHaveBeenCalledTimes(9);
    expect(mockRevalidatePath.mock.calls.map((c) => c[0])).toEqual(
      expect.arrayContaining([
        appRoutes.cargos.marketplace('pt-BR'),
        appRoutes.cargos.myCargos('en-US'),
        appRoutes.dashboard.home('es')
      ])
    );
  });
});
