# HydroRivers — Deep Dive (guia técnico para frontend Next.js)

**Tipo:** documentação única — **não altera código nem testes**.  
**Público:** pessoa desenvolvedora **front-end** (Next.js/React) que ainda não domina automação, pirâmide de testes, CI/CD ou padrões **enterprise**.  
**Tom:** profissional, didático e conservador na afirmação: tudo que estiver **implementado no código** está separado do que é **documentado**, **em evolução** ou **roadmap (◇ futuro)**.

**Última referência interna:** `package.json` **0.8.6**, Next **16.2.4**, React **19**. Números de testes e chaves i18n variam por commit — confirme com `npm run test` e `npm run check:i18n`.

---

## 1. Visão geral do HydroRivers

### O que é

O **HydroRivers** é uma **aplicação web** (MVP demonstrável) para **operações logísticas hidroviárias e cabotagem**: centraliza em uma única experiência **oferta de cargas**, **frota (embarcações)**, **negociações**, **rastreio operacional**, **narrativa de impacto** e uma superfície **institucional** (ex.: página `governo`). A persistência atual é **mock server-side** em arquivos JSON — **não** é um TMS/ERP enterprise em produção.

### Qual problema real resolve

- Informação **espalhada** entre embarcadores, transportadores, planilhas e comunicação informal.  
- **Custo de coordenação** e assimetria de dados entre oferta e frota.  
- Dificuldade de **visibilidade agregada** (impacto, gargalos) para políticas e operações — sempre lembrando que números “de demo” **não** são séries oficiais.

### Por que hidrovia precisa de digitalização

Corredores com **conectividade irregular**, documentação sensível e **confiança** entre partes exigem um **canal único** para negociar, acompanhar e explicar o que está acontecendo — mesmo que, neste repositório, ainda como **protótipo** orientado a validação de produto.

### Usuários principais (personas do MVP)

| Persona | Papel no produto |
|---------|------------------|
| **Embarcador (shipper)** | Publica e acompanha **cargas** e **negociações**. |
| **Transportador (carrier)** | Explora mercado e participa de **negociações** — com política de **aprovação** distinta (ver §2). |
| **Admin** | Operação da plataforma, área restrita, cenários de **mock-mode** (ver §2). |
| **Institucional / governo** | Audiência da rota **governo** — persona de produto; **não** equivale automaticamente a um `role` com os mesmos poderes nas APIs em todos os fluxos. |

### Dores de negócio atacadas (no escopo demonstrável)

- Fragmentação entre **demanda**, **frota** e **acompanhamento**.  
- Falta de um **fluxo único** para estados de carga e negociação (ainda **simulados** com mock).  
- Necessidade de **storytelling** e narrativa de impacto para stakeholders — com **honestidade** sobre o que é métrica narrativa vs. auditoria real.

### Por que o projeto é forte para portfólio

Combina **entrega executável** (Next.js, i18n, testes, CI) com **documentação de segurança e produto** — matriz de APIs, decisões explícitas de `approved`, ownership, limites de mock — e um **roadmap enterprise** sem confundir “especificação em `docs/`” com “já pronto no código”. Isso comunica **maturidade de engenharia** e **transparência** típicas de trabalho sênior (ver também `docs/PORTFOLIO-CASE.md`).

---

## 2. Regra de negócio da aplicação

### Papéis

**Shipper (embarcador)** — lado da **demanda** de transporte; no cadastro atual tende a nascer **`approved: true`** para habilitar o núcleo do fluxo de publicação no MVP (**decisão de produto** — `docs/SECURITY-PRODUCT-DECISIONS.md`).

**Carrier (transportador)** — oferta de **frota** e participação em negociações; no cadastro tende a **`approved: false`** até fluxo futuro de moderação explícito.

**Admin** — operação e QA; **decisão documentada**: no modelo **alvo de produção**, admin **não** deve criar negociações comerciais via `POST /api/negociacoes` — cenários devem usar **`mock-mode`** e governança adequada (`SECURITY-PRODUCT-DECISIONS.md`). O comportamento atual do handler pode ainda permitir edge cases; trate como **alinhamento incremental**.

**Exemplo (conceitual):** shipper publica carga; carrier **não aprovado** recebe `403` ao tentar publicar carga; mensagem de UX deve refletir a política (`user-not-approved` onde aplicável).

### Domínios principais

**Cargas** — unidades de demanda (origem, destino, tipo, status, narrativa de risco/documentação sugerida). **Publicação autenticada:** **`commitPublishCargo`** persiste **`ownerId` e `shipperId`** (`user.id`) em **`POST /api/cargas`** e na Server Action do formulário (`useActionState`). Dados só de seed podem divergir.

