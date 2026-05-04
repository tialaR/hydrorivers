import { expect, type Page } from '@playwright/test';

export async function openMockPanel(page: Page) {
  await page.getByTestId('mock-mode-toggle').click();
  await expect(page.getByTestId('mock-scenario-section')).toBeVisible();
}

/** Admin-only: aplica cenário mock via painel QA (requer sessão admin). */
export async function applyMockScenario(page: Page, scenarioId: string) {
  await openMockPanel(page);
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/mock-mode') && response.request().method() === 'POST'
  );
  await page.getByTestId('mock-scenario-select').selectOption(scenarioId);
  const [response] = await Promise.all([responsePromise, page.getByTestId('mock-scenario-apply').click()]);
  return response;
}
