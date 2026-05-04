import { expect, test } from '@playwright/test';

/**
 * Rotas com guarda em middleware.ts (prefixo de locale + path localizado).
 * Sem cookie hydrorivers_session → redirect para /{locale}/login?next={pathname}
 */
const privateFullPaths = ['/pt-BR/dashboard', '/pt-BR/perfil', '/pt-BR/cargas/nova', '/pt-BR/rastreio'];

for (const fullPath of privateFullPaths) {
  test(`sem sessão: ${fullPath} redireciona para login com next correto`, async ({ page }) => {
    await page.goto(fullPath);

    await expect(page).toHaveURL(/\/pt-BR\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get('next')).toBe(fullPath);
  });
}