**Embarcações** — frota compatível com rotas/calado; ligadas às negociações quando uma proposta referencia uma embarcação.

**Negociações** — “deal” entre `shipperId` e `carrierId` com estágios/status. **PATCH** exige que o usuário seja **participante** (`shipperId` ou `carrierId` igual ao usuário da sessão) — regra **implementada** e coberta por testes de integração.

**Rastreamento** — timeline de eventos com estados visuais e, quando presente, **`kind`** operacional; há detalhes de modelo em `docs/TRACKING-TIMELINE.md`.

**Impacto** — camadas de narrativa socioambiental e páginas dedicadas; trate campos derivados como **demonstrativos** até série oficial.

### Mock-mode

- **`GET /api/mock-mode`**: metadados do cenário ativo e lista de IDs (público no estado auditado — ver matriz em `API-SECURITY-AUDIT.md`).  
- **`POST /api/mock-mode`**: **somente `role === 'admin'`** autenticado; sem sessão → **401**; não-admin → **403**.  
- Objetivo: **resetar/reidratar** datasets JSON para cenários de demo e QA.

**JSON inválido no POST `/api/mock-mode` — honestidade técnica:**  
- **Decisão de produto** (`SECURITY-PRODUCT-DECISIONS.md`): parse inválido **não** deve causar **reset silencioso**.  
- **Código atual** (`src/app/api/mock-mode/route.ts`): `await request.json().catch(() => null)` — se o corpo não for JSON válido, o handler **ainda chama** `resetMockScenario` com payload ausente. Portanto o comportamento **alvo** (ex.: **400** sem reset) é **◇ futuro / gap** até PR dedicado — **não** afirmar que **400** já está implementado.

### Códigos HTTP esperados (referência da auditoria)

| Status | Significado típico neste MVP |
|--------|-------------------------------|
| **200** | Sucesso em leitura ou mutação autorizada. |
| **201** | Criação (ex.: registro, criação de recurso). |
| **400** | Payload inválido, validação (`invalid-payload` em várias rotas). |
| **401** | Sem sessão onde obrigatória (`unauthenticated`). |
| **403** | Autenticado mas não autorizado (`forbidden`, papel, não participante, não aprovado). |
| **404** | Recurso não encontrado (ex.: carga/embarcação inexistente na rota de negociação). |
| **409** | Conflito (ex.: email duplicado no registro). |
| **500** | Falha interna rara — **não** é o objetivo documentar catálogo completo; handlers tendem a mapear erros previsíveis para 4xx. |

**Exemplo:** `PATCH /api/negociacoes` sem sessão → **401**; usuário que não é shipper/carrier da negociação → **403**.

---

## 3. Arquitetura geral — árvore de pastas (espelho didático)

```txt
src/
  app/                    # App Router: páginas, layouts, route handlers
    api/                  # APIs REST (Route Handlers) — /api/*
    [locale]/             # Rotas internacionalizadas (/pt-BR, /en, /es)
  core/                   # i18n (routing, navegação)
  features/               # Domínios de produto (auth, marketplace, tracking…)
  shared/                 # UI compartilhada, servidor (mock-db, auth helpers…)
tests/
  unit/                   # Testes rápidos de unidade
  integration/            # Testes de API (Vitest + handlers)
  e2e/                    # Playwright — fluxos de UI
docs/                     # Planejamento, auditoria, roadmap, guias
.mock-data/               # JSON persistido em dev (mock server-side)
.github/
  workflows/              # CI (quality gates)
messages/                 # pt-BR.json, en.json, es.json
```

| Pasta | Responsabilidade | O que costuma ter | Como navegar como dev novo |
|--------|------------------|-------------------|----------------------------|
| **`src/app`** | Rotas e colocação de UI por URL; `layout.tsx`/`page.tsx`; APIs em `api/**/route.ts`. | Páginas, loading, metadata, handlers. | Comece por `[locale]/layout` e uma rota simples (`/login`). |
| **`src/app/api`** | Contratos HTTP do MVP (auth, cargas, negociações, mock-mode…). | `route.ts` por método HTTP. | Leia `API-SECURITY-AUDIT.md` ao lado do handler. |
| **`src/features`** | Regras e UI **por domínio**. | Componentes, hooks, serviços client onde existir. | Agrupe por pasta de feature (`auth`, `marketplace`…). |
| **`src/shared`** | Peças reutilizáveis e **código server** compartilhado (mock-db, auth). | UI, helpers, repositório piloto onde aplicável. | Não coloque regra de negócio “solta” se já existe feature. |
| **`src/core`** | Infra de i18n e navegação. | `routing`, navigation helpers. | Antes de trocar URL, ver `routing` e `middleware`. |
| **`tests`** | Pirâmide de testes. | `*.test.ts` Vitest; `e2e/*.spec.ts` Playwright. | Unit → integration (API) → e2e (fluxo). |
| **`docs`** | Verdade de produto/arquitetura/segurança. | Markdowns referenciados neste guia. | Ordem sugerida em `ENTERPRISE-ROADMAP.md` §16. |
| **`.mock-data`** | Persistência local do mock. | `*.json` gerados/embutidos em runtime. | Reset seguro descrito no `README.md`. |
| **`.github/workflows`** | Automação CI. | `quality-gates.yml`. | Ler `CI-QUALITY-GATES.md`. |

