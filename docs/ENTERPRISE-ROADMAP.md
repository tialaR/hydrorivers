# Roadmap enterprise consolidado — HydroRivers

**Tipo:** documentação única — **não altera código nem testes**. Serve como **índice estratégico** para desenvolvedores, avaliadores técnicos e recrutadores: resume **visão**, **estado atual**, **decisões**, **fases** e **direções futuras** com base nos artefatos em `docs/` e no `README.md`.

**Honestidade explícita:** o HydroRivers é hoje um **MVP demonstrável** com persistência **mock** e decisões enterprise **parcialmente** refletidas no código. Este arquivo **não** declara produto enterprise completo nem funcionalidades inexistentes — quando algo está só em especificação, está marcado como **◇ planejado**.

---

### Como ler os marcos neste documento

| Marco | Significado |
|-------|-------------|
| **Implementado** | Presente no repositório executável (código, scripts, testes automatizados descritos no projeto). |
| **Em evolução** | Parcialmente implementado ou decisão já documentada guiando trabalho incremental. |
| **◇ Planejado / roadmap** | Descrito em `docs/` sem equivalência total em produção. |

---

## 1. Visão do produto

O **HydroRivers** é uma **plataforma web** para **operações logísticas hidroviárias e cabotagem**, com ênfase em contextos onde **conectividade**, **confiança** e **rastreabilidade** são sensíveis (ex.: Amazônia, cooperativas, pequenos produtores).

