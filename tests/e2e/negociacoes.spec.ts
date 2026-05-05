import { expect, test } from '@playwright/test';
import { loginWithOtp } from './support/auth';
import { logoutViaRoute, resetMockScenarioThenLogin } from './support/cargo-context';

const shipper = { email: 'tiala@hydrorivers.com', password: 'hydro123' } as const;
const carrier = { email: 'joao@naveganorte.com', password: 'hydro123' } as const;
const otherShipper = { email: 'mariana@bioamazonia.coop', password: 'hydro123' } as const;
const admin = { email: 'admin@hydrorivers.com', password: 'hydro123' } as const;

test.describe('Negociações — UI (somente leitura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
  });

  test('embarcador acessa lista e detalhe com estágio visível', async ({ page }) => {
    await page.goto('/pt-BR/negociacoes');
    await expect(page.getByTestId('negotiation-card').first()).toBeVisible();
    await page.getByTestId('negotiation-card').first().click();
    await expect(page).toHaveURL(/\/pt-BR\/negociacoes\/neg-/);
    await expect(page.getByTestId('negotiation-stage-label')).toBeVisible();
  });
});

test.describe('Negociações — UI transportador', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await resetMockScenarioThenLogin(page, 'market-active', carrier);
  });

  test('transportador acessa lista e detalhe', async ({ page }) => {
    await page.goto('/pt-BR/negociacoes');
    await expect(page.getByTestId('negotiation-card').first()).toBeVisible();
    await page.getByTestId('negotiation-card').first().click();
    await expect(page).toHaveURL(/\/pt-BR\/negociacoes\/neg-/);
    await expect(page.getByTestId('negotiation-stage-label')).toBeVisible();
  });
});

/**
 * A UI ainda não envia POST/PATCH (detalhe sem ações). Estes testes usam a mesma sessão do navegador
 * (`page.request`) para exercitar a stack com cookie real — complementa `tests/integration/api/negociacoes.*`.
 */
test.describe('Negociações — API com sessão (cookie)', () => {
  test('embarcador não pode criar negociação via POST', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
    const response = await page.request.post('/api/negociacoes', {
      data: { cargoId: 'cargo-001', vesselId: 'vessel-001', amount: 'R$ 1,00' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toMatchObject({ error: 'forbidden', reason: 'role-not-allowed' });
  });

  test('participante não envolvido recebe 403 no PATCH', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', otherShipper);
    const response = await page.request.patch('/api/negociacoes', {
      data: { id: 'neg-001', status: 'rejected' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.status()).toBe(403);
  });

  test('admin não pode criar negociação via POST', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', admin);
    const response = await page.request.post('/api/negociacoes', {
      data: { cargoId: 'cargo-001', vesselId: 'vessel-001', amount: 'R$ 99 e2e admin' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'forbidden', reason: 'role-not-allowed' });
  });

  test('carrier cria proposta; shipper aceita e o detalhe mostra estágio Contrato', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', carrier);

    const create = await page.request.post('/api/negociacoes', {
      data: { cargoId: 'cargo-001', vesselId: 'vessel-001', amount: 'R$ 7.500 e2e' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(create.status()).toBe(201);
    const created = (await create.json()) as { data?: { id?: string } };
    const negId = created.data?.id;
    expect(negId).toBeTruthy();

    await logoutViaRoute(page);
    await loginWithOtp(page, shipper);

    await page.goto(`/pt-BR/negociacoes/${negId}`);
    await expect(page.getByTestId('negotiation-stage-label')).toContainText('Cotação');

    const patch = await page.request.patch('/api/negociacoes', {
      data: { id: negId, status: 'accepted' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(patch.status()).toBe(200);

    await page.goto(`/pt-BR/negociacoes/${negId}`);
    await expect(page.getByTestId('negotiation-stage-label')).toContainText('Contrato');
  });
});