---

## 4. Stack técnica (por que cada peça)

| Tecnologia | Por que faz sentido aqui | Onde aparece |
|------------|---------------------------|--------------|
| **Next.js 16 + App Router** | UI e APIs no mesmo app; SSR/SSG e Route Handlers colocados por rota. | `src/app`, `src/app/api`. |
| **React 19** | UI declarativa; ecossistema alinhado ao Next atual. | Componentes em `features` e `shared`. |
| **TypeScript** | Contratos explícitos entre domínio, API e UI (`strict: true` em `tsconfig.json`). | Todo o `src/`, testes em TS. |
| **next-intl** | Produto regional com **3 locales** desde o MVP. | `messages/*`, `src/core/i18n`, layouts. |
| **Sass Modules** | Estilo encapsulado por componente, evitando vazamento global acidental. | `*.module.scss` ao lado dos componentes. |
| **Vitest** | Testes **rápidos** de unidade e integração em Node. | `tests/unit`, `tests/integration`, `npm run test`. |
| **Playwright** | E2E no **browser real** para fluxos de usuário. | `tests/e2e`, `npm run test:e2e`. |
| **GitHub Actions** | CI reproduzível em PR/push. | `.github/workflows/quality-gates.yml`. |
| **Mock server-side** | Iteração e demo **sem** operar DB real ainda; gravação em `.mock-data`. | Handlers + `mock-db` / repositório piloto. |

---

## 5. Next.js App Router (didática resumida)

### Páginas vs API

- **Página** (`page.tsx`): responde a **navegação** do utilizador (HTML React).  
- **Route Handler** (`route.ts` em `app/api/...`): responde a **`fetch`** HTTP — é a “API” REST do projeto.

### `src/app`

- Segmentos de URL = pastas; `layout.tsx` envolve filhos; `[locale]` adiciona o prefixo de idioma.

### Rotas em `src/app/api`

Cada pasta pode exportar funções nomeadas por verbo HTTP:

```ts
// Exemplo conceitual (estrutura típica do projeto)
// src/app/api/recurso/route.ts
export async function GET() {
  return Response.json({ ok: true });
}
```

### Rotas privadas (UI)

O **`middleware.ts`** na raiz verifica cookie `hydrorivers_session` para paths listados (ex.: `/dashboard`, `/perfil` …) e redireciona para `/{locale}/login?next=…` se não houver sessão. **Isto é proteção de navegação**, não substitui endurecer **GETs de API** (ver auditoria).

### i18n e App Router

`next-intl` combina com middleware de locale (`src/core/i18n/routing`) para servir `/pt-BR`, `/en`, `/es`. Trocar idioma **preserva path localizado** via `router.replace` no `LocaleSwitcher`.

### Server vs Client Components

Por padrão, componentes em `app/` são **Server Components**. Quando há estado, eventos ou hooks de navegação cliente, usa-se **`'use client'`** no topo do arquivo — padrão visível em `features/` e layouts interativos.

**Exemplo mínimo:**

```tsx
// Servidor: default no App Router
export default function Page() {
  return <main>…</main>;
}

// Cliente: apenas quando necessário
'use client';
export function ClientWidget() {
  return <button type="button">…</button>;
}
```

---

## 6. React e componentes

### Onde ficam

- **`src/features/<domínio>`** — telas e lógica de negócio agrupadas (auth, marketplace, rastreio…).  
- **`src/shared/ui`** — botões, cards, toggles reutilizáveis.  
- **`src/app/[locale]/.../page.tsx`** — “cola” a página importando features.

### UI vs feature vs página

| Tipo | Responsabilidade |
|------|------------------|
| **Componente de UI** | Apresentação reutilizável, pouco ou nenhum domínio. |
| **Feature** | Agrupa regras e telas de um assunto (ex.: `ProfilePanel`). |
| **Página** | Conecta rota → composição de features + layout. |

### Sass Modules

