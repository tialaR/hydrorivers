import { expect, test } from '@playwright/test';

test.describe('Mock QA Hub', () => {
  test('login direto pelo hub navega para cargas (Tiala)', async ({ page }) => {
    await page.goto('/pt-BR/login');
    await page.getByTestId('mock-mode-toggle').click();
    await expect(page.getByTestId('qa-hub-direct-tiala')).toBeVisible();
    await expect(page.getByTestId('qa-hub-fill-login-tiala')).toBeVisible();

    await page.getByTestId('qa-hub-direct-tiala').click();

    await expect(page.getByTestId('qa-hub-feedback-success')).toContainText(/Tiala/i);

    await page.waitForURL(/\/pt-BR\/cargas/, { timeout: 10_000 });
  });

  test('Usar no login preenche credenciais sem POST automático', async ({ page }) => {
    await page.goto('/pt-BR/login');

    await page.getByTestId('mock-mode-toggle').click();
    await page.getByTestId('qa-hub-fill-login-admin').click();

    await page.waitForURL(/\/pt-BR\/login/);

    const email = page.locator('input[type="email"]');
    await expect(email).toHaveValue('admin@hydrorivers.com');

    const password = page.locator('input[type="password"]');
    await expect(password).toHaveValue('hydro123');
  });
});
