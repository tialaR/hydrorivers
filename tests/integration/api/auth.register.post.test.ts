import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadMock, mockUpsertUser, mockHashPassword, mockToPublicUser, cookieStore } = vi.hoisted(() => ({
  mockReadMock: vi.fn(),
  mockUpsertUser: vi.fn(),
  mockHashPassword: vi.fn(),
  mockToPublicUser: vi.fn(),
  cookieStore: {
    set: vi.fn()
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore)
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock,
  upsertUser: mockUpsertUser
}));

vi.mock('@/shared/server/auth', () => ({
  hashPassword: mockHashPassword,
  isNonEmptyText: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
  toPublicUser: mockToPublicUser
}));

import { POST } from '@/app/api/auth/register/route';
import { cookieNames } from '@/shared/http/cookie-names';
import { resetMockOtpChallengesForTests } from '@/features/auth/server/mock-otp-challenges';

const validDraft = {
  fullName: 'Marina Teste Silva',
  email: 'marina@hydrorivers.com',
  company: 'Cooperativa Teste',
  password: '12345678',
  role: 'carrier',
  countryCode: '+55',
  phone: '11999990000'
} as const;

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockOtpChallengesForTests();
    mockHashPassword.mockReturnValue('pbkdf2_sha256$100000$salt$hash');
    mockToPublicUser.mockImplementation((user: unknown) => user);
    process.env.HYDRORIVERS_EXPOSE_OTP_CODE = 'true';
  });

  it('retorna 400 para json inválido', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: '{'
      })
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-json'
    });
  });

  it('retorna 400 quando payload do cadastro não passa no schema', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'SóNome',
          email: 'invalid',
          password: 'short',
          role: 'shipper',
          countryCode: '',
          phone: '1'
        })
      })
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-register-fields'
    });
  });

  it('retorna 403 para role admin', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...validDraft, role: 'admin' })
      })
    );
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'invalid-role'
    });
  });

  it('retorna 409 para email já existente', async () => {
    mockReadMock.mockReturnValue([{ id: 'u-1', email: 'marina@hydrorivers.com' }]);

    const response = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validDraft)
      })
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: 'email-already-registered' });
  });

  it('retorna 409 para telefone já existente', async () => {
    mockReadMock.mockReturnValue([{ id: 'u-1', email: 'outro@hydrorivers.com', phoneE164: '+5511999990000' }]);

    const response = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validDraft)
      })
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: 'phone-already-registered' });
  });

  it('etapa 1 retorna desafio OTP e etapa 2 cria usuário após OTP correto', async () => {
    mockReadMock.mockReturnValue([]);

    const step1 = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validDraft)
      })
    );
    expect(step1.status).toBe(200);
    const body1 = await step1.json();
    expect(body1).toMatchObject({ otpRequired: true, phoneE164: '+5511999990000' });
    expect(typeof body1.challenge).toBe('string');
    expect(typeof body1.otpCode).toBe('string');

    const step2 = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          challenge: body1.challenge,
          otp: body1.otpCode
        })
      })
    );
    const body2 = await step2.json();

    expect(step2.status).toBe(201);
    expect(mockUpsertUser).toHaveBeenCalledTimes(1);
    expect(mockHashPassword).toHaveBeenCalledWith('12345678');
    expect(cookieStore.set).toHaveBeenCalledWith(
      cookieNames.session,
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    );
    expect(body2.user).toMatchObject({
      email: 'marina@hydrorivers.com',
      role: 'carrier',
      phoneE164: '+5511999990000'
    });
  });

  it('retorna 401 quando OTP está incorreto na conclusão', async () => {
    mockReadMock.mockReturnValue([]);

    const step1 = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validDraft)
      })
    );
    const body1 = await step1.json();

    const step2 = await POST(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          challenge: body1.challenge,
          otp: '000000'
        })
      })
    );
    expect(step2.status).toBe(401);
    expect(mockUpsertUser).not.toHaveBeenCalled();
  });
});
