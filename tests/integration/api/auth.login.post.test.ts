import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock, mockVerifyPassword, mockToPublicUser, cookieStore } = vi.hoisted(() => ({
  mockReadMock: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockToPublicUser: vi.fn(),
  cookieStore: {
    set: vi.fn()
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore)
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

vi.mock('@/shared/server/auth', () => ({
  verifyPassword: mockVerifyPassword,
  toPublicUser: mockToPublicUser
}));

import { POST } from '@/app/api/auth/login/route';
import { cookieNames } from '@/shared/http/cookie-names';

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.HYDRORIVERS_EXPOSE_OTP_CODE;
    mockToPublicUser.mockImplementation((user: unknown) => user);
  });

  it('retorna 400 para json inválido', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: '{'
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-json'
    });
  });

  it('retorna 400 quando faltam credenciais', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' })
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'missing-credentials'
    });
  });

  it('retorna 401 para usuário inexistente ou senha inválida', async () => {
    mockReadMock.mockReturnValue([]);
    mockVerifyPassword.mockReturnValue(false);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'naoexiste@hydrorivers.com', password: 'x' })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-login' });
  });

  it('retorna desafio OTP sem expor código no modo padrão', async () => {
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', password: 'hydro123' })
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ otpRequired: true });
    expect(typeof body.challenge).toBe('string');
    expect(body.otpCode).toBeUndefined();
  });

  it('retorna otpCode apenas em modo demo com flag habilitada', async () => {
    process.env.HYDRORIVERS_EXPOSE_OTP_CODE = 'true';
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', password: 'hydro123' })
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ otpRequired: true });
    expect(typeof body.otpCode).toBe('string');
    expect(typeof body.challenge).toBe('string');
  });

  it('retorna 401 quando otp/challenge são inválidos', async () => {
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tiala@hydrorivers.com',
        password: 'hydro123',
        otp: '000000',
        challenge: 'bad'
      })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-otp' });
  });

  it('retorna 200 e grava cookie quando otp/challenge são válidos', async () => {
    process.env.HYDRORIVERS_EXPOSE_OTP_CODE = 'true';
    const user = { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', company: 'Cooperativa Açaí Norte' };
    mockReadMock.mockReturnValue([user]);
    mockVerifyPassword.mockReturnValue(true);
    mockToPublicUser.mockReturnValue({ id: 'u-shipper-1', email: 'tiala@hydrorivers.com' });

    const firstResponse = await POST(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', password: 'hydro123' })
    }));
    const firstBody = await firstResponse.json();

    const secondResponse = await POST(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tiala@hydrorivers.com',
        password: 'hydro123',
        otp: firstBody.otpCode,
        challenge: firstBody.challenge
      })
    }));
    const secondBody = await secondResponse.json();

    expect(secondResponse.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalledWith(
      cookieNames.session,
      'u-shipper-1',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    );
    expect(secondBody).toMatchObject({
      user: { id: 'u-shipper-1', email: 'tiala@hydrorivers.com' }
    });
  });
});