**Implementado como MVP:** marketplace (**cargas**, **embarcações**, **negociações**), **rastreio** com timeline de eventos tipados (`docs/TRACKING-TIMELINE.md`), camadas de **impacto**, página **governo**, área **admin**, **auth mock**, **middleware** em rotas privadas, **internacionalização** (`pt-BR`, `en`, `es`), persistência **`.mock-data/*.json** server-side.

**◇ Direção enterprise:** banco real, autorização forte também nas **leituras**, módulo de **documentos**, **dashboard executivo** formalizado (`docs/EXECUTIVE-DASHBOARD.md`), **IA/agentes apenas assistivos** após barreiras de segurança (`docs/AI-ROADMAP.md`, `docs/AGENTS-ROADMAP.md`, `AGENTS.md`).

Visão humana expandida: `docs/DEVELOPER-AI-ONBOARDING.md`, `docs/PORTFOLIO-CASE.md`.

---

## 2. Estado atual implementado

Resumo objetivo — detalhes em `README.md`, `docs/PORTFOLIO-CASE.md`, `docs/DEVELOPER-AI-ONBOARDING.md`.

| Área | Estado |
|------|--------|
| **Stack** | Next.js **16.2.4** (App Router), React **19**, TypeScript, Sass Modules, **next-intl**. |
| **Dados** | Mock server-side em **`.mock-data/*.json`**; merge com seeds conforme projeto. |
| **Auth** | Mock com cookie `hydrorivers_session`; cadastro shipper/carrier; políticas em auditoria/decisões. |
| **Rotas / domínios** | Cargas, embarcações, negociações, rastreio, impacto, governo, dashboard, perfil, admin (vide `README.md`). |
| **Rastreio** | Tipos operacionais (`OperationalTrackingEventKind`), inferência, timeline UI + `GET /api/rastreio` (**GET público** — gap de segurança para produção real). |
| **Qualidade** | `npm run lint`, `typecheck`, `check:i18n`, `test` (Vitest); `test:e2e` (Playwright); `check:onboarding` (`docs/ONBOARDING-PROGRESS-CHECK.md`). |
| **Documentação** | Auditoria de APIs, decisões de produto, planejamentos de dados/documentos/dashboard/IA/agentes. |

**Não implementado como produto final:** Postgres/transações enterprise; uploads de documentos com storage seguro (`docs/DOCUMENTS-MODULE.md`); dashboard executivo **completo** por persona (`docs/EXECUTIVE-DASHBOARD.md`); IA/agentes em runtime (`docs/AI-ROADMAP.md`, `docs/AGENTS-ROADMAP.md`).

---

## 3. Decisões já tomadas

Registradas principalmente em **`docs/SECURITY-PRODUCT-DECISIONS.md`** e **`docs/API-SECURITY-AUDIT.md`** (complementadas pelo código onde já aplicável):

| Tema | Decisão documentada |
|------|---------------------|
| **Cadastro `approved`** | Shipper liberado no modelo atual do handler; carrier não aprovado por padrão — política de produto explicitada; mitigar abuso futuro. |
| **Admin e negociações** | Decisão: administradores **não** devem criar negociações via `POST /api/negociacoes` em produção — cenários via mock-mode/administração adequada. |
| **`ownerId` em cargas** | Decisão: carga criada por usuário autenticado deve ter **`ownerId = user.id`** — alinhamento futuro com DB; implementação pode estar incompleta (**«a confirmar»** na auditoria). |
| **`mock-mode` e JSON inválido** | Decisão: parse inválido **não** deve disparar reset silencioso — comportamento esperado documentado para PR futuro. |
| **Política de IA no repositório** | **`AGENTS.md`:** não adicionar IA em produto antes de **segurança**, **validação** e **testes** consolidados. |
| **Repository boundary** | Decisão arquitetural: handlers devem migrar para **repositórios** como porta única — **`GET /api/cargas`** já piloto (`docs/REPOSITORY-BOUNDARY.md`). |

---

## 4. Fases concluídas (marcos já entregues no código)

*Não são “releases comerciais”; são marcos de engenharia verificáveis no repositório.*

| Marco | Descrição |
|-------|-----------|
| **MVP navegável** | App Router, locales, fluxos principais de marketplace e páginas institucionais (`README.md`). |
| **Persistência mock estável** | JSON server-side; política de não usar `localStorage` para dados de produto (vide README). |
| **Auth mock + middleware** | Rotas privadas; handlers auth documentados na matriz de auditoria. |
| **Qualidade baseline** | Lint, TypeScript strict workflow, i18n check, Vitest (unit + integração API). |
| **E2E inicial** | Playwright configurado — estratégia em `docs/E2E-PLAYWRIGHT.md`. |
| **Rastreio operacional (demo)** | Timeline com kinds operacionais e compatibilidade legada documentada (`docs/TRACKING-TIMELINE.md`). |
| **Documentação de segurança e produto** | `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md` como base para endurecimento. |
| **Etapa 1 — Repository boundary** | `CargoesRepository` + `GET /api/cargas` via `getRepositories()` (`docs/REPOSITORY-BOUNDARY.md`). |

---

## 5. Fases em andamento

Trabalho **parcial** ou **decidido mas não uniforme** no código:

| Fase | Situação |
|------|----------|
| **Repository boundary — continuação** | `POST /api/cargas` e outras rotas ainda podem usar mock direto; **◇** repositórios para negociações/embarcações planejados (`docs/REPOSITORY-BOUNDARY.md`). |
| **Alinhamento ownership** | `ownerId` e escopo “minhas cargas” — decisão tomada; convergência com handlers **em curso / «a confirmar»** (`docs/SECURITY-PRODUCT-DECISIONS.md`, auditoria). |
| **Hard API reads** | GETs amplos sem sessão **ainda comportamento atual**; recomendações escritas — endurecimento **incremental esperado** (`docs/API-SECURITY-AUDIT.md`). |
| **Timeline auditável — API** | Modelo/tipos e UI **implementados**; filtros por participante e escrita auditável na API **◇ planejados** (`docs/TRACKING-TIMELINE.md`). |
| **E2E vs fluxos novos** | Cobertura inicial existe; expansão quando UX/API estabilizarem (`docs/E2E-PLAYWRIGHT.md`). |

---

## 6. Próximas fases (◇ alto nível)

Ordem pode ser ajustada pelo time; dependências críticas entre **dados**, **segurança** e **produto**:

1. **Centralizar leituras/escritas** atrás de repositórios + aplicar decisões `ownerId`/participante nos handlers ou serviços.
2. **Endurecer GETs** sensíveis (sessão + filtros por papel/participação).
3. **Introduzir banco real** atrás dos mesmos contratos (`docs/DATABASE-PLANNING.md`).
4. **Módulo de documentos** (metadados + storage privado) (`docs/DOCUMENTS-MODULE.md`).
5. **Dashboard executivo** conforme especificação + **◇** API agregadora escopada (`docs/EXECUTIVE-DASHBOARD.md`).
6. **IA assistiva / agentes** após gates (`docs/AI-ROADMAP.md`, `docs/AGENTS-ROADMAP.md`).

---

## 7. Roadmap técnico

| Item | Estado | Referência |
|------|--------|------------|
| App Router + Route Handlers | Implementado | `README.md` |
| Feature folders (`src/features`) | Implementado | `README.md`, `docs/ARCHITECTURE.md` |
| Repository boundary | Em evolução (piloto cargas GET) | `docs/REPOSITORY-BOUNDARY.md` |
| Adapter Postgres | ◇ Planejado | `docs/DATABASE-PLANNING.md` |
| Validação por schema em APIs | ◇ Direção citada na arquitetura | `docs/ARCHITECTURE.md` |
| Observabilidade enterprise | Parcial (ex.: Vercel Analytics) | `README.md` |
| CI/CD endurecido | ◇ Opcional expandir jobs | `docs/ONBOARDING-PROGRESS-CHECK.md`, `AGENTS.md` |

---

## 8. Roadmap de produto

| Iniciativa | Estado | Referência |
|------------|--------|------------|
| Marketplace core | Implementado (mock) | `README.md` |
| Rastreio / timeline | Implementado (demo); API escopo ◇ | `docs/TRACKING-TIMELINE.md` |
| Impacto + governo | Implementado como páginas/demo | `README.md`, `docs/EXECUTIVE-DASHBOARD.md` |
| Dashboard executivo formal | ◇ Especificação; tijolos UI existem | `docs/EXECUTIVE-DASHBOARD.md` |
| Documentos / compliance | ◇ Especificação | `docs/DOCUMENTS-MODULE.md` |
| IA assistiva | ◇ Planejamento apenas | `docs/AI-ROADMAP.md`, `docs/AGENTS-ROADMAP.md` |

---

## 9. Roadmap de segurança

| Tema | Direção |
|------|---------|
| **Leituras** | Restringir `GET /api/cargas`, `negociacoes`, `embarcacoes`, `rastreio` — hoje públicos na lista completa (**alto risco** real). |
| **Mutações** | Continuar alinhando PATCH negociações, POST cargas, mock-mode às decisões de produto. |
| **Auth** | Rate limit, OTP apenas demo, revisão CSRF conforme política futura — pontos na auditoria. |
| **Menor privilégio** | Admin sem criar negócio comercial arbitrário; IA sem ampliar escopo (**◇**). |

Fonte única da matriz atual: **`docs/API-SECURITY-AUDIT.md`** + **`docs/SECURITY-PRODUCT-DECISIONS.md`**.

---

## 10. Roadmap de dados

| Etapa | Conteúdo | Referência |
|-------|-----------|------------|
| Hoje | `.mock-data/*.json`, seeds, merge em runtime | `README.md` |
| Migração | Tabelas `users`, `cargoes`, `vessels`, `negotiations`, `tracking_events`, ◇ `documents` | `docs/DATABASE-PLANNING.md` |
| Temporalidade | `created_at`, `updated_at`, `closed_at` para KPIs e auditoria | `docs/DATABASE-PLANNING.md`, `docs/EXECUTIVE-DASHBOARD.md` |
| Timeline | Eventos ligados a cargo/negociação com timestamps auditáveis | `docs/TRACKING-TIMELINE.md` |

---

## 11. Roadmap de IA / agentes

**◇ Tudo planejamento — sem runtime no produto por política (`AGENTS.md`).**

| Artefato | Papel |
|----------|--------|
| **`docs/AI-ROADMAP.md`** | Princípios (não decisório, fallback, auditoria, paridade de permissões), casos de uso, arquitetura BFF, critérios de pronto (§13). |
| **`docs/AGENTS-ROADMAP.md`** | Agentes nomeados (Document, Risk, Negotiation, Tracking, Impact, Support), fichas por agente, ordem incremental, gates A1–A10. |

**Ordem recomendada entre agentes:** Negotiation → Tracking → Risk → Impact → Document → Support (detalhes no próprio `AGENTS-ROADMAP.md`).

---

## 12. Critérios para produção

Lista **orientadora** — não checklist legal completa:

| # | Critério |
|---|----------|
| P1 | Autorização nas **leituras** coerente com papel/participação (**paridade** com o que usuário pode ver). |
| P2 | Persistência transacional (DB) para dados que não podem correr em arquivo JSON concorrente. |
| P3 | **`ownerId`/ownership** aplicado de forma consistente nas cargas e refletido nas queries. |
| P4 | Módulo de documentos ou equivalente para evidências quando compliance exigir (`docs/DOCUMENTS-MODULE.md`). |
| P5 | Timeline/rastreio com API escopada e **◇** escrita auditável quando for requisito operacional (`docs/TRACKING-TIMELINE.md`). |
| P6 | Observabilidade (logs estruturados, métricas, alertas) adequada ao ambiente alvo. |
| P7 | Testes: regressão automatizada para regras críticas + E2E dos fluxos que impactam receita/risco (`docs/E2E-PLAYWRIGHT.md`). |
| P8 | Política de dados pessoais (LGPD/GDPR) quando aplicável — DPIA **◇** quando houver tratamento real. |
| P9 | IA/agentes **somente** após **`docs/AI-ROADMAP.md` §13** e **`docs/AGENTS-ROADMAP.md`** gates — se produto incluir assistência. |

---

## 13. Riscos restantes

| Risco | Origem |
|-------|--------|
| **Exposição via GET amplo** | `docs/API-SECURITY-AUDIT.md` |
| **Ambiguidade de estado** negociação/carga | Transições sem máquina formal documentada em código |
| **Demo vs oficial** | Mock-mode e cenários alteram números — rótulos necessários (`docs/EXECUTIVE-DASHBOARD.md`) |
| **Documentação regulatória inferida** | Até `DOCUMENTS-MODULE` maduro |
| **Interpretação de impacto** | Campos narrativos (`co2Saving`) não são auditoria ambiental oficial |
| **Dependência de provedor ◇ IA** | Mitigar com fallback (`docs/AI-ROADMAP.md`) |

---

## 14. Ordem recomendada de execução

Visão **dependency-aware** para squads pequenos:

1. **Congelar decisões de produto** já escritas e fechar lacunas «a confirmar» onde bloqueiam código (`SECURITY-PRODUCT-DECISIONS`, auditoria).
2. **Expandir repository boundary** — POST cargas, depois negociações/embarcações (`REPOSITORY-BOUNDARY`).
3. **Endurecer GETs** ou introduzir camadas BFF que já devolvam apenas escopo (**segurança antes de IA**).
4. **Migrar persistência** conforme `DATABASE-PLANNING.md` mantendo contratos HTTP.
5. **Documentos** quando compliance exigir storage e metadados formais.
6. **Dashboard executivo** — API agregadora + KPIs definidos (`EXECUTIVE-DASHBOARD`).
7. **IA/agentes** por último entre estas iniciativas — gates explícitos (`AI-ROADMAP`, `AGENTS-ROADMAP`, `AGENTS.md`).

---

## 15. Checklist de qualidade

Para **cada PR** relevante (alinhar com `AGENTS.md`):

| Verificação | Comando / artefato |
|-------------|-------------------|
| Lint | `npm run lint` |
| Tipos | `npm run typecheck` |
| i18n | `npm run check:i18n` |
| Testes | `npm run test` |
| Mudança em fluxo crítico | + `npm run test:e2e` quando aplicável (`docs/E2E-PLAYWRIGHT.md`) |
| Docs tocadas | `npm run check:onboarding` quando renomear scripts ou remover guias (`docs/ONBOARDING-PROGRESS-CHECK.md`) |

Para releases enterprise futuros: acrescentar revisão contra §12 deste documento e contra matriz **`docs/API-SECURITY-AUDIT.md`**.

---

## 16. Como um novo dev deve navegar pelo roadmap

Ordem sugerida de leitura (**primeiras horas → primeira semana**):

| Passo | Documento | Por quê |
|-------|-----------|---------|
| 1 | `README.md` | Rodar o projeto e rotas |
| 2 | `docs/DEVELOPER-AI-ONBOARDING.md` | Domínios, o que está implementado vs futuro |
| 3 | **`docs/ENTERPRISE-ROADMAP.md` (este)** | Mapa mental consolidado |
| 4 | `docs/API-SECURITY-AUDIT.md` | Onde está o risco real das APIs |
| 5 | `docs/SECURITY-PRODUCT-DECISIONS.md` | Regras que parecem “bug” mas são decisão |
| 6 | `docs/REPOSITORY-BOUNDARY.md` | Como dados devem ser acessados daqui pra frente |
| 7 | `docs/DATABASE-PLANNING.md` | Alvo de persistência |
| 8 | `docs/TRACKING-TIMELINE.md`, `docs/DOCUMENTS-MODULE.md`, `docs/EXECUTIVE-DASHBOARD.md` | Domínios que ainda evoluem forte |
| 9 | `docs/E2E-PLAYWRIGHT.md` | Quando investir em E2E |
| 10 | `docs/AI-ROADMAP.md` + `docs/AGENTS-ROADMAP.md` | Apenas depois de entender segurança/dados |

Fluxo gamificado leve de onboarding: **`npm run check:onboarding`** (`docs/ONBOARDING-PROGRESS-CHECK.md`).

---

## 17. Como esse roadmap sustenta o case de portfólio

**Para recrutadores e avaliadores:** `docs/PORTFOLIO-CASE.md` narra pitch, problema, público e **honestidade** sobre MVP vs enterprise. **Este `ENTERPRISE-ROADMAP.md`** mostra que o trabalho não para na demo:

- há **auditoria de segurança** explícita (`API-SECURITY-AUDIT`);
- há **decisões de produto** escritas (`SECURITY-PRODUCT-DECISIONS`);
- há **plano de dados** (`DATABASE-PLANNING`);
- há **limites claros para IA** (`AI-ROADMAP`, `AGENTS-ROADMAP`, `AGENTS.md`);
- há **critérios de produção** e **ordem de execução** — típico de **senior product engineering**.

Ou seja: o portfólio pode destacar **entrega atual** + **clareza sobre gap** + **roteiro enterprise fundamentado em documentação**, sem inflar o que o código faz hoje.

---

## Índice de documentos citados

| Documento | Tema principal |
|-----------|----------------|
| `README.md` | Stack, rotas, mock |
| `AGENTS.md` | Política de PRs e IA |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Onboarding dev + domínios |
| `docs/API-SECURITY-AUDIT.md` | Matriz de rotas e riscos |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Decisões shipper/carrier/admin |
| `docs/E2E-PLAYWRIGHT.md` | Estratégia E2E |
| `docs/REPOSITORY-BOUNDARY.md` | Boundary piloto |
| `docs/DATABASE-PLANNING.md` | Modelo futuro |
| `docs/DOCUMENTS-MODULE.md` | Documentos ◇ |
| `docs/TRACKING-TIMELINE.md` | Rastreio auditável |
| `docs/EXECUTIVE-DASHBOARD.md` | Dashboard ◇ |
| `docs/PORTFOLIO-CASE.md` | Case de portfólio |
| `docs/AI-ROADMAP.md` | IA assistiva ◇ |
| `docs/AGENTS-ROADMAP.md` | Agentes ◇ |
| `docs/ARCHITECTURE.md` | Arquitetura geral |
| `docs/ONBOARDING-PROGRESS-CHECK.md` | Script `check:onboarding` |

---

**Versão:** consolidado interno; atualizar quando marcos **implementados** mudarem (ex.: novo repositório migrado ou GETs endurecidos). Para número de pacote/stack pontual, preferir `package.json` e `README.md`.