Cada módulo `*.module.scss` exporta classes **locais**, reduzindo conflito de nomes com o restante do app.

### Evitar acoplamento

Prefira **composição** (página importa feature) a “importar o mundo” em um só arquivo gigante; mantenha contratos de dados nos tipos em `domain`/`types` onde existirem.

---

## 7. Mock server-side e `.mock-data`

### Por que existe

Permite **demo imediata**, testes de integração determinísticos e **iteração de produto** sem custo de infraestrutura no MVP — com limites conscientes (concorrência em arquivo, não usar como produção).

### Mock “simples” vs server-side

- **Client-only** (ex.: só `localStorage`) não serve como fonte única de verdade entre abas e SSR.  
- **Server-side** (handlers Next) gravam JSON no disco — útil para **simular** persistência real e ensaiar migração futura.

### Repository boundary

**Implementação parcial:** `GET /api/cargas` pode passar por repositório (`docs/REPOSITORY-BOUNDARY.md`); outras rotas ainda acessam mock direto — **em evolução**.

### Fluxo atual vs futuro

```txt
Hoje (piloto / misto):
Cliente → Route Handler → [ CargoesRepository opcional | mock-db direto ] → .mock-data/*.json

Futuro (◇ planejado):
Cliente → Route Handler → Repositório → Adapter (Postgres) → DB real
```

### Limitações

Concorrência em serverless, backups, transações ACID, autorização em **todas** as leituras — ver `ENTERPRISE-ROADMAP.md` e `DATABASE-PLANNING.md`.

---

## 8. APIs e segurança

### Autenticação vs autorização

- **Autenticação** — “quem é?” (sessão mock, cookie `hydrorivers_session`).  
- **Autorização** — “pode fazer **esta** ação neste recurso?” (papel, participante, `approved`).

### 401 vs 403

- **401** — não autenticado (sem sessão válida).  
- **403** — autenticado, mas política proíbe (papel errado, não participante, não aprovado).

### Rotas principais (leitura humana da auditoria)

Documentação mestra: **`docs/API-SECURITY-AUDIT.md`** — matriz por rota com método, sessão, risco e recomendação. **Importante:** vários **GET** listam coleções **sem exigir sessão** no estado auditado → **alto risco** para um cenário enterprise real; endurecimento é **roadmap**, não promessa do MVP atual.

### Decisões documentadas

Centralizadas em **`docs/SECURITY-PRODUCT-DECISIONS.md`** — incluem `approved`, `ownerId`, admin vs negociações, mock-mode.

**Exemplo conceitual de corpo de erro:**

```json
{ "error": "forbidden", "reason": "user-not-approved" }
```

---

## 9. Testes (para quem está começando)

### Teste unitário

**O que é:** valida **uma unidade pequena** (função pura, helper) **isolada**, sem subir servidor HTTP completo.

**Quando usar:** lógica repetida, parsers, helpers de domínio — **rápido** e **barato**.

**Exemplos no repo:** arquivos em `tests/unit/**` (auth helpers, mock-db, tradução de conteúdo mock, timeline helpers).

### Teste de integração (API)

**O que é:** chama **Route Handlers** reais em Node com **requests** simulados; valida status, corpo JSON e regras como participante em `PATCH`.

**Por que APIs usam integração:** reproduz o contrato HTTP **sem** browser.

**Exemplos:** `tests/integration/api/` — `auth.login`, `auth.profile`, `cargas.get/post`, `negociacoes.patch/post`, `mock-mode.post`, `rastreio.get`, etc.

### Teste E2E (Playwright)

**O que é:** abre **Chrome** (no projeto: Chromium), clica e navega como usuário.

**Por que Playwright:** estável, API moderna, integra com `webServer` no config.

**O que cobre hoje:** login OTP em modo demo, redirects de rotas privadas, sessão em `/perfil`, logout via rota, troca de idioma em home e com sessão — ver inventário em `docs/E2E-PLAYWRIGHT.md`.

**Limitações:** exige `npx playwright install`, `next build` lento no primeiro ciclo, OTP depende de `HYDRORIVERS_EXPOSE_OTP_CODE` no servidor de teste, header mobile não expõe logout da mesma forma que desktop (por isso há teste via `/logout`).

### Sobre o “número de testes” (55 → 72)

O repositório **não obriga** histórico público “55 testes” em um artefato versionado — use o contador **`npm run test`** no seu commit (no ambiente desta documentação, a suíte Vitest agrupava **72** testes em **17** arquivos). **Por que mais testes aumentam confiança:** cada teste de integração nas APIs reduz regressões em **401/403/404** e contratos JSON sem precisar clicar na UI.

