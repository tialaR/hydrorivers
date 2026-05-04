# Dashboard executivo — planejamento (HydroRivers)

Documento **somente de planejamento**: não descreve UI implementada nem código entregue neste arquivo. Serve para alinhar objetivos, KPIs por perfil, fontes de dados, superfície de produto e evolução incremental.

---

## 1. Objetivo do dashboard

Oferecer uma **visão consolidada e escopada por perfil** sobre o estado do marketplace hidroviário na HydroRivers: volume de cargas e negociações, capacidade de frota, rastreio operacional, impacto regional e sinais de alerta — com **definições explícitas de cada métrica** para evitar leituras equivocadas entre dados mock e futura produção.

Sucesso imediato (fases iniciais): o mesmo conjunto de **definições de KPI** pode ser calculado no servidor a partir dos mocks atuais e, depois, substituído por persistência real sem mudar o contrato mental do usuário.

---

## 2. KPIs por perfil

Legenda dos KPIs candidatos:

| KPI | Significado operacional |
|-----|-------------------------|
| **Cargas publicadas** | Volume de cargas no marketplace (total ou por filtros). |
| **Negociações abertas** | Negociações não encerradas; definir contrato único (`stage` / `status`). |
| **Negociações concluídas** | Negociações em estado terminal aceito / encerrado com sucesso (alinhar ao domínio). |
| **Embarcações disponíveis** | Frota com `status` indicando disponibilidade (ex.: `available`). |
| **Tempo médio de negociação** | Duração entre início e fechamento; **depende de timestamps normalizados** (hoje limitado no mock). |
| **Eventos de rastreio** | Contagem ou série temporal de eventos (`trackingEvents`), opcionalmente por carga/negociação. |
| **Impacto regional** | Agregações por corredor, família de produto, CO₂ narrativo (`co2Saving`), conectividade — combinável com conteúdo de impacto institucional. |
| **Alertas operacionais** | Condições que merecem destaque: atrasos (`delay_reported`), pendências documentais, sincronização tardia, SLA de rastreio, inconsistências de dados — podem começar como **contadores derivados do mock** e evoluir para fila de alertas real. |

### Admin

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Visão global da plataforma; útil para operação e cenários de QA (`mock-mode`). |
| Negociações abertas / concluídas | Alta | Funil global; comparável entre cenários mock. |
| Embarcações disponíveis | Média | Capacidade aparente agregada. |
| Tempo médio de negociação | Baixa até modelo temporal existir | Exige `createdAt` / `closedAt` ou equivalente. |
| Eventos de rastreio | Média | Volume global e eventual distribuição por `kind`. |
| Impacto regional | Média | Por corredor / tipo de produto (reuso de ideias da área governo). |
| Alertas operacionais | Alta | Vista única de exceções (atrasos, pendências, volumes anômalos). |

### Shipper (embarcador)

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Escopo **suas cargas** (`ownerId` ou equivalente na sessão). |
| Negociações abertas / concluídas | Alta | Onde o shipper é participante (`shipperId`). |
| Embarcações disponíveis | Média | Contexto de mercado (global ou restrito aos corredores das cargas do usuário). |
| Tempo médio de negociação | Média | Apenas deals do shipper; depende de datas confiáveis. |
| Eventos de rastreio | Alta | Ligados às cargas/negociações do shipper. |
| Impacto regional | Média | CO₂ / corredores das próprias cargas. |
| Alertas operacionais | Alta | Ex.: documentação pendente, atraso na viagem das suas cargas. |

### Carrier (transportador)

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Baixa/Média | Benchmark de mercado (não necessariamente “minhas cargas”). |
| Negociações abertas / concluídas | Alta | Participação como `carrierId` / frota associada. |
| Embarcações disponíveis | Alta | Frota própria: disponíveis vs em uso / indisponíveis. |
| Tempo médio de negociação | Média | Apenas onde o carrier participa. |
| Eventos de rastreio | Alta | Negociações e cargas sob sua operação. |
| Impacto regional | Baixa | Opcional (mensagens ESG). |
| Alertas operacionais | Alta | Embarques, janelas de atracação, atrasos reportados nas rotas ativas. |

