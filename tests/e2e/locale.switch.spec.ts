import { expect, test } from '@playwright/test';

test('troca de idioma atualiza rota para inglês', async ({ page }) => {
  await page.goto('/pt-BR');
  await expect(page).toHaveURL(/\/pt-BR(\/)?$/);

  const localeSelect = page.getByRole('combobox', { name: /idioma|language/i }).first();
  await expect(localeSelect).toBeVisible();
  await localeSelect.selectOption('en');

  await expect(page).toHaveURL(/\/en(\/)?$/);
});
