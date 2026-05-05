import type { Page } from '@playwright/test';
import { loginWithOtp, type OtpCredentials } from './auth';
import { applyMockScenario } from './mock-scenario';

const admin: OtpCredentials = { email: 'admin@hydrorivers.com', password: 'hydro123' };

/** Encerra sessão via rota dedicada (padrão estável: listener + navegação em paralelo). */
export async function logoutViaRoute(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/logout') && response.request().method() === 'POST'),
    page.goto('/pt-BR/logout')
  ]);
  await page.waitForURL(/\/pt-BR\/?$/);
}

/**
 * Define cenário estável no mock, encerra sessão admin e faz login com outra conta.
 * Garante dataset previsível entre testes E2E sem depender do estado do disco.
 */
export async function resetMockScenarioThenLogin(page: Page, scenarioId: string, nextUser: OtpCredentials) {
  await loginWithOtp(page, admin);
  await page.goto('/pt-BR/dashboard');
  await applyMockScenario(page, scenarioId);
  await logoutViaRoute(page);
  await loginWithOtp(page, nextUser);
}
