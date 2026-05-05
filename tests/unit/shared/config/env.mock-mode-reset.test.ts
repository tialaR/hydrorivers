import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMockModeResetAllowed } from '@/shared/config/env';

describe('isMockModeResetAllowed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna true somente quando HYDRORIVERS_ALLOW_MOCK_MODE_RESET === "true"', () => {
    vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', 'true');
    expect(isMockModeResetAllowed()).toBe(true);
  });

  it('retorna false quando === "false"', () => {
    vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', 'false');
    expect(isMockModeResetAllowed()).toBe(false);
  });

  it('retorna false quando variável omitida (comportamento estrito)', () => {
    vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', '');
    expect(isMockModeResetAllowed()).toBe(false);
  });

  it('retorna false para "TRUE" (case-sensitive)', () => {
    vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', 'TRUE');
    expect(isMockModeResetAllowed()).toBe(false);
  });

  it('retorna false para valores não literais', () => {
    vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', '1');
    expect(isMockModeResetAllowed()).toBe(false);
  });
});