### Como rodar

```bash
npm run test                 # Vitest (unit + integration conforme vitest.config.ts)
npm run test:unit            # Só tests/unit
npm run test:integration     # Só tests/integration
npm run test:e2e             # Playwright (após playwright install)
```

---

## 10. CI/CD e quality gates

### O que é CI

**Integração contínua:** a cada push/PR, o repositório é verificado de forma **automática** (instalar deps, rodar checks).

### O que é CD

**Entrega contínua / deployment** — publicar em ambiente (Vercel, etc.). Neste repositório o workflow documentado cobre **quality gates**, **não** descreve pipeline completa de deploy nem promoção entre ambientes.

### O implementado agora

- **`.github/workflows/quality-gates.yml`** — job único em `ubuntu-latest`, Node **22**, `npm ci`, depois scripts de qualidade.  
- **Não implementado** no mesmo arquivo: E2E, build de produção como gate obrigatório, deploy automático.

### Fluxo do workflow

**Gatilhos:** `push`, `pull_request`.  
**Concorrência:** cancela runs redundantes do mesmo PR/branch.

**Comandos executados (em ordem):**

| Comando | Por que existe |
|---------|----------------|
| `npm run check:onboarding` | Garante que docs/scripts mínimos do onboarding não sumiram (`ONBOARDING-PROGRESS-CHECK.md`). |
| `npm run lint` | Padrão de código e classes de problemas estáticos. |
| `npm run typecheck` | TypeScript sem emit — erros de tipo antes do build. |
| `npm run check:i18n` | **Paridade** de chaves entre `pt-BR`, `en`, `es`. |
| `npm run test` | Regressão Vitest. |

**Investigar falhas:** abrir **Actions** no GitHub, expandir o step que falhou, reproduzir localmente mesmo commit — `CI-QUALITY-GATES.md`.

**Valor de portfólio:** mostra que o projeto entende **gates** reproduzíveis — tópico comum em entrevistas sênior.

---

## 11. Lint

**O que é:** análise **estática** que aponta padrões problemáticos, acessibilidade básica, imports mortos (conforme regras ativas).

**Configuração:** `eslint.config.mjs` estende **`eslint-config-next/core-web-vitals`** — alinhado a boas práticas Next/React e métricas web.

**Comando:** `npm run lint` (= `eslint .`).

**Evita:** antipadrões comuns, alguns problemas de hooks, imports inválidos — **não** substitui testes nem revisão humana.

---

## 12. TypeScript

**`npm run typecheck`** executa `tsc --noEmit` — compilação de tipos **sem** gerar JS.

**Em produto logístico:** contratos explícitos em **cargas**, **negociações** e **APIs** reduzem bugs de “campo errado” que custam caro operacionalmente.

**Tipo vs runtime:** TypeScript some em build; erros de tipo **impedem merge** se o CI/typecheck falhar; erros de runtime (lógica) ainda precisam de testes e boas validações em handlers.

---

## 13. Internacionalização (i18n)

**Por que três idiomas:** alcance regional e demonstração de **produto internacional** desde o MVP (`pt-BR`, `en`, `es`).

**next-intl:** mensagens em `messages/*.json`; layouts carregam mensagens por locale; cliente consome via `useTranslations`.

**`npm run check:i18n`:** falha se **qualquer locale** estiver sem uma chave presente nos outros — evita tela com fallback vazio em um idioma.

**Sobre “N keys aligned”:** o número **exato** muda quando se adicionam chaves — o script imprime algo como **“i18n ok: N keys aligned…”**. Trate **N** como valor atual do terminal, não como constante eterna (ex.: no estado recente do projeto surgiram **~528** chaves; confirme com o comando).

**Adicionar chave com segurança:** editar **os três** JSON com a mesma chave; rodar **`check:i18n`** antes do PR.

---

## 14. Automações, agentes de produto e ferramentas de IA

### O que foi automatizado (repositório)

- **`check:onboarding`** — presença de artefatos.  
- **CI quality gates** — lint, types, i18n, Vitest.  
- **Scripts npm** padronizados em `package.json`.

### Ferramentas (Cursor, Composer, Codex, GPT, Opus…)

São **assistentes de edição** — não são “parte do produto HydroRivers”. **`AGENTS.md`** define política: **não** colocar IA **no produto** antes de segurança, validação e testes consolidados.

**Ask vs Agent (Cursor, visão geral):**

- **Ask** — responde e sugere; você aplica mudanças manualmente.  
- **Agent** — pode propor/editar arquivos em fluxo; exige revisão humana e aderência a `AGENTS.md`.

