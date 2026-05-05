import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock, cookieStore } = vi.hoisted(() => ({
  mockReadMock: vi.fn(),
  cookieStore: { set: vi.fn() }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore)
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

vi.mock('@/shared/server/auth', () => ({
  toPublicUser: (user: { id: string; email: string; role: string }) => ({
    id: user.id,
    email: user.email,
    role: user.role
  })
}));

import type { HydroUser } from '@/features/auth/domain/auth.types';
import { POST } from '@/app/api/mock-mode/login-as/route';
import { apiRoutes } from '@/shared/routing/api-routes';
import { cookieNames } from '@/shared/http/cookie-names';

const loginAsPostUrl = `http://localhost${apiRoutes.mockMode.loginAs}`;

const shipper: HydroUser = {
  id: 'u-shipper-1',
  name: 'Tiala',
  email: 'tiala@hydrorivers.com',
  company: 'Coop',
  role: 'shipper',
  approved: true,
  passwordHash: 'x'
};

const admin: HydroUser = {
  id: 'u-admin-1',
  name: 'Admin',
  email: 'admin@test.com',
  company: 'H',
  role: 'admin',
  approved: true,
  passwordHash: 'x'
};

const carrierOk: HydroUser = {
  id: 'u-carrier-1',
  name: 'João',
  email: 'joao@test.com',
  company: 'N',
  role: 'carrier',
  approved: true,
  passwordHash: 'x'
};

const carrierPending: HydroUser = {
  id: 'u-carrier-3',
  name: 'Ana',
  email: 'ana@test.com',
  company: 'R',
  role: 'carrier',
  approved: false,
  passwordHash: 'x'
};

function post(body: unknown) {
  return POST(
    new Request(loginAsPostUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );
}

describe('POST /api/mock-mode/login-as', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReadMock.mockReturnValue([shipper, admin, carrierOk, carrierPending]);
    process.env = { ...originalEnv };
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('403 em production sem HYDRORIVERS_FORCE_QA_DIRECT_LOGIN', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    delete process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN;

    const response = await post({ userId: 'u-shipper-1' });

    expect(response.status).toBe(403);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('permite em production quando HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN = 'true';

    const response = await post({ userId: 'u-shipper-1' });

    expect(response.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalled();
  });

  it('404 quando userId não existe no mock', async () => {
    const response = await post({ userId: 'ghost-id' });

    expect(response.status).toBe(404);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('400 quando userId ausente', async () => {
    const response = await post({});

    expect(response.status).toBe(400);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('200 shipper: user, redirectTo /cargas e cookie hydrorivers_session=userId', async () => {
    const response = await post({ userId: 'u-shipper-1' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      user: { id: 'u-shipper-1', role: 'shipper' },
      redirectTo: '/cargas'
    });
    expect(cookieStore.set).toHaveBeenCalledWith(
      cookieNames.session,
      'u-shipper-1',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    );
  });

  it('redirectTo /admin para admin', async () => {
    const response = await post({ userId: 'u-admin-1' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ redirectTo: '/admin' });
    expect(cookieStore.set).toHaveBeenCalledWith(cookieNames.session, 'u-admin-1', expect.any(Object));
  });

  it('redirectTo /cargas para carrier aprovado', async () => {
    const response = await post({ userId: 'u-carrier-1' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ redirectTo: '/cargas' });
  });

  it('redirectTo /perfil para carrier não aprovado', async () => {
    const response = await post({ userId: 'u-carrier-3' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ redirectTo: '/perfil' });
  });
});
