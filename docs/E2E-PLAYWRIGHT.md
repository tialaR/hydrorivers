


## Configuração atual (Playwright)

| Item | Valor |
|------|--------|
| Arquivo | [`playwright.config.ts`](../playwright.config.ts) |
| `testDir` | `./tests/e2e` |
| `baseURL` | `http://127.0.0.1:3100` |
| Projeto | Chromium (Desktop Chrome) |
| Paralelismo | `workers: 1`, `fullyParallel: false` (ordem determinística) |
| `webServer` | `HYDRORIVERS_EXPOSE_OTP_CODE=true npm run build` + `npm run start` na porta **3100** (OTP exposto só para o fluxo de login E2E — ver [`docs/ENVIRONMENT.md`](ENVIRONMENT.md)) |

**Pré-requisito local:** navegadores Playwright instalados (`npx playwright install` ou `npx playwright install chromium`). Sem isso, `npm run test:e2e` falha com “Executable doesn't exist”. O primeiro run também compila a app (`next build`), portanto costuma levar **vários minutos**.

---

## Inventário de testes E2E (`tests/e2e`)

| Arquivo | O que cobre |
|---------|-------------|
| [`cargas.spec.ts`](../tests/e2e/cargas.spec.ts) | Cargas (mock): shipper publica em `/cargas/nova`, `ownerId` na resposta API, bloqueio de carrier (403 + mensagem i18n), validação de formulário i18n, empty state na lista (busca sem resultados), e cenário `empty-state` com contagem 0 no `POST /api/mock-mode`. Viewport ≤1024px para campo de busca visível. |
| [`admin-mock-mode.spec.ts`](../tests/e2e/admin-mock-mode.spec.ts) | Admin: acesso a `/admin`, bloqueio para não admin, controle de cenário mock no painel QA (apenas admin), troca de dataset via `POST /api/mock-mode` e reflexo na lista de cargas (`empty-state`, `in-transit`, `completed`, `error-scenarios`). |
| [`auth.login.spec.ts`](../tests/e2e/auth.login.spec.ts) | Login demo com OTP (resposta contém `otpCode` quando `HYDRORIVERS_EXPOSE_OTP_CODE=true`) → redireciona ao dashboard. |
| [`auth.session.spec.ts`](../tests/e2e/auth.session.spec.ts) | Após login: acesso a **`/perfil`**; **logout** via página `/{locale}/logout`; troca de idioma **com sessão** no dashboard (viewport desktop), botão “Log out” visível. |
| [`private-route-redirect.spec.ts`](../tests/e2e/private-route-redirect.spec.ts) | Sem cookie de sessão: URLs privadas redirecionam para `/pt-BR/login` com query `next` igual ao pathname solicitado. |
| [`locale.switch.spec.ts`](../tests/e2e/locale.switch.spec.ts) | Home pública: troca `pt-BR` → `en` via combobox de idioma. |
| [`support/auth.ts`](../tests/e2e/support/auth.ts) | Helper `loginWithOtp(page, credentials?)` reutilizável (padrão: embarcador demo; passe `{ email, password }` para admin ou outras contas OTP). |
| [`support/mock-scenario.ts`](../tests/e2e/support/mock-scenario.ts) | `openMockPanel` / `applyMockScenario` — painel QA admin para `POST /api/mock-mode`. |
| [`support/cargo-context.ts`](../tests/e2e/support/cargo-context.ts) | `resetMockScenarioThenLogin` — aplica cenário como admin, logout estável e login com outra conta (dataset E2E). |

---

## Rotas relevantes (middleware)

Fonte: [`middleware.ts`](../middleware.ts) — rotas **privadas** (exigem cookie `hydrorivers_session`; senão redirect para `/{locale}/login?next=…`):

| Path localizado (após locale) | Exemplo completo |
|------------------------------|------------------|
| `/dashboard` | `/pt-BR/dashboard` |
| `/cargas/nova` e prefixo | `/pt-BR/cargas/nova` |
| `/perfil` | `/pt-BR/perfil` |
| `/negociacoes` e prefixo | `/pt-BR/negociacoes`, `/pt-BR/negociacoes/[id]` |
| `/rastreio` | `/pt-BR/rastreio` |
| `/admin` e prefixo | `/pt-BR/admin` |

Demais rotas sob `/(pt-BR|en|es)/…` que **não** correspondem à lista acima comportam-se como **públicas** para o middleware (ex.: `/login`, `/logout`, `/cadastro`, `/cargas`, `/`, `/governo`). A matriz de segurança das **APIs** (`GET` abertos, etc.) permanece em [`docs/API-SECURITY-AUDIT.md`](API-SECURITY-AUDIT.md) — não confundir com guard de UI.

---

## Menor cobertura segura adicionada (auth + protegidas)

Escopo intencionalmente pequeno:

