# Configuração de ambiente — HydroRivers

**Escopo:** documentação e exemplos de variáveis. O MVP continua com **persistência mock** em `.mock-data/*.json` e **auth mock**; nada neste guia introduz backend real nem altera regras de negócio.

---

## 1. Objetivo da configuração de ambiente

- **Padronizar nomes** de variáveis para quando o time evoluir para banco, storage e auth reais.  
- **Documentar flags de demo** (ex.: exposição de OTP) que **já existem no código** e **comportamento desejado** do mock-mode por tipo de ambiente.  
- **Reduzir risco operacional:** segredos só fora do Git; produção sem atalhos de demo.  
- **Separar o que é plano** do que já é lido em runtime — ver coluna “Estado” na tabela da seção 3.

Referência de exemplo seguro na raiz do repositório: [`.env.example`](../.env.example).

---

## 2. Ambientes esperados

| Ambiente | Uso típico | Dados | Mock-mode / demo |
|----------|------------|--------|-------------------|
| **development** | Máquina do desenvolvedor | `.mock-data/*.json` | Permitido para **admin** conforme handlers atuais; OTP **não** exposto por padrão. |
| **test** | Vitest (unit + integração), CI de qualidade | Mocks em memória / arquivos de teste; env manipulado nos próprios testes | Não depende de `.env.local`; integração redefine `HYDRORIVERS_EXPOSE_OTP_CODE` quando necessário. |
| **demo** | Vercel/preview ou servidor interno só para stakeholder | Persistência mock ou snapshot controlado | Pode usar flags de demo **com conscientização do risco**; política mínima: `HYDRORIVERS_EXPOSE_OTP_CODE` **desligado** se houver público amplos. |
| **production** | Produto real (futuro) | Banco/API reais (**não** é o MVP atual) | Mock-mode deve estar **desabilitado ou estritamente controlado** (ver §5–§6). |

Até haver código que leia `HYDRORIVERS_APP_ENV`, trate esse nome como **convenção documental**; o valor pode estar só no `.env.local` ou no painel do host.

---

## 3. Variáveis propostas

| Variável | Estado | Valor exemplo (fake) | Uso |
|----------|--------|----------------------|-----|
| `HYDRORIVERS_APP_ENV` | **Plano** | `development` | Rótulo lógico: `development` \| `test` \| `demo` \| `production`. Nenhuma rota lê obrigatoriamente esta variável **nesta baseline**; útil para documentação e futuros guards. |
| `HYDRORIVERS_EXPOSE_OTP_CODE` | **Implementado** | `false` | Se `=== 'true'`, o `POST /api/auth/login` inclui `otpCode` na resposta para facilitar E2E/Playwright. **Código:** `src/app/api/auth/login/route.ts`. |
| `HYDRORIVERS_USE_CASE_LOGS` | **Implementado** | `false` | `logUseCaseEvent` só imprime quando `=== 'true'` (qualquer `NODE_ENV`). Rotas “quentes” de produto mock (ex.: Cargo Status Assistant) **não** chamam esse utilitário para não poluir o terminal; habilitar a flag só ajuda onde houver chamadas explícitas ou instrumentação temporária. |
| `NEXT_PUBLIC_APP_URL` | **Plano** | `http://localhost:3000` | Base para URLs absolutos/redirects quando o projeto passar a consumir; **não** é exigência do MVP atual. |
| `HYDRORIVERS_DEV_SCENARIO_LOGS` | **Implementado** | `false` | `reportDevScenario` só imprime quando `=== 'true'` (terminal). |
| `HYDRORIVERS_DEV_SCENARIO_VERBOSE` | **Implementado** | `false` | Com reporter ligado e `=== 'true'`, secção “Mock hints” sanitizada. |
| `HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN` | **Implementado** | `true` (dev) | Em `NODE_ENV !== production`: `false` bloqueia `POST /api/auth/qa-direct-login`. Ignorado se `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true`. |
| `HYDRORIVERS_FORCE_MOCK_QA_UI` | **Implementado** | omitido | **Somente CI/E2E.** Mostra painel Mock mode mesmo em build `production`. Ver [`docs/MOCK-MODE-QA-HUB.md`](MOCK-MODE-QA-HUB.md). |
| `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN` | **Implementado** | omitido | **Somente CI/E2E.** Permite login direto QA em `NODE_ENV=production`. |
| `HYDRORIVERS_ALLOW_MOCK_MODE_RESET` | **Implementado** | `true` para habilitar reset | `POST /api/mock-mode`: sessão **admin** e valor **estritamente** `=== 'true'`; caso contrário **403** `mock-mode-reset-disabled` e **não** há reset. `GET` não exige esta flag. Playwright/E2E deve definir explicitamente `true` junto às flags QA (ver [`playwright.config.ts`](../playwright.config.ts)). |
| `DATABASE_URL` | **Plano** | URI Postgres fictícia | Migrações futuras (`docs/DATABASE-PLANNING.md`). Ignorado pelo app mock. |
| `BLOB_READ_WRITE_TOKEN` | **Plano** | token fake | Uploads futuros de avatar/documentos. |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | **Plano** | placeholders | Alternativa futura de backend; não usados hoje. |
| `AUTH_SECRET` | **Plano** | string fake ≥32 caracteres | Sessões/JWT reais no futuro; auth atual é mock com cookie próprio. |

