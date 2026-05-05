# Dashboard executivo — especificação de produto (HydroRivers)

**Tipo:** documentação apenas — **sem** implementação de UI nova neste arquivo, **sem** alteração de código ou testes.

**Leituras relacionadas:** `docs/DEVELOPER-AI-ONBOARDING.md` (produto e fluxos), `docs/DATABASE-PLANNING.md` (persistência futura), `docs/DOCUMENTS-MODULE.md` (documentos como roadmap), `docs/TRACKING-TIMELINE.md` (eventos `OperationalTrackingEventKind`), `docs/API-SECURITY-AUDIT.md` (exposição atual das APIs), `docs/SECURITY-PRODUCT-DECISIONS.md` (papéis, ownership, políticas).

---

### Legenda de estado

| Marco | Significado |
|-------|-------------|
| **✓ Parcialmente no código** | Já existe algo na base de código que **ajuda** a narrativa (cards, páginas, mocks, APIs listagens), mas **não** equivale ao dashboard executivo descrito aqui como produto completo. |
| **◇ Futuro / roadmap** | Planejado ou recomendado; depende de decisões de produto, dados ou segurança. |

**Esclarecimento importante:** o HydroRivers **não possui**, neste momento, um **produto único nomeável “dashboard executivo”** que una KPIs por persona, filtros temporais, API agregadora escopada e políticas de interpretação documentadas **de ponta a ponta**. Existem **✓ parciais** (por exemplo overview em `/dashboard`, narrativa numérica em `/governo`, dados mock agregáveis via serviços). Este documento define **o alvo de produto** e separa **o que já existe como tijolo** do que **◇ ainda falta**.

---

## 1. Objetivo do dashboard

Centralizar, por **perfil de usuário**, uma **visão executiva** do estado da operação hidroviária na plataforma:

- **volume** de cargas e negociações no marketplace;
- **capacidade** aparente de frota;
- **movimento físico** via eventos de rastreio (timeline operacional — ver `docs/TRACKING-TIMELINE.md`);
- **atrito** (tempo de negociação, pendências, atrasos);
- **impacto regional** narrativo ou agregado (com disclaimers até série oficial existir);
- **alertas operacionais** derivados de regras claras — não “achismo visual”.

Sucesso na primeira entrega **◇ futura**: um usuário entende **em menos de um minuto** se “está pior ou melhor” **no seu escopo autorizado**, com **definições explícitas** de cada número e link para detalhar (telas existentes ou futuras).

---

## 2. Problema que resolve

| Dor | Por que importa |
|-----|------------------|
| **Informação espalhada** | Embarcador, transportador e instituições veem pedaços do fluxo em telas diferentes; falta um **resumo decisório**. |
| **Leituras equivocadas** | Mock e cenários (`mock-mode`) mudam volumes; sem rótulos e definições, métricas parecem “oficiais” quando são **demonstrativas**. |
| **Escopo errado de permissão** | APIs de listagem hoje expõem coleções amplas sem sessão em vários GETs (`docs/API-SECURITY-AUDIT.md`) — um dashboard executivo **real** precisa **calcular no servidor** apenas o que o papel pode ver **◇**. |
| **Gap temporal** | “Tempo médio de negociação” e tendências exigem **timestamps confiáveis** — lacuna documentada frente ao mock atual (`docs/DATABASE-PLANNING.md`). |
| **Documentação vs lista de exigências** | “Documentação pendente” cruza cargas, negociações e **◇ futuro** módulo de documentos (`docs/DOCUMENTS-MODULE.md`); sem modelo único, o KPI deve declarar **qual versão** está sendo medida. |

---

## 3. Visão por perfil

Visão **humana** do que cada persona espera tirar do dashboard — antes da tabela de KPIs.

### Admin (`admin`)

**✓ Parcial:** ferramentas de cenário e áreas administrativas existem no app; KPI global unificado **◇**.

