# HydroRivers v0.1.0 — Baseline

**Tipo:** apenas documentação de release — não altera código nem testes.  
**Data de referência:** baseline documental “primeira versão oficial” do conjunto MVP + docs + CI descrito neste repositório.

> **Versão npm:** o campo `version` em [`package.json`](../package.json) permanece **0.8.6** (identificador interno do template). **v0.1.0** aqui denomina uma **baseline de produto/engineering**: escopo MVP congelado para comunicação externa (portfólio, onboarding, revisores), não um bump de semver do pacote publicado — alinhar com [`docs/PORTFOLIO-CASE.md`](PORTFOLIO-CASE.md) e [`README.md`](../README.md).

---

## 1. Resumo da release

A **baseline v0.1.0** consolida o HydroRivers como:

- um **MVP web demonstrável** para operações logísticas hidroviárias e cabotagem em **Next.js 16** (App Router), **React 19** e **TypeScript**, com **três locales** (`pt-BR`, `en`, `es`);
- persistência **mock server-side** em `.mock-data/*.json` adequada a **desenvolvimento e demo**, explicitamente **não** equivalente a produção enterprise;
- uma **esteira documental** que separa **implementado**, **em evolução** e **roadmap**, sem atribuir a produção atual o que está só especificado nos `docs/`;
- **qualidade automatizada local e no GitHub Actions** (`check:onboarding`, lint, tipos, i18n, Vitest).

Esta baseline **não** declara TMS/ERP completo, banco relacional operacional nem IA em runtime — ver [`docs/ENTERPRISE-ROADMAP.md`](ENTERPRISE-ROADMAP.md).

---

## 2. O que está implementado

Lista **estrita** ao repositório executável — detalhes adicionais em [`README.md`](../README.md) e [`docs/PORTFOLIO-CASE.md`](PORTFOLIO-CASE.md).

| Área | Entrega nesta baseline |
|------|-------------------------|
| **Produto MVP** | Marketplace: cargas, embarcações, negociações; rastreio com timeline e API `GET /api/rastreio`; impacto; dashboard; admin; página institucional `governo`; rotas localizadas. |
| **Publicação de carga (React 19)** | Formulário com **`useActionState`** chama **Server Action** (`publishCargoAction`) que delega persistência/revalidação para **`commitPublishCargo`** (também usada por `POST /api/cargas`). |
| **Auth** | Fluxo mock: login, registro público (**shipper** / **carrier**), logout, perfil; sessão **`hydrorivers_session`**; hashing de senhas com **PBKDF2** no servidor; respostas sem **`passwordHash`** ao cliente (`docs/API-SECURITY-AUDIT.md`). |
| **Proteção de UI** | **Middleware** em rotas privadas conforme projeto (vide `README.md`). |
| **Dados** | Leitura/escrita mock em arquivo JSON sob `.mock-data/`; cenários **`/api/mock-mode`** (uso restrito a **admin** no POST conforme auditoria). |
| **i18n** | `next-intl`; mensagens em `messages/*`; **`npm run check:i18n`** para paridade de chaves entre os três idiomas. |
| **Contratos de plataforma** | Routing (`app-routes`, `api-routes`, `route-search-params`), cache/revalidation por tags/paths e constants de domínio/HTTP/cookies/env já compõem a base técnica do MVP. |
| **Produto técnico** | Vercel Analytics (dependência declarada em `package.json`). |

---

## 3. Arquitetura técnica

| Camada | Descrição |
|--------|-----------|
| **Framework** | Next.js **16.2.4**, App Router, Route Handlers em `src/app/api`. |
| **UI** | React **19**, Sass Modules; tema claro/escuro sem `next-themes`. |
| **Organização** | Pastas típicas: `src/app` (rotas e API), `src/core`, `src/features`, `src/shared`, `messages`, `.mock-data` — vide [`README.md`](../README.md). |
| **Dados** | Mock centralizado em JSON server-side; **piloto** de **repository boundary** em parte do acesso a cargas (`GET /api/cargas` via repositório — vide [`docs/ENTERPRISE-ROADMAP.md`](ENTERPRISE-ROADMAP.md), [`docs/REPOSITORY-BOUNDARY.md`](REPOSITORY-BOUNDARY.md)). |

---

## 4. Segurança e autorização

Esta baseline é **honesta** sobre o estágio atual: comportamento efetivo e riscos estão centralizados em [`docs/API-SECURITY-AUDIT.md`](API-SECURITY-AUDIT.md); decisões de produto esperadas mesmo quando o código ainda converge estão em [`docs/SECURITY-PRODUCT-DECISIONS.md`](SECURITY-PRODUCT-DECISIONS.md).

