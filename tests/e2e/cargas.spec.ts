import { expect, test } from '@playwright/test';
import { loginWithOtp } from './support/auth';
import { resetMockScenarioThenLogin } from './support/cargo-context';
import { applyMockScenario } from './support/mock-scenario';

const shipper = { email: 'tiala@hydrorivers.com', password: 'hydro123' } as const;
const carrier = { email: 'joao@naveganorte.com', password: 'hydro123' } as const;
const pendingCarrier = { email: 'ana@rioslog.com', password: 'hydro123' } as const;
const adminUser = { email: 'admin@hydrorivers.com', password: 'hydro123' } as const;

/** Detalhe com `ownerId` implicitamente `u-shipper-1` em `market-active` (`withRelationships` + primeiro shipper no mock). */
const cargoDetailPath = '/pt-BR/cargas/cargo-001';

test.describe('Cargas (publicação via Server Action)', () => {
  test.beforeEach(async ({ page }) => {
    /** Largura ≤1024px: lista expõe a busca nativa (`.nativeSearch`); em desktop ela fica `display:none`). */
    await page.setViewportSize({ width: 1000, height: 800 });
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
  });

  test('embarcador publica carga e vê o item em /minhas-cargas após submit', async ({
    page
  }) => {
    const marker = `e2e-cargo-${Date.now()}`;
    await page.goto('/pt-BR/cargas/nova');

    await page.getByPlaceholder(/Belém, PA/).first().fill('Belém, PA');
    await page.getByPlaceholder(/Santarém, PA/).first().fill('Santarém, PA');
    await page.getByPlaceholder(/Açaí refrigerado/i).fill(marker);
    await page.getByPlaceholder(/18 t/).fill('12 t');
    await page.getByPlaceholder(/08-12 maio/).fill('agosto');
    await page.getByPlaceholder(/R\$ 8\.400/).fill('R$ 9.000');
    await page.getByPlaceholder(/Carga refrigerada/i).fill('Descrição E2E publicação');

    await page.getByTestId('new-cargo-submit').click();

    await expect(page).toHaveURL(/\/pt-BR\/minhas-cargas\?created=mock-/);
    await expect(page.getByTestId('minhas-cargas-created-banner')).toBeVisible();
    await expect(page.getByTestId('minhas-cargas-grid')).toBeVisible();
    await expect(page.getByTestId('cargo-card').filter({ hasText: marker })).toHaveCount(1);
  });

  test('transportador vê erro i18n ao tentar publicar carga', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', carrier);
    await page.goto('/pt-BR/cargas/nova');

    await page.getByPlaceholder(/Belém, PA/).first().fill('Manaus, AM');
    await page.getByPlaceholder(/Santarém, PA/).first().fill('Belém, PA');
    await page.getByPlaceholder(/Açaí refrigerado/i).fill('Carga carrier bloqueada');
    await page.getByPlaceholder(/18 t/).fill('5 t');
    await page.getByPlaceholder(/08-12 maio/).fill('setembro');
    await page.getByPlaceholder(/R\$ 8\.400/).fill('R$ 1');
    await page.getByPlaceholder(/Carga refrigerada/i).fill('Teste bloqueio carrier');

    await page.getByTestId('new-cargo-submit').click();

    await expect(page.getByTestId('new-cargo-form-error')).toBeVisible();
    await expect(page.getByTestId('new-cargo-form-error')).toContainText(/transportador/i);
  });

  test('validação client-side mostra mensagem i18n com campos vazios', async ({ page }) => {
    await page.goto('/pt-BR/cargas/nova');
    await page.getByTestId('new-cargo-submit').click();
    await expect(page.getByTestId('new-cargo-form-error')).toContainText(/Preencha todos os campos obrigatórios/i);
  });

  test('lista mostra empty state i18n quando busca não retorna resultados', async ({ page }) => {
    await page.goto('/pt-BR/cargas');
    await page.getByTestId('cargo-list-search').fill('__no_hydrorivers_match_zz__');
    await expect(page.getByTestId('cargo-list-empty')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nenhuma carga encontrada' })).toBeVisible();
  });
});

test.describe('Detalhe da carga — visibilidade da proposta por perfil', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
  });

  test('embarcador dono: mensagem de publicação própria, sem formulário de proposta', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
    await page.goto(cargoDetailPath);
    await expect(page.getByTestId('cargo-owner-awaiting-card')).toBeVisible();
    await expect(page.getByTestId('cargo-owner-awaiting-card')).toContainText(/publicada por você|Aguarde propostas/i);
    await expect(page.getByTestId('cargo-proposal-form')).toHaveCount(0);
  });

  test('transportador aprovado em carga de terceiro: vê formulário de proposta', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', carrier);
    await page.goto(cargoDetailPath);
    await expect(page.getByTestId('cargo-proposal-form')).toBeVisible();
    await expect(page.getByTestId('cargo-proposal-form')).toContainText(/Enviar proposta|Simular proposta/i);
  });

  test('transportador não aprovado: mensagem de moderação, sem formulário', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', pendingCarrier);
    await page.goto(cargoDetailPath);
    await expect(page.getByTestId('cargo-proposal-carrier-pending-card')).toBeVisible();
    await expect(page.getByTestId('cargo-proposal-carrier-pending-card')).toContainText(/aprovação|moderação|transportador/i);
    await expect(page.getByTestId('cargo-proposal-form')).toHaveCount(0);
  });

  test('admin: mensagem administrativa, sem formulário de proposta', async ({ page }) => {
    await loginWithOtp(page, adminUser);
    await page.goto('/pt-BR/dashboard');
    await applyMockScenario(page, 'market-active');
    await page.goto(cargoDetailPath);
    await expect(page.getByTestId('cargo-proposal-admin-card')).toBeVisible();
    await expect(page.getByTestId('cargo-proposal-admin-card')).toContainText(/administrativ|auditar|marketplace/i);
    await expect(page.getByTestId('cargo-proposal-form')).toHaveCount(0);
  });
});

test('cenário empty-state grava zero cargas no dataset (API mock-mode)', async ({ page }) => {
  await loginWithOtp(page, { email: 'admin@hydrorivers.com', password: 'hydro123' });
  await page.goto('/pt-BR/dashboard');
  const response = await applyMockScenario(page, 'empty-state');
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { data?: { counts?: { cargoes?: number } } };
  expect(body.data?.counts?.cargoes).toBe(0);
});