### Governo / operação (persona institucional)

Esta persona usa hoje sobretudo **`/[locale]/governo`**; **não há role técnico dedicado** no mesmo nível que `admin` | `shipper` | `carrier` — planejar como audiência institucional (eventual role ou política de acesso futura).

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Por corredor, tipo de produto, conectividade. |
| Negociações abertas / concluídas | Alta | Panorama setorial; cuidado com **granularidade e privacidade**. |
| Embarcações disponíveis | Média | Capacidade regional agregada. |
| Tempo médio de negociação | Média | Indicador de atrito operacional quando dados permitirem. |
| Eventos de rastreio | Alta | Fluxo físico, pontos de atraso, visibilidade de corredor. |
| Impacto regional | Alta | Narrativa pública (bioeconomia, sazonalidade, métricas ambientais — alinhado ao que já existe na visão governo). |
| Alertas operacionais | Alta | Indicadores de risco sistêmico (corredores congestionados, picos de pendência documental agregados — sempre com limiar definido). |

---

## 3. Fonte dos dados atuais

| Necessidade | Fonte no projeto | Observações |
|-------------|------------------|-------------|
| Cargas | `readMock('cargoes')` → `listCargoes()` (`marketplace.service`) | Seeds em `marketplace.mock.ts` + persistência opcional em `.mock-data/cargoes.json`. Campos úteis: `status`, `ownerId`, `corridor`, `co2Saving`, `productFamily`, `connectivity`, etc. |
| Negociações | `readMock('negotiations')` → `listNegotiations()` | `stage`, `status`, `shipperId`, `carrierId`, `cargoId`, `lastUpdate` (muitas vezes texto humano). |
| Embarcações | `readMock('vessels')` → `listVessels()` | `status`, `ownerId`, contexto de corredor quando existir no modelo. |
| Rastreio | `readMock('trackingEvents')` → `listTrackingEvents()` | Eventos com `kind` operacional opcional; ver `docs/TRACKING-TIMELINE.md`. |
| Usuário / papel | Sessão mock (`getSessionUser` e fluxos em `features/auth`) | Base para escopo por perfil em UI/API futuras. |
| Agregações existentes | `getMarketplaceSummary()` | Contagens simples; tendências tipo percentuais em cards podem ser **placeholder** — não assumir série temporal real. |
| Impacto / narrativa | Páginas de impacto, i18n, dados em cargas (`co2Saving`) | KPI “impacto regional” combina agregações de cargas + conteúdo editorial até haver série oficial. |
| Cenários / reset | `POST /api/mock-mode`, `mock-scenarios.ts` | Altera volumes observados; relevante para QA e para disclaimer “dados demonstrativos”. |

**Lacuna explícita:** tempo médio de negociação exige **timestamps ISO** (criação/fechamento) nas negociações — ver planejamento de persistência em `docs/DATABASE-PLANNING.md`.

---

## 4. Fonte dos dados futuros

| Área | Direção pretendida |
|------|---------------------|
| Persistência | Banco relacional ou document store conforme `docs/DATABASE-PLANNING.md`; substituir gradualmente `readMock` por repositórios. |
| APIs dedicadas | Endpoint agregador escopado (ex.: `GET /api/dashboard/summary`) retornando apenas KPIs autorizados ao papel, em vez de enviar coleções completas ao cliente. |
| Temporalidade | Campos `createdAt`, `updatedAt`, `closedAt` em negociações e cargas; possível fonte de eventos de domínio para séries temporais. |
| Rastreio | Escrita auditável de eventos alinhada à timeline operacional; filtros por `cargoId` / `negotiationId` / período. |
| Impacto regional | Integração com dados externos (IBGE, ANTAQ, inventários de carbono) quando houver projeto próprio — hoje fora de escopo técnico neste doc. |
| Alertas operacionais | Motor de regras ou integração com observabilidade (logs, filas); políticas por severidade e canal (in-app, e-mail) — definir em produto/segurança. |

