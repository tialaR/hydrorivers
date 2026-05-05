import { afterEach, describe, expect, it } from 'vitest';
import { isMockQaUiEnabled } from '@/shared/qa/mock-qa-ui-env';

describe('mock-qa-ui-env', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('desliga UI QA em NODE_ENV production sem force', () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    delete process.env.HYDRORIVERS_FORCE_MOCK_QA_UI;
    expect(isMockQaUiEnabled()).toBe(false);
  });

  it('liga UI QA em ambientes não production', () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    delete process.env.HYDRORIVERS_FORCE_MOCK_QA_UI;
    expect(isMockQaUiEnabled()).toBe(true);
  });

  it('liga UI QA em production quando HYDRORIVERS_FORCE_MOCK_QA_UI=true', () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
    process.env.HYDRORIVERS_FORCE_MOCK_QA_UI = 'true';
    expect(isMockQaUiEnabled()).toBe(true);
  });
});