- Operação da **plataforma**: volumes globais, funil de negociações, sinais de exceção.
- Suporte a **QA / demo**: conscientização de que **mock-mode** altera números (`docs/MOCK-MODE-USE-CASES.md` quando aplicável).

### Shipper (embarcador)

**✓ Parcial:** fluxos de cargas e negociações como participante; resumo executivo dedicado **◇**.

- “**Minhas** cargas”: publicadas, ativas, em negociação.
- Saúde das **negociações** onde sou `shipperId`.
- **Rastreio** e alertas ligados às **minhas** cargas/deals (**◇** escopo autorizado na API).

### Carrier (transportador)

**✓ Parcial:** marketplace e negociações; frota em mock — painel executivo do carrier **◇**.

- Negociações onde sou `carrierId`.
- **Frota própria**: disponível vs comprometida (**definições de status** devem ser contrato único).
- Alertas de **embarque / atraso / documentação** nas rotas sob minha operação **◇**.

### Governo / operação institucional

**✓ Parcial:** página `/governo` com narrativa e números derivados do ecossistema demo; **persona institucional** não é sempre um quarto `role` técnico igual aos outros (`docs/DEVELOPER-AI-ONBOARDING.md`).

- Panorama **regional / por corredor** com **atenção a privacidade** e anti-agregação identificável **◇**.
- **Impacto regional** alinhado ao que for público e metodologicamente sustentável **◇**.
- **Alertas sistêmicos** (picos de atraso, gargalo documental agregado) com limiares definidos **◇**.

---

## 4. KPIs por perfil

Catálogo de **métricas candidatas**. Cada KPI deve ter **definição formal** (“o que conta”) antes de aparecer como número oficial na UI **◇**.

| KPI | Definição operacional (resumo) |
|-----|----------------------------------|
| **Cargas publicadas** | Contagem de cargas em estado “publicada / visível ao marketplace” (alinhar ao enum `status` real do domínio). |
| **Cargas ativas** | Subconjunto em trânsito operacional de interesse executivo (ex.: não encerradas); **◇** contrato único com produto (“ativa” ≠ só “não draft”). |
| **Negociações abertas** | Deals não terminados; **cuidado** com divergência `stage` vs `status` até máquina de estados estar documentada. |
| **Negociações concluídas** | Estado terminal “aceito / encerrado com sucesso” — definir campo canônico **◇**. |
| **Embarcações disponíveis** | Frota com `status` indicando disponibilidade (ex.: `available`); mesma semântica para benchmark global vs frota do carrier. |
| **Tempo médio de negociação** | Δ entre início e fechamento; exige **`createdAt` / `closedAt`** ou equivalente (**lacuna típica no mock** — `docs/DATABASE-PLANNING.md`). |
| **Eventos de rastreio** | Volume ou série temporal de eventos (`tracking_events`); opcionalmente por `OperationalTrackingEventKind` (`docs/TRACKING-TIMELINE.md`). |
| **Atrasos reportados** | Subconjunto de eventos com `kind === 'delay_reported'` (ou regra derivada **◇** em alertas). |
| **Documentação pendente** | **◇** Ideal: cruzar exigências (`requiredDocuments`) + **◇** entidade `Document` pendente (`docs/DOCUMENTS-MODULE.md`). **MVP possível:** heurísticas sobre texto/status até módulo existir — sempre com disclaimer. |
| **Impacto regional** | Agregações por corredor, família de produto, narrativa CO₂ (`co2Saving` etc.) — **demonstrativo** até metodologia oficial **◇**. |
| **Alertas operacionais** | Contadores ou fila **◇**: combinação de regras (atraso, pendência doc, sincronização tardia, volumes anômalos); severidade futura **◇**. |

### Priorização sugerida por perfil