**Node.js** define `NODE_ENV` automaticamente em `npm run dev` / `build` / `test` do Next/Vitest — não é necessário duplicar em `.env` para desenvolvimento comum.

---

## 4. Flags de demo / mock

| Flag | Comportamento quando ativa |
|------|----------------------------|
| `HYDRORIVERS_EXPOSE_OTP_CODE=true` | OTP visível na API de login — **somente** para automação controlada ou laboratório. |
| `HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true` | Obrigatória (`=== 'true'`) para **admin** conseguir **reset** via `POST /api/mock-mode`; caso contrário **403** com `reason: mock-mode-reset-disabled`. |
| `HYDRORIVERS_USE_CASE_LOGS=true` | Ativa logs estruturados `logUseCaseEvent` no terminal **apenas nos pontos que chamam** a função (Cargo Status Assistant não usa por padrão). |
| `HYDRORIVERS_DEV_SCENARIO_LOGS=true` | Ativa blocos `reportDevScenario` no terminal. |
| `HYDRORIVERS_DEV_SCENARIO_VERBOSE=true` | Acrescenta secção “Mock hints” nos blocos do reporter (valores sanitizados). |
| `HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN=false` | Em ambiente não production, bloqueia login direto do QA Hub (`/api/auth/qa-direct-login`). |
| `HYDRORIVERS_FORCE_MOCK_QA_UI=true` / `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` | **Apenas pipelines** (ex.: Playwright com `next build`). Nunca habilitar em produção real. Ver [`docs/MOCK-MODE-QA-HUB.md`](MOCK-MODE-QA-HUB.md). |

Cenários de dados globais continuam sendo trocados via **`POST /api/mock-mode`** com corpo `{ "scenario": "…" }` (somente admin autenticado no fluxo atual) — vide [`docs/MOCK-MODE-USE-CASES.md`](MOCK-MODE-USE-CASES.md) e [`docs/API-SECURITY-AUDIT.md`](API-SECURITY-AUDIT.md).

---

## 5. Comportamento esperado do mock-mode por ambiente

*Atualização:* `POST /api/mock-mode` exige sessão **admin** e `HYDRORIVERS_ALLOW_MOCK_MODE_RESET === 'true'` antes de ler o corpo e chamar `resetMockScenario`.

| Ambiente | Esperado |
|----------|----------|
| **development** | Admin pode usar mock-mode para QA; cenários úteis para fluxos MVP. |
| **test** | Integração cobre autorização (`401`/`403`); E2E sobe servidor com OTP exposto apenas no comando Playwright (`playwright.config.ts`), não obrigatoriamente via `.env`. |
| **demo** | Mock-mode apenas se política aceitar resets em ambiente público-preview; avaliar remover GET público de metadados quando sensível (`API-SECURITY-AUDIT`). |
| **production** | **Não** oferecer reset de dataset fictício aos usuários finais; desabilitar `POST /api/mock-mode` por feature flag ou remoção de rota quando houver dados reais. |

---

## 6. Regras de segurança

