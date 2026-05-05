import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieStore } = vi.hoisted(() => ({
  cookieStore: {
    delete: vi.fn()
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore)
}));

import { POST } from '@/app/api/auth/logout/route';
import { cookieNames } from '@/shared/http/cookie-names';

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 e remove cookie de sessão', async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(cookieStore.delete).toHaveBeenCalledWith(cookieNames.session);
    expect(body).toEqual({ ok: true });
  });
});
