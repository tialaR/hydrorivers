import { expect, test, type Page } from '@playwright/test';

async function readHtmlTheme(page: Page) {
  return page.evaluate(() => ({
    dataTheme: document.documentElement.dataset.theme ?? null,
    hasDarkClass: document.documentElement.classList.contains('dark'),
    colorScheme: document.documentElement.style.colorScheme || null
  }));
}

test('theme persists in cookie/localStorage and survives reload', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'hydrorivers.theme',
      value: 'dark',
      domain: 'localhost',
      path: '/'
    }
  ]);

  await page.goto('/en-US/dashboard');

  await expect
    .poll(async () => (await readHtmlTheme(page)).dataTheme)
    .toBe('dark');

  const darkInitial = await readHtmlTheme(page);
  expect(darkInitial.hasDarkClass).toBe(true);
  expect(darkInitial.colorScheme).toBe('dark');

  await page.getByRole('button', { name: /toggle theme/i }).click();

  await expect
    .poll(async () => (await readHtmlTheme(page)).dataTheme)
    .toBe('light');

  await page.reload();

  const lightAfterReload = await readHtmlTheme(page);
  expect(lightAfterReload.dataTheme).toBe('light');
  expect(lightAfterReload.hasDarkClass).toBe(false);
  expect(lightAfterReload.colorScheme).toBe('light');

  const cookie = (await context.cookies()).find((item) => item.name === 'hydrorivers.theme');
  expect(cookie?.value).toBe('light');

  const storedTheme = await page.evaluate(() => window.localStorage.getItem('hydrorivers.theme'));
  expect(storedTheme).toBe('light');
});