Referência de segurança e exposição: `docs/API-SECURITY-AUDIT.md`.

---

## 5. Componentes necessários (planejados — sem implementação neste doc)

| Componente | Função |
|------------|--------|
| **Camada de agregação server-side** | Funções puras ou serviço server-only que calculam KPIs a partir de listas (mock → futuro repositório); uma fonte da verdade para admin/shipper/carrier/governo. |
| **Faixa ou grade de KPIs executivos** | Cartões por métrica (reuso conceitual de `DashboardOverview` / `GovernmentDashboard`: `Card`, ícones Hydro). |
| **Layout ou composição por papel** | Decidir quais blocos aparecem por `role` (e eventual política para governo). |
| **Resumo de funil de negociações** | Abertas vs concluídas com tooltip ou doc-link para definição formal. |
| **Bloco de rastreio** | Contagem total, últimos N eventos ou série por período quando dados permitirem. |
| **Painel de impacto regional** | Agregações por corredor/família de produto/CO₂; alinhado à página governo para evitar números divergentes. |
| **Centro de alertas (resumo)** | Lista curta ou contadores por tipo de alerta derivados de regras sobre cargas, negociações e `trackingEvents`. |

Primeira entrega pode ser **somente contagens e tabelas compactas**, sem biblioteca de gráficos obrigatória.

---

## 6. Rotas afetadas

| Rota | Relação com o dashboard executivo |
|------|-------------------------------------|
| **`/[locale]/dashboard`** | Principal candidata a concentrar variantes por papel ou blocos condicionais executivos. |
| **`/[locale]/governo`** | Alinhamento de KPIs institucionais com a mesma camada de agregação que alimenta o executivo (evitar duplicar lógica divergente). |
| **`/[locale]/admin`** | Vista global para administradores; links para ferramentas de cenário (`mock-mode`) sem misturar reset com números “oficiais” de KPI. |
| **`/[locale]/impacto`** | Deep-links opcionais (“detalhar impacto”) a partir de métricas agregadas. |
| **`/[locale]/rastreio`** (ou equivalente) | Contexto da timeline operacional; KPI “eventos de rastreio” pode apontar para exploração detalhada. |
| **Middleware (`middleware.ts`)** | Se KPIs agregados sensíveis forem expostos apenas a perfis específicos, ajustar rotas privadas e política de `/governo` (hoje pode ser pública — decisão de produto). |
| **APIs existentes** | `GET /api/cargas`, `GET /api/negociacoes`, `GET /api/embarcacoes`, `GET /api/rastreio` como fontes atuais de dados brutos; futura **`GET /api/dashboard/summary`** (ou nome equivalente) recomendada antes de dados reais sensíveis. |

---

## 7. Filtros necessários

| Filtro | Uso típico |
|--------|------------|
| **Papel na sessão** | Determina escopo automático (shipper → suas cargas/deals; carrier → sua participação e frota). |
| **Intervalo de datas** | Séries temporais, alertas recentes, tempo médio de negociação (quando houver timestamps). |
| **Corredor / hidrovia** | KPIs regionais e visão governo. |
| **Estado da carga** | Aberta, em negociação, etc. (alinhar ao enum/status real). |
| **Estado da negociação** | Aberta vs concluída (contrato explícito no domínio). |
| **Tipo de produto / família** | Impacto e relatórios setoriais. |
| **Disponibilidade de embarcação** | Frota disponível vs ocupada. |
| **Tipo de evento de rastreio (`kind`)** | Distribuição de eventos operacionais (`OperationalTrackingEventKind`). |
| **Severidade de alerta** | Quando o subsistema de alertas existir; MVP pode filtrar por “pendências” vs “atrasos”. |

