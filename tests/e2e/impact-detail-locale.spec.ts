import { expect, test } from '@playwright/test';

test('from /en-US/impacto, card link opens detail under en-US', async ({ page, context }) => {
  await page.goto('/en-US/impacto');

  await page.getByRole('link', { name: /View details:.*Optimized routes/i }).click();

  await expect(page).toHaveURL(/\/en-US\/impacto\/regional$/);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.lang))
    .toBe('en-US');

  const localeCookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('en-US');
});

test('from /es/impacto, card link opens detail under es', async ({ page, context }) => {
  await page.goto('/es/impacto');

  await page.getByRole('link', { name: /Ver detalles:.*Amazonía conectada/i }).click();

  await expect(page).toHaveURL(/\/es\/impacto\/regional$/);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.lang))
    .toBe('es');

  const localeCookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('es');
});