**Prompts padronizados / regras:** pastas `.cursor/rules` e `AGENTS.md` reduzem ambiguidade — importante para times e para **reproduzibilidade** entre modelos.

**Jornada gamificada:** `check:onboarding` + `docs/ONBOARDING-PROGRESS-CHECK.md` dão **feedback binário** ao novo dev.

### Agentes de **produto** (◇ roadmap — não implementados)

Descritos em **`docs/AGENTS-ROADMAP.md`** e **`docs/AI-ROADMAP.md`** — **não** há “Document Agent” em runtime no app.

| Agente (◇ futuro) | Ideia resumida |
|-------------------|----------------|
| **Document Agent** | Assistência sobre documentação/compliance — depende de `DOCUMENTS-MODULE`. |
| **Risk Agent** | Explicar/mitigar riscos narrativos com disclaimers. |
| **Negotiation Agent** | Sugestões **não decisórias** em negociação. |
| **Tracking Agent** | Contexto sobre timeline/rastreio com paridade de leitura futura. |
| **Impact Agent** | Texto institucional com cuidado antitruste/narrativa. |
| **Support Agent** | FAQ/escopo textual — por último (abuso, texto livre). |

Ordem sugerida e gates **A1–A10** estão no próprio `AGENTS-ROADMAP.md`.

---

## 15. Branches — tabela orientativa

Convenções típicas deste repositório (também em `docs/REPO-CLEANUP.md`): prefixos `docs/`, `feature/`, `security/`, `test/`, `refactor/`, `ci/`, `tooling/`, `chore/`; sufixos **`v2`–`v4`** para **iterações** do mesmo tema. **`main`** costuma ser a linha estável; **`dev`** aparece como integração em equipes que preferem PRs para `dev` antes de `main` — confirme a política do time no remoto.

A tabela abaixo é **ilustrativa** (objetivo inferido pelo nome da branch); **não** substitui `git log` nem tickets.

| Branch (exemplos reais / pedido) | Objetivo provável | Tipo | Resultado esperado ao merge |
|----------------------------------|-------------------|------|-----------------------------|
| `security/api-audit` | Auditoria de APIs | docs/security | Matriz em `API-SECURITY-AUDIT.md` |
| `docs/security-product-decisions` | Decisões shipper/carrier/admin | docs | `SECURITY-PRODUCT-DECISIONS.md` |
| `security/api-error-standards` | Padronização de erros / UX API | security | Handlers + testes (fase do PR) |
| `test/authz-coverage` | Cobertura de autorização | test | Mais asserts em integração |
| `refactor/repository-boundary` | Boundary / repositório | refactor | `GET /api/cargas` via repo (piloto) |
| `docs/database-planning` | Modelo dados futuro | docs | `DATABASE-PLANNING.md` |
| `docs/documents-module` | Módulo documentos ◇ | docs | Especificação |
| `feature/tracking-timeline` | Timeline operacional | feature | UI + tipos |
| `docs/executive-dashboard` | Dashboard executivo ◇ | docs | `EXECUTIVE-DASHBOARD.md` |
| `docs/portfolio-case` | Case de portfólio | docs | Narrativa honesta |
| `docs/ai-roadmap` | Princípios IA assistiva | docs | `AI-ROADMAP.md` |
| `docs/agents-roadmap` | Agentes nomeados ◇ | docs | `AGENTS-ROADMAP.md` |
| `docs/enterprise-roadmap` | Índice estratégico | docs | `ENTERPRISE-ROADMAP.md` |
| `docs/developer-ai-onboarding` | Onboarding dev | docs | `DEVELOPER-AI-ONBOARDING.md` |
| `tooling/onboarding-progress-check` | Script de progresso | tooling | `check:onboarding` |
| `feature/onboarding-dashboard` | UI jornada | feature | Páginas/feature |
| `ci/quality-gates-v4` | CI | ci | Workflow Actions |
| `chore/cleanup-branches-v4` | Higiene git | chore | Sem mudança de produto necessária |
| `docs/readme-navigation-v4` | README | docs | Entrada do repo |
| `release/project-baseline-v4` | Baseline release docs | release | Notas / baseline |
| `security/env-hardening-v4` | Env / secrets | security | `ENVIRONMENT.md`, `.env.example` |
| `test/e2e-auth-flows-v4` | E2E auth | test | Specs Playwright |

**Por que fase/branch separada:** PRs pequenos revisáveis; histórico git legível; menos risco de misturar “docs” com “breaking API”.

---

## 16. Tags e releases

**Tag Git** — marcador imutável em um commit (`v0.1.0`). Facilita **checkout** de baseline e **notas de release** (`docs/RELEASE-NOTES-v0.1.0.md` descreve **baseline documental**; **`package.json`** pode permanecer em **0.8.6** — são identificadores diferentes).

