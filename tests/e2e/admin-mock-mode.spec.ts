import { expect, test } from '@playwright/test';
import { loginWithOtp } from './support/auth';
import { applyMockScenario } from './support/mock-scenario';

const admin = { email: 'admin@hydrorivers.com', password: 'hydro123' } as const;

test.describe('Admin e mock-mode', () => {
  test('admin autenticado acessa o painel administrativo', async ({ page }) => {
    await loginWithOtp(page, admin);
    await page.goto('/pt-BR/admin');
    await expect(page).toHaveURL(/\/pt-BR\/admin/);
    await expect(page.getByTestId('admin-console')).toBeVisible();
  });

  test('usuário não admin não acessa o painel administrativo', async ({ page }) => {
    await loginWithOtp(page);
    await page.goto('/pt-BR/admin');
    await expect(page.getByTestId('admin-unauthorized')).toBeVisible();
  });

  test('embarcador não vê o controle de cenário mock no painel QA', async ({ page }) => {
    await loginWithOtp(page);
    await page.goto('/pt-BR/cargas');
    await page.getByTestId('mock-mode-toggle').click();
    await expect(page.getByTestId('mock-scenario-section')).toHaveCount(0);
  });

  test('admin aplica cenário empty-state: API confirma dataset vazio e o painel mostra o rótulo', async ({ page }) => {
    await loginWithOtp(page, admin);
    await page.goto('/pt-BR/dashboard');
    const response = await applyMockScenario(page, 'empty-state');
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { data?: { counts?: { cargoes?: number } } };
    expect(body.data?.counts?.cargoes).toBe(0);
    await expect(page.getByTestId('mock-scenario-active')).toContainText('Base vazia');
  });

  test('admin aplica in-transit e vê cargas em estado embarcado', async ({ page }) => {
    await loginWithOtp(page, admin);
    await page.goto('/pt-BR/dashboard');
    await applyMockScenario(page, 'in-transit');
    await expect(page.getByTestId('mock-scenario-active')).toContainText('Em trânsito');
    await page.goto('/pt-BR/cargas');
    await expect(page.getByTestId('cargo-card')).not.toHaveCount(0);
    await expect(page.getByText('Embarcada', { exact: true })).toBeVisible();
  });

  test('admin aplica completed e vê carga entregue', async ({ page }) => {
    await loginWithOtp(page, admin);
    await page.goto('/pt-BR/dashboard');
    await applyMockScenario(page, 'completed');
    await expect(page.getByTestId('mock-scenario-active')).toContainText('Concluído');
    await page.goto('/pt-BR/cargas');
    await expect(page.getByTestId('cargo-card')).not.toHaveCount(0);
    await expect(page.getByText('Entregue', { exact: true })).toBeVisible();
  });

  test('admin aplica error-scenarios e a UI destaca pendência documental (12% pronto)', async ({ page }) => {
    await loginWithOtp(page, admin);
    await page.goto('/pt-BR/dashboard');
    await applyMockScenario(page, 'error-scenarios');
    await expect(page.getByTestId('mock-scenario-active')).toContainText('Erros e pendências');
    await page.goto('/pt-BR/cargas');
    await expect(page.getByTestId('cargo-card')).not.toHaveCount(0);
    await expect(page.getByText('12% pronto').first()).toBeVisible();
  });
});
