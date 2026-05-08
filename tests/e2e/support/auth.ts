import { expect, type Page } from '@playwright/test';

const submitButtonName = /entrar|login|sign in|acceder|continuar|confirmar|otp/i;

const defaultShipper = {
  email: 'tiala@hydrorivers.com',
  password: 'hydro123'
} as const;

export type OtpCredentials = {
  email: string;
  password: string;
};

export async function loginWithOtp(page: Page, credentials: OtpCredentials = defaultShipper) {
  await page.goto('/pt-BR/login');

  const emailInput = page.getByLabel(/e-?mail|email|correo|telefone|teléfono|phone/i);
  const passwordInput = page.getByLabel(/senha|password/i);
  const submitButton = page.getByRole('button', { name: submitButtonName }).first();

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);

  const [firstLoginResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    ),
    submitButton.click()
  ]);

  const firstLoginBody = await firstLoginResponse.json();
  expect(firstLoginBody.otpRequired).toBe(true);
  expect(typeof firstLoginBody.otpCode).toBe('string');
  expect(typeof firstLoginBody.challenge).toBe('string');

  const otpInput = page.getByLabel(/otp|c[oó]digo/i);
  await expect(otpInput).toBeVisible();
  await otpInput.fill(firstLoginBody.otpCode);

  const otpSubmitButton = page.getByRole('button', { name: submitButtonName }).first();
  await expect(otpSubmitButton).toBeEnabled();

  const [secondLoginResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    ),
    otpSubmitButton.click()
  ]);

  expect(secondLoginResponse.status()).toBe(200);
}
