import { expect, test } from '@playwright/test';

test('rota privada sem sessão redireciona para login', async ({ page }) => {
  await page.goto('/pt-BR/dashboard');

  await expect(page).toHaveURL(/\/pt-BR\/login/);
  await expect(page).toHaveURL(/next=%2Fpt-BR%2Fdashboard/);
});