Para mocks: filtros devem ser **determinísticos** e documentados ao lado da definição do KPI para testes reproduzíveis.

---

## 8. Riscos de interpretação

| Risco | Detalhe |
|-------|---------|
| **Mock ≠ mercado real** | Cenários e `mock-mode` alteram contagens; rótulo “dados demonstrativos” até backend oficial. |
| **Tendências fictícias** | Percentuais de variação em cards podem não ser calculados; não apresentá-los como série temporal sem fonte. |
| **Ambiguidade aberta/concluída** | Divergência entre `stage` e `status` exige contrato único documentado junto ao KPI. |
| **Tempo médio de negociação** | Sem datas ISO consistentes, qualquer média é heurística ou ilustrativa. |
| **Privacidade e anti-truste** | Agregações muito granulares em governo público podem expor estratégia de poucos players. |
| **Impacto ambiental** | `co2Saving` e afins em mock não equivalem a auditoria oficial sem metodologia publicada. |
| **Alertas falsos positivos** | Regras simplificadas sobre texto ou status podem gerar ruído; calibragem contínua necessária. |

---

## 9. Testes necessários

| Camada | O quê cobrir |
|--------|----------------|
| **Unitário** | Funções de agregação: contagens por status, filtros por `ownerId` / `shipperId` / `carrierId`, exclusão de registros inconsistentes, contagem por `kind` em rastreio. |
| **Integração** | API de resumo (quando existir): `401` sem sessão, `403` quando o papel não autoriza o escopo, formato JSON estável e alinhado ao padrão de erros do projeto. |
| **i18n** | Labels e descrições de KPI e alertas em `pt-BR`, `en`, `es`; `npm run check:i18n`. |
| **E2E (fase tardia)** | Smoke por persona: shipper vê apenas escopo próprio; admin vê globais; depende de login/fixtures estáveis. |
| **Contratos de definição** | Testes ou tabela versionada que fixem “o que conta como negociação aberta” para regressão quando o domínio mudar. |

---

## 10. Roadmap incremental

1. **Congelar definições de KPI** — Documento de domínio (ou ADR) com fórmulas e filtros por papel; sem UI obrigatória.
2. **Implementar agregações server-side + testes unitários** — Sobre fixtures pequenas ou `readMock`; funções puras reutilizáveis por dashboard e governo.
3. **API de resumo escopado** — Ex.: `GET /api/dashboard/summary`; testes de integração de auth e payload.
4. **UI por persona em ordem** — Primeiro uma persona (ex.: shipper), depois carrier, admin; governo alinhado à página existente ou extensão controlada.
5. **Alertas operacionais MVP** — Contadores derivados (ex.: eventos `delay_reported`, cargas com documentação pendente) antes de motor complexo.
6. **Temporalidade real** — Após migração de campos de data em negociações/cargas: tempo médio, sparklines e filtros por período.
7. **Impacto regional integrado** — Uma única implementação numérica partilhada entre dashboard executivo e impacto/governo.
8. **E2E e políticas de rota** — Endurecer middleware e permissões quando KPIs deixarem de ser exclusivamente demonstrativos.

---

## Referências internas

- Dashboard atual: `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`
- Governo: `src/features/government/components/government-dashboard/government-dashboard.tsx`
- Serviços mock: `src/features/marketplace/services/marketplace.service.ts`
- Mock DB e cenários: `src/shared/server/mock-db.ts`, `src/shared/server/mock-scenarios.ts`
- APIs: `src/app/api/cargas`, `negociacoes`, `embarcacoes`, `rastreio`, `mock-mode`
- Segurança de APIs: `docs/API-SECURITY-AUDIT.md`
- Persistência futura: `docs/DATABASE-PLANNING.md`
- Timeline de rastreio: `docs/TRACKING-TIMELINE.md`
