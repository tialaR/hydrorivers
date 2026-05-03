import { expect, test } from '@playwright/test';
import { loginWithOtp } from './support/auth';

test('login OTP em modo demo leva ao dashboard', async ({ page }) => {
  await loginWithOtp(page);
  await expect(page).toHaveURL(/\/pt-BR\/dashboard/);
});