**Portfolio:** tags mostram **marcos** e disciplina de versionamento.

**Release notes:** documento curto com escopo, limitações e como validar — padrão profissional em projetos open source e em squads.

---

## 17. Documentações criadas — índice mestre

| Documento | Objetivo | Quando ler | Público | Valor |
|-----------|----------|------------|---------|-------|
| `README.md` | Porta de entrada, comandos, rotas | Primeiro clone | Todos | Execução rápida |
| `AGENTS.md` | Regras de PR e IA | Antes do primeiro PR | Devs | Alinhamento |
| `docs/ENTERPRISE-ROADMAP.md` | Mapa estratégico | Visão 1h | Dev / revisor | Contexto total |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Onboarding humano | Dias 1–3 | Novo dev | Domínios |
| `docs/PORTFOLIO-CASE.md` | Case honesto | Entrevista | Recrutador | Narrativa |
| `docs/API-SECURITY-AUDIT.md` | Matriz de rotas | Antes de API | Segurança | Riscos |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Decisões “parecem bug” | Debug de 403 | Produto/Eng | Clareza |
| `docs/CI-QUALITY-GATES.md` | CI explicado | Falha no Actions | Todos | Debugging |
| `docs/E2E-PLAYWRIGHT.md` | E2E + limitações | Antes de e2e | QA/Dev | Expectativas |
| `docs/REPOSITORY-BOUNDARY.md` | Camada de dados | Refator API | Arquiteto | Migração DB |
| `docs/DATABASE-PLANNING.md` | Modelo futuro | Persistência | Backend-minded | Alvo |
| `docs/DOCUMENTS-MODULE.md` | Documentos ◇ | Compliance futuro | PM/Eng | Escopo |
| `docs/TRACKING-TIMELINE.md` | Rastreio auditável ◇ | Tracking | Domínio | Evolução |
| `docs/EXECUTIVE-DASHBOARD.md` | KPIs ◇ | Produto avançado | Leadership | Norte |
| `docs/AI-ROADMAP.md` | IA assistiva ◇ | Pós-segurança | Arquiteto | Gates |
| `docs/AGENTS-ROADMAP.md` | Agentes nomeados ◇ | Com AI-ROADMAP | Arquiteto | Ordem |
| `docs/ONBOARDING-PROGRESS-CHECK.md` | Script onboarding | CI/local | Onboarding | Binário OK |
| `docs/ENVIRONMENT.md` | Variáveis / ambientes | Setup local | Todos | Segurança env |
| `docs/REPO-CLEANUP.md` | Branches | Higiene git | Mantenedores | Dívida git |
| `docs/RELEASE-NOTES-v0.1.0.md` | Baseline | Marco release | Comunicação | Congelar escopo |
| **`docs/HYDRORIVERS-DEEP-DIVE.md`** (**este arquivo**) | Síntese única técnico–produto | Depois do README | Dev FE / onboarding | Mapa único até os outros docs |
| `docs/ARCHITECTURE.md` | Arquitetura + fluxo mock + personas estendidas | Antes de desenhar feature | Produto / arquiteto | Diagrama mental + mermaid opcional |
| `docs/MOCK-MODE-USE-CASES.md` | Cenários globais de mock (`empty-state`, `market-active`, …) | Ao depurar dados | QA / dev | Como trocar dataset via `/api/mock-mode` |
| `docs/QA-TEST-MATRIX.md` | Contas demo e cenários manuais de QA | Antes de release interno | QA | Checklist exploratória (não substitui automação) |
| `docs/TEST-DATA.md` | Convenções / dados de teste | Ao escrever testes | Dev | Orientação sobre fixtures e mock |
| `docs/agents/PROMPTS_HYDRORIVERS.md` | Prompts reutilizáveis (ferramenta) | Uso com assistentes de código | Dev | Padronizar pedidos à IA |

**Temas especializados (UX/i18n / histórico de correções)** — úteis em PRs pontuais, não necessários na primeira leitura: `BOTTOM-SHEETS-CONSISTENCY.md`, `MOBILE-BOTTOM-SHEET-FIX.md`, `I18N-SYNTAX-FIX-V086.md`, `I18N-COVERAGE-V085.md`, etc.

---

## 18. Fluxo de trabalho **típico** (não dogma de equipe)

Uma ordem **racional** para um MVP com risco em **dados e segurança**:

