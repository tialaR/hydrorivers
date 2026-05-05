import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('use-case-logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('não loga em production quando HYDRORIVERS_USE_CASE_LOGS não é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    delete process.env.HYDRORIVERS_USE_CASE_LOGS;

    const { logUseCaseEvent } = await import('@/shared/observability/use-case-logger');
    logUseCaseEvent({
      useCase: 'MOCK_MODE_RESET',
      step: 'route',
      status: 'started'
    });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('não loga em development/test quando HYDRORIVERS_USE_CASE_LOGS não é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    delete process.env.HYDRORIVERS_USE_CASE_LOGS;

    const { logUseCaseEvent } = await import('@/shared/observability/use-case-logger');
    logUseCaseEvent({
      useCase: 'MOCK_MODE_RESET',
      step: 'route',
      status: 'started'
    });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('loga em production quando HYDRORIVERS_USE_CASE_LOGS é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    process.env.HYDRORIVERS_USE_CASE_LOGS = 'true';

    const { logUseCaseEvent } = await import('@/shared/observability/use-case-logger');
    logUseCaseEvent({
      useCase: 'MOCK_MODE_RESET',
      step: 'route',
      status: 'success',
      actor: { userId: 'u-1', role: 'admin' }
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    const out = String(vi.mocked(console.log).mock.calls[0][0]);
    expect(out).toContain('HydroRivers Use Case');
    expect(out).toContain('MOCK_MODE_RESET');
    expect(out).toContain('success');
    expect(out).toContain('u-1');
  });

  it('mascara ou omite chaves sensíveis no context', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    process.env.HYDRORIVERS_USE_CASE_LOGS = 'true';

    const { logUseCaseEvent, sanitizeUseCaseLogValue } = await import('@/shared/observability/use-case-logger');

    const sanitized = sanitizeUseCaseLogValue({
      cargoId: 'c-1',
      password: 'secret123',
      Authorization: 'Bearer x',
      nested: { refreshToken: 'rt', safe: 'ok' },
      payload: { huge: 'x'.repeat(200) }
    }) as Record<string, unknown>;

    expect(sanitized.password).toBe('[redacted]');
    expect(sanitized.Authorization).toBe('[redacted]');
    expect((sanitized.nested as Record<string, unknown>).refreshToken).toBe('[redacted]');
    expect((sanitized.nested as Record<string, unknown>).safe).toBe('ok');
    expect(sanitized.payload).toBe('[omitted]');
    expect(JSON.stringify(sanitized)).not.toContain('secret123');
    expect(JSON.stringify(sanitized)).not.toContain('Bearer');

    vi.mocked(console.log).mockClear();
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'post',
      status: 'failed',
      context: {
        password: 'nope',
        payload: { a: 1 }
      }
    });
    const printed = String(vi.mocked(console.log).mock.calls[0][0]);
    expect(printed).not.toContain('nope');
    expect(printed).toContain('[redacted]');
    expect(printed).toContain('[omitted]');
  });

  it('aceita eventos válidos (useCase + status) quando HYDRORIVERS_USE_CASE_LOGS é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
    process.env.HYDRORIVERS_USE_CASE_LOGS = 'true';

    const { logUseCaseEvent, USE_CASE_IDS, USE_CASE_STATUSES } = await import('@/shared/observability/use-case-logger');

    for (const useCase of USE_CASE_IDS) {
      for (const status of USE_CASE_STATUSES) {
        vi.mocked(console.log).mockClear();
        logUseCaseEvent({ useCase, step: 's', status });
        expect(console.log).toHaveBeenCalledTimes(1);
      }
    }
  });

  it('ignora combinação inválida sem lançar (useCase desconhecido)', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';

    const { logUseCaseEvent } = await import('@/shared/observability/use-case-logger');
    logUseCaseEvent({
      // @ts-expect-error exercício de guarda em runtime
      useCase: 'UNKNOWN_CASE',
      step: 'x',
      status: 'started'
    });
    expect(console.log).not.toHaveBeenCalled();
  });
});
