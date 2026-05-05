import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('dev-scenario-reporter', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('não imprime em production quando HYDRORIVERS_DEV_SCENARIO_LOGS não é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    delete process.env.HYDRORIVERS_DEV_SCENARIO_LOGS;

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({
      title: 'T',
      status: 'success',
      resource: 'login'
    });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('imprime em production quando HYDRORIVERS_DEV_SCENARIO_LOGS é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    process.env.HYDRORIVERS_DEV_SCENARIO_LOGS = 'true';

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({
      title: 'T',
      status: 'failed',
      resource: 'login'
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    const out = String(vi.mocked(console.log).mock.calls[0][0]);
    expect(out).toContain('Dev Scenario Reporter');
    expect(out).toContain('T');
    expect(out).toContain('failed');
  });

  it('não imprime em development quando HYDRORIVERS_DEV_SCENARIO_LOGS não é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    delete process.env.HYDRORIVERS_DEV_SCENARIO_LOGS;

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({ title: 'X', status: 'success', resource: 'login' });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('não imprime quando HYDRORIVERS_DEV_SCENARIO_LOGS=false', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    process.env.HYDRORIVERS_DEV_SCENARIO_LOGS = 'false';

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({ title: 'X', status: 'success', resource: 'login' });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('seção verbose só aparece com HYDRORIVERS_DEV_SCENARIO_VERBOSE=true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    process.env.HYDRORIVERS_DEV_SCENARIO_LOGS = 'true';
    process.env.HYDRORIVERS_DEV_SCENARIO_VERBOSE = 'true';

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({
      title: 'V',
      status: 'success',
      resource: 'login',
      verboseHints: { email: 'qa@test.com', authorization: 'Bearer leak' }
    });

    const out = String(vi.mocked(console.log).mock.calls[0][0]);
    expect(out).toContain('Mock hints (verbose)');
    expect(out).toContain('qa@test.com');
    expect(out).not.toContain('Bearer');
    expect(out).toContain('[redacted]');
  });

  it('verbose omitido quando HYDRORIVERS_DEV_SCENARIO_VERBOSE não é true', async () => {
    vi.resetModules();
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    process.env.HYDRORIVERS_DEV_SCENARIO_LOGS = 'true';
    delete process.env.HYDRORIVERS_DEV_SCENARIO_VERBOSE;

    const { reportDevScenario } = await import('@/shared/observability/dev-scenario-reporter');
    reportDevScenario({
      title: 'V',
      status: 'success',
      verboseHints: { email: 'hidden@test.com' }
    });

    const out = String(vi.mocked(console.log).mock.calls[0][0]);
    expect(out).not.toContain('hidden@test.com');
    expect(out).not.toContain('Mock hints');
  });
});
