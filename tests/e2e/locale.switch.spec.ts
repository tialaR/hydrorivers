import { expect, test } from '@playwright/test';

test('troca de idioma atualiza rota para inglês', async ({ page }) => {
  await page.goto('/pt-BR');
  await expect(page).toHaveURL(/\/pt-BR(\/)?$/);

  const localeTrigger = page.getByRole('button', { name: /idioma|language/i }).first();
  await expect(localeTrigger).toBeVisible();
  await localeTrigger.click();
  await page.getByRole('menuitem', { name: /en-US/i }).click();

  await expect(page).toHaveURL(/\/en-US(\/)?$/);
});

test('header More preserva locale en-US ao navegar para Impact', async ({ page }) => {
  await page.goto('/en-US/dashboard');

  await page.getByRole('button', { name: /more/i }).click();
  await page.getByRole('menuitem', { name: /impact/i }).click();

  await expect(page).toHaveURL(/\/en-US\/impacto$/);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.lang))
    .toBe('en-US');

  const localeCookie = (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('en-US');
});

test('header More preserva locale es ao navegar para Negociaciones', async ({ page }) => {
  await page.goto('/es/dashboard');

  await page.getByRole('button', { name: /más|more/i }).click();
  await page.getByRole('menuitem', { name: /negociaciones|negotiations/i }).click();

  await expect(page).toHaveURL(/\/es\/negociacoes$/);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.lang))
    .toBe('es');

  const localeCookie = (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('es');
});
