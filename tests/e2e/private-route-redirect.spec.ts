import { expect, test } from '@playwright/test';
import type { AppLocale } from '@/shared/routing/route-types';
import { appRoutes } from '@/shared/routing/app-routes';

/**
 * Rotas com guarda em proxy.ts (prefixo de locale + path localizado).
 * Sem cookie hydrorivers_session → redirect para /{locale}/login?next={pathname}
 */
const L = 'pt-BR' as AppLocale;

const privateFullPaths = [
  appRoutes.dashboard.home(L),
  appRoutes.auth.profile(L),
  appRoutes.cargos.publishCargo(L),
  appRoutes.tracking.home(L)
];

for (const fullPath of privateFullPaths) {
  test(`sem sessão: ${fullPath} redireciona para login com next correto`, async ({ page }) => {
    await page.goto(fullPath);

    await expect(page).toHaveURL(/\/pt-BR\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get('next')).toBe(fullPath);
  });
}