1. **Estabilização** — rotas navegáveis, mock estável.  
2. **Testes** — integração nas APIs críticas.  
3. **Hardening** — documentar riscos antes de “polir” UI.  
4. **Documentação** — auditoria + decisões explícitas.  
5. **Decisões de produto** — `approved`, admin/negociação.  
6. **Onboarding** — reduzir tempo até primeiro PR bom.  
7. **Gamificação leve** — `check:onboarding`.  
8. **Tooling** — scripts npm consistentes.  
9. **Roadmap enterprise** — indexar o futuro sem prometer entrega.  
10. **CI/CD** — gates mínimos (quality gates).  
11. **README / env / E2E** — entrada profissional, exemplos de env, fluxos críticos na UI.

**Por que esta ordem:** segurança e contratos **antes** de IA em runtime; docs **antes** de escalar time; CI **depois** que scripts existem.

---

## 19. Como apresentar em portfólio

### Pitch (~30 segundos)

“HydroRivers é um MVP web de **operações hidroviárias** em Next.js: marketplace, negociações, rastreio e impacto, com **três idiomas** e **dados mock server-side**. O repositório inclui **auditoria de API**, **decisões de produto** escritas, **testes de integração** nas rotas sensíveis, **E2E** para login e guards de rota, e **CI** com lint, TypeScript e i18n.”

### Técnica (~2 minutos)

Subir `npm run dev`, mostrar **middleware** redirecionando para login, **OTP** em modo demo, `POST` protegidos retornando **403** para não participante — tudo condizente com `API-SECURITY-AUDIT.md`.

### Arquitetura

App Router + features + `api` por domínio; **repositório piloto** para **GET cargas**; caminho futuro para Postgres em `DATABASE-PLANNING.md`.

### Testes

Pirâmide: Vitest em integração para contratos; Playwright para fluxo humano; CI para não regressar.

### IA / automação

**Produto:** agentes são **◇ roadmap**. **Desenvolvimento:** Cursor e regras em `AGENTS.md` para manter barreira de qualidade.

### Perguntas frequentes (sugestões de resposta)

| Pergunta | Direção de resposta |
|----------|----------------------|
| “É produção?” | MVP demonstrável; GETs amplios são **risco documentado**. |
| “Onde está o banco?” | `.mock-data` hoje; Postgres é **◇ planejado**. |
| “Por que mock-mode?” | Cenários de demo/QA; **só admin** no POST. |
| “IA no app?” | **Não** em runtime; roadmap com gates em `AI-ROADMAP.md`. |

---

## 20. Como um dev novo deve começar

1. **Instalar:** `npm install` ou `npm ci`.  
2. **Rodar:** `npm run dev` → `http://localhost:3000/pt-BR`.  
3. **Testes:** `npm run test` → depois explore `test:unit` / `test:integration`.  
4. **Ler em ordem:** `README.md` → `DEVELOPER-AI-ONBOARDING.md` → `ENTERPRISE-ROADMAP.md` → `API-SECURITY-AUDIT.md`.  
5. **Primeira issue:** bom candidato é fechar **decisão vs código** em `POST /api/mock-mode` (JSON inválido) **ou** ampliar teste de integração na matriz da auditoria.  
6. **Branch:** `git checkout -b fix/algo-ou-docs/algo`.  
7. **Prompt:** respeitar `AGENTS.md` e regras do Cursor.  
8. **Validar:** lint, typecheck, check:i18n, test; se tocar fluxo UI, considerar E2E.  
9. **Commit:** mensagem clara (Conventional Commits se o time usar).  
10. **Merge:** PR pequeno para `dev` ou `main` conforme política do remoto.

---

## 21. Exemplos de comandos

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run check:i18n
npm run test
npm run check:onboarding
npx playwright install chromium
npm run test:e2e

git branch
git checkout -b feature/minha-contribuicao
git merge main
git push -u origin feature/minha-contribuicao
```

---

## 22. Conclusão

O HydroRivers demonstra **visão de produto** (personas, impacto, institucional), **arquitetura** pragmática (App Router, features, boundary gradual), **consciência de segurança** (auditoria + decisões explícitas), **qualidade** (Vitest, Playwright, CI), **i18n** sério desde o MVP, **pensamento enterprise** (roadmaps e critérios de produção) e **uso estratégico de IA** como **assistente de desenvolvimento** — não substituto de regras ou de barreiras de deploy.

O diferencial honesto para carreira é: **entrega que roda**, **documentação que admite gaps**, e **roteiro** para endurecer o sistema quando o produto sair da demo.

---

**Próximo passo sugerido para o leitor:** abrir `docs/ENTERPRISE-ROADMAP.md` §12–13 e escolher **um** item marcado como em evolução que você pode fechar com um PR pequeno — é assim que este deep dive vira prática.