| KPI | Admin | Shipper | Carrier | Governo/operação |
|-----|:-----:|:-------:|:-------:|:----------------:|
| Cargas publicadas | Alta | Alta (escopo próprio **◇**) | Baixa/Média (benchmark **◇**) | Alta |
| Cargas ativas | Alta | Alta | Média | Alta |
| Negociações abertas | Alta | Alta | Alta | Alta |
| Negociações concluídas | Alta | Alta | Alta | Alta |
| Embarcações disponíveis | Média | Média | Alta (frota própria) | Média |
| Tempo médio de negociação | Baixa **◇** dados | Média **◇** | Média **◇** | Média **◇** |
| Eventos de rastreio | Média | Alta | Alta | Alta |
| Atrasos reportados | Alta | Alta | Alta | Alta |
| Documentação pendente | Alta | Alta | Alta | Alta |
| Impacto regional | Média | Média | Baixa | Alta |
| Alertas operacionais | Alta | Alta | Alta | Alta |

---

## 5. Fonte dos dados atuais

Origens **✓ já utilizadas ou disponíveis** no projeto para montar protótipos e agregações locais — **não** substituem decisões **◇** de API escopada.

| Necessidade | Fonte típica | Observações |
|-------------|--------------|-------------|
| Cargas | `readMock('cargoes')`, `listCargoes()`, `GET /api/cargas` | Campos: `status`, `ownerId`, `shipperId` — **publicação via API/Server Action** preenche ambos (`commitPublishCargo`); itens puramente de **seed** podem omitir; corredor, `co2Saving`, etc. |
| Negociações | `readMock('negotiations')`, `listNegotiations()`, `GET /api/negociacoes` | `stage`, `status`, `shipperId`, `carrierId`, `cargoId`; timestamps podem ser limitados. |
| Embarcações | `readMock('vessels')`, `listVessels()`, `GET /api/embarcacoes` | `status`, `ownerId`. |
| Rastreio | `readMock('trackingEvents')`, `listTrackingEvents()`, `GET /api/rastreio` | `kind` opcional + inferência (`docs/TRACKING-TIMELINE.md`). |
| Resumo simples | **✓** `getMarketplaceSummary()` e componentes tipo overview | Agregações básicas; não são o dashboard executivo completo **◇**. |
| Sessão / papel | `getSessionUser`, fluxos em `features/auth` | Base para escopo **◇** futuro. |
| Cenários | `POST /api/mock-mode`, seeds | Altera contagens — sempre disclosure “demonstrativo”. |

---

## 6. Fonte dos dados futuros

**◇ Roadmap** — alinhado a `docs/DATABASE-PLANNING.md`, `docs/API-SECURITY-AUDIT.md`, `docs/DOCUMENTS-MODULE.md`.

| Área | Direção |
|------|---------|
| Persistência | Tabelas `cargoes`, `negotiations`, `vessels`, `tracking_events`; **◇** `documents` para KPI documental robusto. |
| Temporalidade | `created_at`, `updated_at`, `closed_at` normalizados em **UTC** para médias e séries. |
| API agregadora | **◇** `GET /api/dashboard/summary` (nome ilustrativo): retorna só KPIs autorizados; não espelhar listagens completas no cliente para dados sensíveis. |
| Rastreio | Escrita auditável; filtros por `cargoId` / `negotiationId` / período (`docs/TRACKING-TIMELINE.md`). |
| Alertas | **◇** motor de regras ou observabilidade; canais e severidades em produto/segurança. |
| Impacto regional | **◇** eventual integração externa (IBGE, ANTAQ, inventários) — fora do escopo técnico imediato; até lá, derivado controlado + metodologia explícita. |

---

## 7. Filtros necessários

