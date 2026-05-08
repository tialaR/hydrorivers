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
import { resetMockOtpChallengesForTests } from '@/features/auth/server/mock-otp-challenges';

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockOtpChallengesForTests();
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

  it('retorna 400 quando login não informa telefone e senha válidos', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', countryCode: '', phone: '', password: '' })
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-login-fields'
    });
  });

  it('retorna 404 quando usuário não existe para o telefone informado', async () => {
    mockReadMock.mockReturnValue([]);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '11999990000', password: 'hydro12345' })
    });
    const response = await POST(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'user-not-found' });
  });

  it('retorna 401 quando senha está incorreta', async () => {
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', phoneE164: '+5591999990001' }
    ]);
    mockVerifyPassword.mockReturnValue(false);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'wrong-password' })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-login' });
  });

  it('etapa 1 retorna desafio OTP vinculado ao telefone', async () => {
    process.env.HYDRORIVERS_EXPOSE_OTP_CODE = 'true';
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', phoneE164: '+5591999990001' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'hydro12345' })
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      otpRequired: true,
      phoneE164: '+5591999990001'
    });
    expect(typeof body.otpCode).toBe('string');
    expect(typeof body.challenge).toBe('string');
  });

  it('retorna 401 quando otp/challenge são inválidos', async () => {
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', phoneE164: '+5591999990001' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tiala@hydrorivers.com',
        countryCode: '+55',
        phone: '91999990001',
        password: 'hydro12345',
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
    const user = {
      id: 'u-shipper-1',
      email: 'tiala@hydrorivers.com',
      passwordHash: 'hash',
      phoneE164: '+5591999990001',
      company: 'Cooperativa Açaí Norte'
    };
    mockReadMock.mockReturnValue([user]);
    mockVerifyPassword.mockReturnValue(true);
    mockToPublicUser.mockReturnValue({ id: 'u-shipper-1', email: 'tiala@hydrorivers.com' });

    const firstResponse = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'hydro12345' })
      })
    );
    const firstBody = await firstResponse.json();

    const secondResponse = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'tiala@hydrorivers.com',
          countryCode: '+55',
          phone: '91999990001',
          password: 'hydro12345',
          otp: firstBody.otpCode,
          challenge: firstBody.challenge
        })
      })
    );
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

  it('novo OTP invalida o desafio anterior para o mesmo telefone', async () => {
    process.env.HYDRORIVERS_EXPOSE_OTP_CODE = 'true';
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', phoneE164: '+5591999990001' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const first = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'hydro12345' })
      })
    );
    const firstBody = await first.json();

    const second = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'hydro12345' })
      })
    );
    const secondBody = await second.json();

    expect(firstBody.challenge).not.toBe(secondBody.challenge);

    const stale = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'tiala@hydrorivers.com',
          countryCode: '+55',
          phone: '91999990001',
          password: 'hydro12345',
          otp: firstBody.otpCode,
          challenge: firstBody.challenge
        })
      })
    );
    expect(stale.status).toBe(401);

    const ok = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'tiala@hydrorivers.com',
          countryCode: '+55',
          phone: '91999990001',
          password: 'hydro12345',
          otp: secondBody.otpCode,
          challenge: secondBody.challenge
        })
      })
    );
    expect(ok.status).toBe(200);
  });

  it('retorna 401 quando o e-mail não corresponde ao telefone informado', async () => {
    mockReadMock.mockReturnValue([
      { id: 'u-shipper-1', email: 'tiala@hydrorivers.com', passwordHash: 'hash', phoneE164: '+5591999990001' }
    ]);
    mockVerifyPassword.mockReturnValue(true);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'outro@hydrorivers.com', countryCode: '+55', phone: '91999990001', password: 'hydro12345' })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid-login' });
  });
});
