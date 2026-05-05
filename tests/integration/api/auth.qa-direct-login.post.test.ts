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
  toPublicUser: (user: { id: string; email: string }) => ({ id: user.id, email: user.email })
}));

import type { HydroUser } from '@/features/auth/domain/auth.types';
import { POST } from '@/app/api/auth/qa-direct-login/route';
import { cookieNames } from '@/shared/http/cookie-names';

const shipper: HydroUser = {
  id: 'u-shipper-1',
  name: 'Tiala',
  email: 'tiala@hydrorivers.com',
  company: 'Coop',
  role: 'shipper',
  approved: true,
  passwordHash: 'x'
};

describe('POST /api/auth/qa-direct-login', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReadMock.mockReturnValue([shipper]);
    process.env = { ...originalEnv };
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
    delete process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN;
    delete process.env.HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('define sessão para email demo permitido', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/qa-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'tiala@hydrorivers.com' })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ user: { id: 'u-shipper-1' } });
    expect(cookieStore.set).toHaveBeenCalledWith(
      cookieNames.session,
      'u-shipper-1',
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('403 em production sem HYDRORIVERS_FORCE_QA_DIRECT_LOGIN', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';

    const response = await POST(
      new Request('http://localhost/api/auth/qa-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'tiala@hydrorivers.com' })
      })
    );

    expect(response.status).toBe(403);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('permite login direto em production quando HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN = 'true';

    const response = await POST(
      new Request('http://localhost/api/auth/qa-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'tiala@hydrorivers.com' })
      })
    );

    expect(response.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalled();
  });

  it('403 quando email não está na lista QA', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/qa-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@test.com' })
      })
    );

    expect(response.status).toBe(403);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('desliga em test quando HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN=false', async () => {
    process.env.HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN = 'false';

    const response = await POST(
      new Request('http://localhost/api/auth/qa-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'tiala@hydrorivers.com' })
      })
    );

    expect(response.status).toBe(403);
  });
});