1. **Redirects:** vários paths privados com assert do parâmetro **`next`** (via `URLSearchParams`), sem depender de encoding manual na string.  
2. **Sessão:** um segundo passo pós-login navegando a **`/perfil`** e validando o email do usuário demo no formulário — confirma que o middleware **não** bloqueia quando há sessão.  
3. **Logout estável sem depender do header mobile:** fluxo via **`/pt-BR/logout`**, que chama `POST /api/auth/logout` no `useEffect`; em seguida navegação ao dashboard deve voltar ao login. Evita o layout mobile (≤860px), onde `AuthActions`/botão “Sair” pode não aparecer na barra superior (sheet não expõe logout da mesma forma).

---

## Limitações e riscos do ambiente E2E

| Limitação | Mitigação |
|-----------|-----------|
| Browsers não instalados no ambiente | Rodar `npx playwright install` antes de `npm run test:e2e`; em CI, usar step `npx playwright install --with-deps` (vide [`docs/CI-QUALITY-GATES.md`](CI-QUALITY-GATES.md)). |
| Tempo de build (`next build`) antes dos testes | Esperado; timeout longo no `webServer` (240s). |
| OTP só em modo demo | Produção **não** deve usar `HYDRORIVERS_EXPOSE_OTP_CODE=true`; E2E depende disso no comando do `webServer`. |
| Troca de idioma autenticada | Teste força **viewport 1280×720** para garantir header desktop com botão “Log out” em inglês após `selectOption('en')`. |
| Logout via UI do header | Não coberto no mobile estreito por limitação de layout descrita acima; usar rota `/logout` é o caminho estável. |

---

## Quando criar ou atualizar um teste E2E?

Crie ou atualize testes E2E sempre que houver mudanças em **fluxos reais de usuário** — ou seja, caminhos completos que alguém percorre na aplicação.

Exemplos típicos:

- login / logout
- acesso a rotas privadas
- onboarding
- dashboard
- negociação / cotação
- troca de idioma
- permissões por papel (admin, shipper, carrier)
- qualquer fluxo crítico do negócio

👉 Regra prática:
Se a mudança impacta **o que o usuário faz ou vê na tela**, provavelmente precisa de E2E.

👉 Evite usar E2E para:
- regras muito pequenas
- validações internas
- lógica isolada de backend

Nesses casos, prefira:
- testes unitários (lógica isolada)
- testes de integração (API + regras de autorização)

---

## Relação com testes de integração

Os testes de integração garantem que o **backend está seguro e correto**.

Exemplo atual do projeto:

- `POST /api/mock-mode`
- `PATCH /api/negociacoes`

Esses testes validam respostas como:

- `401` → sem sessão
- `403` → sem permissão
- `200` → usuário autorizado

👉 Importante:

Os testes E2E **não substituem** os testes de integração.

- Integração → garante a regra
- E2E → garante que a UI respeita essa regra

Exemplo:
- Integração valida que um usuário não autorizado recebe `403`
- E2E valida que a UI **não deixa esse usuário executar a ação**

---

## Rotas que merecem cobertura E2E (futuro)

### 🔐 Autenticação

**Rotas:**
- `/login`
- `/logout`
- rotas privadas como `/dashboard`, `/perfil`, etc.

**Cobrir (parcialmente feito — ver “Inventário” acima):**
- login válido (OTP em modo demo) ✓
- tentativa de acesso sem sessão ✓
- redirect para login com `next` ✓
- redirect pós-login (dashboard após OTP) ✓
- logout e bloqueio após sair ✓ (via `/logout`)
- troca de idioma com sessão ✓ (dashboard, desktop)

---

### 🧪 Mock mode / Admin

**API:**
- `/api/mock-mode`

**Cobertura E2E (via UI, se existir):**
- admin consegue alterar cenário mock
- usuário comum não vê ou não consegue executar essa ação

👉 Observação:
A regra de autorização já deve estar garantida por testes de integração.

---

### 🤝 Negociações

**API:**
- `/api/negociacoes`

**UI (se existir):**
- listagem
- detalhe de negociação

**Cobrir:**
- participante consegue interagir
- não participante é bloqueado
- estados da negociação aparecem corretamente

👉 Observação:
A validação de `shipperId` / `carrierId` continua sendo responsabilidade dos testes de integração.

---

### 🌍 Internacionalização (i18n)

**Cobrir:**
- troca de idioma
- textos renderizados corretamente
- persistência do idioma ao navegar ou recarregar

---

## Boas práticas para testes E2E

- Prefira seletores acessíveis:
  - `getByRole`
  - `getByLabel`
  - `getByText`

- Evite:
  - classes CSS (`.btn-primary`, etc.)
  - seletores frágeis

- Não dependa da ordem visual dos elementos

- Use dados estáveis (fixtures / mocks)

- Foque em fluxos críticos — não tente cobrir tudo com E2E

- Não duplique validações já cobertas por integração

---

## Checklist antes de commitar E2E

Sempre rode:

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run test
npx playwright install chromium
npm run test:e2e
```
