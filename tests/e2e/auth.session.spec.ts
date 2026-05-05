import { expect, test } from '@playwright/test';
import { loginWithOtp } from './support/auth';

test('após login OTP usuário acessa rota privada /perfil', async ({ page }) => {
  await loginWithOtp(page);
  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);

  await page.goto('/pt-BR/perfil');
  await expect(page).toHaveURL(/\/pt-BR\/perfil/);

  await expect(page.getByRole('textbox', { name: /e-?mail|email/i })).toHaveValue('tiala@hydrorivers.com');
});

test('logout pela rota /logout encerra sessão e rota privada volta a exigir login', async ({ page }) => {
  await loginWithOtp(page);
  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);

  await page.goto('/pt-BR/logout');
  await page.waitForResponse(
    (response) => response.url().includes('/api/auth/logout') && response.request().method() === 'POST'
  );
  await page.waitForURL(/\/pt-BR(\/)?$/);

  await page.goto('/pt-BR/dashboard');
  await expect(page).toHaveURL(/\/pt-BR\/login/);
});

/**
 * Troca de locale com sessão — complementa locale.switch.spec.ts (que usa home pública).
 * Viewport desktop: header mostra AuthActions com botão Sair / Log out (sheet mobile omite logout direto).
 */
test('com sessão ativa troca idioma no dashboard e permanece autenticado', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  await loginWithOtp(page);
  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);

  const localeTrigger = page.getByRole('button', { name: /idioma|language/i }).first();
  await expect(localeTrigger).toBeVisible();
  await localeTrigger.click();

  const englishMenuItem = page.getByRole('menuitem', { name: /en-US|english|en\b/i }).first();
  if (await englishMenuItem.count()) {
    await englishMenuItem.click();
  } else {
    await page.getByRole('link', { name: /en-US|english|en\b/i }).first().click();
  }

  await expect(page).toHaveURL(/\/en\/dashboard(\/)?$/);
  await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();
});