| Filtro | Uso |
|--------|-----|
| **Papel / sessão** | Escopo automático (shipper/carrier/admin); governo **◇** política dedicada (role futura ou claims institucionais). |
| **Intervalo de datas** | Séries, médias, alertas recentes **◇**. |
| **Corredor / hidrovia** | KPIs regionais e visão governo. |
| **Estado da carga** | Publicada vs ativa vs encerrada — enums alinhados ao domínio. |
| **Estado da negociação** | Aberta vs concluída — contrato único. |
| **Família de produto / tipo** | Impacto e relatórios setoriais. |
| **Disponibilidade de embarcação** | Capacidade vs ocupação. |
| **`kind` de rastreio** | Distribuição operacional (`OperationalTrackingEventKind`). |
| **Severidade de alerta** | **◇** quando subsistema de alertas existir. |

Para demos: filtros devem ser **determinísticos** e documentados ao lado da definição do KPI (`docs/TEST-DATA.md` pode complementar fixtures).

---

## 8. Componentes sugeridos

Todos **◇ futuros** como **composição de produto**; podem reutilizar **✓** primitives já existentes (`Card`, ícones Hydro, padrões de layout).

| Componente (conceitual) | Função |
|--------------------------|--------|
| **Camada de agregação server-side** | Funções puras / serviço que calculam KPIs a partir de repositório ou mock — uma fonte para dashboard + governo. |
| **Faixa de KPIs (cards)** | Uma métrica por cartão + tooltip “definição” + estado vazio/erro. |
| **Funil negociações** | Abertas vs concluídas + link para lista filtrada **◇**. |
| **Bloco rastreio** | Contagem, últimos eventos ou série **◇**. |
| **Mapa ou tabela regional** | Impacto/agregação por corredor — cuidado com granularidade **◇**. |
| **Centro de alertas (resumo)** | Top N alertas ou contadores por tipo **◇**. |

Primeira entrega **◇** pode ser **somente contagens e tabelas**, sem biblioteca de gráficos obrigatória.

---

## 9. Rotas / páginas futuras

**◇** Rotas-alvo conceituais; algumas **✓** já existem com outro propósito — evolução incremental.

| Rota (padrão App Router) | Papel |
|--------------------------|--------|
| **`/[locale]/dashboard`** | **✓ Existe** área dashboard; **◇** evoluir para variantes por persona ou camada executiva explícita. |
| **`/[locale]/governo`** | **✓ Existe** — alinhar KPIs institucionais à mesma camada de agregação **◇** para evitar números divergentes. |
| **`/[locale]/admin`** | **✓ Existe** — visão global; separar métricas “cenário/mock” das métricas que seriam **oficiais** **◇**. |
| **`/[locale]/impacto`** | Deep-links “detalhar impacto” **◇**. |
| **`/[locale]/rastreio`** | Contexto da timeline; KPI de eventos pode apontar para exploração **◇**. |
| **API `GET /api/dashboard/summary`** | **◇** recomendada antes de dados reais sensíveis — ver `docs/API-SECURITY-AUDIT.md`. |

---

## 10. Permissões

**Estado atual (auditoria):** várias APIs retornam listas completas **sem sessão** — inadequado para tratamento como “dashboard executivo de produção” (`docs/API-SECURITY-AUDIT.md`).

**Comportamento alvo ◇:**

| Princípio | Detalhe |
|-----------|---------|
| **Least privilege** | Cada papel vê apenas KPIs derivados de entidades autorizadas (ex.: shipper → cargas `ownerId` / negociações como `shipperId`). |
| **Admin** | Visão global + ferramentas de cenário claramente rotuladas. |
| **Carrier** | Frota própria + deals como `carrierId`; policy `approved` onde aplicável (`docs/SECURITY-PRODUCT-DECISIONS.md`). |
| **Governo/operação** | **◇** role institucional ou módulo separado com **agregação mínima** para não expor estratégia de players individuais. |
| **Sem vazar séries brutas** | Preferir servidor agregador a baixar coleções inteiras no browser **◇**. |

---

## 11. Riscos de interpretação de dados

