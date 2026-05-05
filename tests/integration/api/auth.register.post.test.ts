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

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHashPassword.mockReturnValue('pbkdf2_sha256$100000$salt$hash');
    mockToPublicUser.mockImplementation((user: unknown) => user);
  });

  it('retorna 400 para json inválido', async () => {
    const response = await POST(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: '{'
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'invalid-json'
    });
  });

  it('retorna 400 quando faltam campos obrigatórios', async () => {
    const response = await POST(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'x@x.com', company: '', password: '123' })
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid-payload',
      reason: 'missing-required-fields'
    });
  });

  it('retorna 403 para role inválida', async () => {
    const response = await POST(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Usuário',
        email: 'novo@hydrorivers.com',
        company: 'Empresa',
        password: '123456',
        role: 'admin'
      })
    }));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'forbidden',
      reason: 'invalid-role'
    });
  });

  it('retorna 409 para email já existente', async () => {
    mockReadMock.mockReturnValue([{ id: 'u-1', email: 'novo@hydrorivers.com' }]);

    const response = await POST(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Usuário',
        email: 'novo@hydrorivers.com',
        company: 'Empresa',
        password: '123456',
        role: 'shipper'
      })
    }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: 'email-already-registered' });
  });

  it('retorna 201 e grava cookie no sucesso', async () => {
    mockReadMock.mockReturnValue([]);
    mockToPublicUser.mockImplementation((user: any) => ({ id: user.id, email: user.email, role: user.role }));

    const response = await POST(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Marina Teste',
        email: 'marina@hydrorivers.com',
        company: 'Cooperativa Teste',
        password: '123456',
        role: 'carrier'
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockUpsertUser).toHaveBeenCalledTimes(1);
    expect(mockHashPassword).toHaveBeenCalledWith('123456');
    expect(cookieStore.set).toHaveBeenCalledWith(
      cookieNames.session,
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    );
    expect(body.user).toMatchObject({
      email: 'marina@hydrorivers.com',
      role: 'carrier'
    });
  });
});