| Tema | Situação (resumo factual) |
|------|---------------------------|
| **Mutations** | Várias rotas exigem sessão, papel ou participação conforme matriz na auditoria (ex.: POST cargas não carrier; PATCH negociações com participação). |
| **Leituras GET amplas** | `GET /api/cargas`, `GET /api/negociacoes`, `GET /api/embarcacoes`, `GET /api/rastreio` permanecem **sem exigência de sessão** no modelo auditado — **alto risco** para cenário real; recomendações documentadas para endurecimento futuro. |
| **`approved` no cadastro** | **Shipper** tende a nascer **aprovado**; **carrier**, **não** — política oficial documentada (`SECURITY-PRODUCT-DECISIONS`). |
| **`ownerId` / `shipperId` em publicação de carga** | **`commitPublishCargo`** define ambos como `user.id` em **`POST /api/cargas`** e no fluxo de **Server Action** da UI; decisão D3 em `SECURITY-PRODUCT-DECISIONS` **refletida na escrita**. Seeds antigos ou cargas só de cenário podem divergir. |
| **Admin em `POST /api/negociacoes`** | **Decisão:** admin **não** deve usar essa rota em produção para criar negociações; QA via **mock-mode** onde aplicável (`SECURITY-PRODUCT-DECISIONS`). |
| **Mock-mode** | POST restrito a **admin**; GET de metadados de cenário **público** na matriz atual — pontos para endurecimento opcional futuro. |

Nada nesta baseline substitui pen test independente, DPIA nem compliance específicos de cliente — apenas documenta o estado atual e a direção.

---

## 5. Testes e qualidade

| Camada | O que existe no repositório |
|--------|-----------------------------|
| **Automatizado (Vitest)** | `npm run test` (suite padrão); scripts `npm run test:unit` e `npm run test:integration` disponíveis no `package.json`. |
| **E2E (Playwright)** | Script `npm run test:e2e`; dependência declarada — **estratégia**, escopo recomendado e checklist em [`docs/E2E-PLAYWRIGHT.md`](E2E-PLAYWRIGHT.md). Cobertura E2E descrita ali como **inicial**, a expandir com estabilização de fluxos críticos. |
| **Estáticos / i18n** | `npm run lint`, `npm run typecheck`, `npm run check:i18n`. |
| **Onboarding do repo** | `npm run check:onboarding` alinha artefatos e scripts esperados (vide documentação ligada ao script). |

A baseline **v0.1.0** **não** afirma cobertura completa de segurança ou de todos os fluxos de usuário apenas por existir Vitest ou Playwright.

---

## 6. CI/CD

| Item | Estado na baseline |
|------|---------------------|
| **Workflow** | `.github/workflows/quality-gates.yml` — descrito em [`docs/CI-QUALITY-GATES.md`](CI-QUALITY-GATES.md). |
| **Gatilhos** | `push` e `pull_request`. |
| **Ambiente** | **Node.js 22**, `npm ci`, cache npm. |
| **Checks na pipeline** | `npm run check:onboarding`, `lint`, `typecheck`, `check:i18n`, `test`. |
| **Fora da pipeline atual** | `npm run test:e2e`, `npm run build`, jobs dedicados de integração são **opcionais futuros** (explicitamente listados como próximos passos em CI-QUALITY-GATES). |

---

## 7. Documentação criada *(que compõe esta baseline)*

Conjunto de artefatos publicados neste repositório que fundamentam comunicação técnica, segurança e roadmap (referências principais solicitadas pela release):

| Documento | Papel nesta baseline |
|-----------|-------------------------|
| [`README.md`](../README.md) | Porta de entrada: stack, o que existe, como rodar, mapa para `docs/`. |
| [`docs/ENTERPRISE-ROADMAP.md`](ENTERPRISE-ROADMAP.md) | Índice estratégico: implementado vs evolução vs planejado; fases e critérios orientadores para produção. |
| [`docs/PORTFOLIO-CASE.md`](PORTFOLIO-CASE.md) | Narrativa honesta para recrutadores e revisores de código. |
| [`docs/API-SECURITY-AUDIT.md`](API-SECURITY-AUDIT.md) | Matriz estática de rotas API, riscos e recomendações. |
| [`docs/SECURITY-PRODUCT-DECISIONS.md`](SECURITY-PRODUCT-DECISIONS.md) | Decisões de produto/security que não são “bugs” até haver novo PR alinhado. |
| [`docs/CI-QUALITY-GATES.md`](CI-QUALITY-GATES.md) | Contrato da pipeline de qualidade em GitHub Actions. |
| [`docs/E2E-PLAYWRIGHT.md`](E2E-PLAYWRIGHT.md) | Quando usar E2E, relação com integração e boas práticas. |
| **`AGENTS.md`** | Política de contribuição, validações esperadas e regra sobre **IA** antes de segurança/testes. |