1. **Nunca commitar secrets** — passwords, tokens reais de Supabase/Vercel, chaves de API. O Git ignora `.env`, `.env.local` (vide [`.gitignore`](../.gitignore)).  
2. **Local:** use **`.env.local`** (copiando de `.env.example`) para experimentos; cada dev mantém o seu arquivo fora do controle de versão.  
3. **CI / hosting:** configurar segredos no painel da plataforma (GitHub Encrypted Secrets, Vercel Environment Variables, etc.), nunca no repositório.  
4. **Restringir mock-mode em production:** definir `HYDRORIVERS_ALLOW_MOCK_MODE_RESET` como **`false`** ou omitir no host público (reset bloqueado mesmo para admin); complementar com revisão de deploy das rotas `/api/mock-mode` se necessário.

---

## 7. Como configurar localmente

```bash
cp .env.example .env.local
# Edite .env.local — ajuste HYDRORIVERS_APP_ENV conforme sua intenção (documental por ora).
```

- Para desenvolvimento normal: **`HYDRORIVERS_EXPOSE_OTP_CODE=false`** (omissão também se comporta como não exposto).  
- Para reset de cenários mock (`POST /api/mock-mode`): em **dev local**, use **`HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true`** em `.env.local` (o `.env.example` já traz `true`). Sem isso, admin recebe **403** ao tentar reset.

---

## 8. Como validar

- **Smoke manual:** subir `npm run dev`, login com usuário demo do `README.md`, confirmar ausência de `otpCode` na resposta de login quando a flag está desligada.  
- **Alinhamento com CI:** `npm ci` + `npm run lint` + `npm run typecheck` + `npm run test` (vide [`docs/CI-QUALITY-GATES.md`](CI-QUALITY-GATES.md)).  
- **`check:onboarding`** e **`check:i18n`** conforme `AGENTS.md` quando tocado em artefatos de onboarding ou traduções.  
- **E2E:** Playwright injeta `HYDRORIVERS_EXPOSE_OTP_CODE=true` e `HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true` no comando do `webServer` em [`playwright.config.ts`](../playwright.config.ts) — não exige `.env.local` para esses valores no job de E2E.

---

## 9. Impacto em testes

| Suíte | Relação com env |
|--------|------------------|
| **Vitest** | `tests/integration/api/auth.login.post.test.ts` manipula `HYDRORIVERS_EXPOSE_OTP_CODE` quando necessário; `.env.local` não é carregado automaticamente (`vitest.config.ts` sem dotenv). |
| **Vitest (`mock-mode`)** | `vi.stubEnv('HYDRORIVERS_ALLOW_MOCK_MODE_RESET', 'true')` no `beforeEach`; teste de gate usa `false`; `afterEach` chama `vi.unstubAllEnvs()`. |
| **Vitest (`env` reset)** | `tests/unit/shared/config/env.mock-mode-reset.test.ts` documenta que só o literal `true` habilita o helper. |
| **E2E** | Build/start pode passar OTP e gate mock via variáveis inline no `playwright.config.ts` — ver ficheiro. |

Adicionar variáveis novas ao **`.env.example`** não deve quebrar testes **desde que o código não mude comportamento padrão** sem atualizar asserts — esta alteração ficou apenas em exemplo + doc.

---

## 10. Próximos passos futuros

- Ler **`HYDRORIVERS_APP_ENV`** (ou similar) para **gates** claros entre demo e production builds.  
- Conectar **`DATABASE_URL`**, **`AUTH_SECRET`** quando a migração em [`docs/DATABASE-PLANNING.md`](DATABASE-PLANNING.md) e auth real entrarem em escopo.  
- Opcionalmente carregar **`NEXT_PUBLIC_APP_URL`** em metadata/canonical links.  
- Revisitar este arquivo quando o primeiro deploy “production real” definir política definitiva para mock-mode e OTP.

---

Documentos relacionados: [`README.md`](../README.md), [`docs/CI-QUALITY-GATES.md`](CI-QUALITY-GATES.md), [`docs/API-SECURITY-AUDIT.md`](API-SECURITY-AUDIT.md), [`docs/RELEASE-NOTES-v0.1.0.md`](RELEASE-NOTES-v0.1.0.md).
