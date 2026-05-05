import { expect, test } from '@playwright/test';

test('troca de idioma atualiza rota para inglês', async ({ page }) => {
  await page.goto('/pt-BR');
  await expect(page).toHaveURL(/\/pt-BR(\/)?$/);

  const localeTrigger = page.getByRole('button', { name: /idioma|language/i }).first();
  await expect(localeTrigger).toBeVisible();
  await localeTrigger.click();
  await page.getByRole('menuitem', { name: /en-US/i }).click();

  await expect(page).toHaveURL(/\/en(\/)?$/);
});