Outros `docs/` (por exemplo DATABASE-PLANNING, DOCUMENTS-MODULE, AI-ROADMAP) fazem parte do **roadmap** referenciado no enterprise roadmap mas **não** são listados aqui como funcionalidades entregues pelo código nesta baseline.

---

## 8. Limitações conhecidas

1. **Persistência em arquivo** — inadequada para produção distribuída concorrente; substituir por banco/transações antes de cenário enterprise real (`README.md`, `ENTERPRISE-ROADMAP`).  
2. **GETs operacionais abertos** — exposição ampla na demo; autorização nas leituras é **trabalho pendente planejado** (`API-SECURITY-AUDIT`).  
3. **Auth mock** — não equivalente a IdP OAuth/OIDC, MFA real, rate limiting completo nem política SameSite definitiva (`API-SECURITY-AUDIT`).  
4. **Dados legados e negociações** — seeds/cenários podem ter cargas sem `ownerId`/`shipperId`; transições de negociação podem ainda precisar de máquina de estados explícita (`API-SECURITY-AUDIT`, `SECURITY-PRODUCT-DECISIONS`).  
5. **Módulo de documentos, dashboard executivo completo e IA runtime** — **não fazem parte** da entrega desta baseline (`ENTERPRISE-ROADMAP`, `PORTFOLIO-CASE`).  
6. **Dados de impacto e narrativas** — majoritariamente demonstrativos; não auditáveis como série oficial até integração futura adequada (`PORTFOLIO-CASE`).  
7. **CI** — não executa Playwright nem `npm run build` por padrão nesta baseline (`CI-QUALITY-GATES`).  

---

## 9. Roadmap pós-v0.1.0

Ordenação orientadora (ajustável pelo time) conforme [`docs/ENTERPRISE-ROADMAP.md`](ENTERPRISE-ROADMAP.md):

1. Estender **repository boundary** e alinhar **mutações** restantes (ex.: participantes); endurecer **GETs** / ownership nas **queries** quando houver DB.  
2. Endurecer **GETs sensíveis** (sessão + escopo por papel/participação).  
3. Introduzir **persistência relacional** mantendo contratos HTTP/domínio (`docs/DATABASE-PLANNING.md`).  
4. Evoluir **documentos**/compliance e **timeline** auditável na API onde for requisito (`docs/DOCUMENTS-MODULE.md`, `docs/TRACKING-TIMELINE.md`).  
5. **Dashboard executivo** formal + API agregadora escopada (`docs/EXECUTIVE-DASHBOARD.md`).  
6. Expandir **E2E** em fluxos críticos quando UI/API estabilizarem (`E2E-PLAYWRIGHT`).  
7. Opcional endurecer **CI** (E2E, build, gates de branch).  
8. **IA assistiva/agentes** somente após gates em `docs/AI-ROADMAP.md`, `docs/AGENTS-ROADMAP.md` e `AGENTS.md`.

---

## 10. Como validar a release localmente

1. Clonar ou atualizar o repositório e entrar na raiz.  
2. Instalar dependências: `npm install` ou, para espelhar CI, **`npm ci`**.  
3. Subir o app: `npm run dev` e acessar `http://localhost:3000/pt-BR` (ou locale equivalente).  
4. (Opcional) Limpar mocks: remover `.mock-data/*.json` conforme [`README.md`](../README.md) e reiniciar o dev server.  
5. Executar a suíte de comandos na seção seguinte até tudo ficar verde.  
6. (Opcional) Executar **`npm run test:e2e`** quando Playwright/navegadores estiverem instalados — ver [`docs/E2E-PLAYWRIGHT.md`](E2E-PLAYWRIGHT.md).

---

## 11. Comandos de validação

Alinhados ao **CI atual** (`docs/CI-QUALITY-GATES.md`) e à política de contribuição (`AGENTS.md`):

```bash
npm ci
npm run check:onboarding
npm run lint
npm run typecheck
npm run check:i18n
npm run test
```

Comandos **adicionais** não obrigatórios nesta baseline de pipeline, mas recomendados quando o PR toca fluxo crítico de UI/API:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## 12. Nota para portfólio

Para **uma linha de currículo ou README de GitHub:** *MVP HydroRivers — marketplace hidroviário com timeline de rastreio, demo mock integral, auditoria API explícita, decisões de produto documentadas, Vitest + Playwright e CI GitHub Actions (lint, TS, i18n, testes).*  

Para narrativa mais rica porém **honesta**, usar [`docs/PORTFOLIO-CASE.md`](PORTFOLIO-CASE.md) em conjunto com este arquivo: demonstra **execução real** mais **transparente sobre gaps** típicos de senior product/engineering (`ENTERPRISE-ROADMAP`, seção sobre portfólio).

---

**Fim das notas da baseline v0.1.0**