| Risco | Mitigação |
|-------|-----------|
| **Mock ≠ realidade** | Rótulo fixo “dados demonstrativos”; cenários mudam volumes. |
| **Tendências fictícias** | Não exibir variação percentual sem série real **◇**. |
| **Aberta vs concluída** | ADR ou tabela versionada de definições junto ao KPI. |
| **Tempo médio sem datas ISO** | Ocultar ou marcar “indisponível” até modelo temporal existir. |
| **Privacidade / anti-truste** | Agregações regionais com k-anonymidade ou limiar **◇**. |
| **Impacto ambiental** | `co2Saving` como narrativa até metodologia auditável **◇**. |
| **Documentação pendente** | Duas camadas (lista vs arquivo armazenado) — KPI deve declarar escopo (`docs/DOCUMENTS-MODULE.md`). |
| **Alertas falsos positivos** | Calibragem e feedback humano **◇**. |

---

## 12. Testes recomendados

**◇** Quando houver implementação — sem obrigar mudanças neste commit de documentação.

| Camada | Foco |
|--------|------|
| **Unitário** | Funções de agregação: filtros por `ownerId`, `shipperId`, `carrierId`; contagens por status; distribuição por `kind` em rastreio. |
| **Integração** | API de resumo: `401`/`403`, payload estável, erros padronizados (`docs/API-SECURITY-AUDIT.md`). |
| **i18n** | Labels e disclaimers em `pt-BR`, `en`, `es`. |
| **E2E** | Smoke por persona quando login/fixtures estáveis (`docs/E2E-PLAYWRIGHT.md`). |
| **Contratos de definição** | Testes ou fixtures que fixem “o que conta como negociação aberta”. |

---

## 13. Roadmap incremental

1. **◇ Congelar definições de KPI** — Glossário numérico + filtros por papel (este doc como base).
2. **◇ Agregações server-side + testes unitários** — Sobre mock/repositório; compartilhar com governo.
3. **◇ API `GET /api/dashboard/summary` (ou equivalente)** — Auth + escopo + testes de integração.
4. **◇ UI por persona** — Começar por uma persona (ex.: shipper); depois carrier, admin; governo alinhado à página existente.
5. **◇ Alertas MVP** — Contadores (`delay_reported`, pendências doc heurísticas).
6. **◇ Temporalidade real** — Campos de data → tempo médio, filtros por período.
7. **◇ Impacto integrado** — Uma única implementação numérica entre dashboard e impacto/governo.
8. **◇ E2E e políticas de rota** — Endurecer middleware quando KPIs deixarem de ser apenas demo.

---

## 14. Critérios de pronto

Considera-se **◇ implementação futura “pronta” para Release 1 do dashboard executivo** quando:

1. **Definições** — Cada KPI em uso tem texto de produto (“inclui / exclui”) referenciado na UI ou doc linkável.
2. **Escopo** — KPIs respeitam papel e participação; não há lista sensível enviada ao cliente só para agregar no browser **◇**.
3. **Dados** — Fontes documentadas (mock ou DB); timestamps suficientes para qualquer métrica temporal **exibida**.
4. **Segurança** — APIs agregadoras alinhadas às recomendações em `docs/API-SECURITY-AUDIT.md` **◇**.
5. **Qualidade** — `npm run lint`, `npm run typecheck`, `npm run check:i18n`, testes relevantes (unit/integration/E2E conforme escopo do PR).
6. **Acessibilidade** — Hierarquia de títulos, textos alternativos para ícones de estado, contraste nos cards **◇**.
7. **Honestidade** — Disclaimers visíveis onde dados forem demonstrativos ou parciais.

---

## Referências de código (✓ tijolos existentes — não equivalência ao produto final)

- `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`
- `src/features/government/components/government-dashboard/government-dashboard.tsx`
- `src/features/marketplace/services/marketplace.service.ts`
- `src/shared/server/mock-db.ts`, `src/shared/server/mock-scenarios.ts`
- APIs: `src/app/api/cargas`, `negociacoes`, `embarcacoes`, `rastreio`, `mock-mode`
