# Planejamento — Dashboard executivo (HydroRivers)

Documento de **planejamento apenas**: não descreve implementação concluída. Objetivo é alinhar KPIs por perfil, fontes de dados atuais, superfície de UI/API e ordem segura de evolução.

## Contexto atual relevante

- Já existe **`/[locale]/dashboard`** com `DashboardOverview` (métricas agregadas via `getMarketplaceSummary` + listagens) e `NegotiationBoard`.
- Existe **`/[locale]/governo`** com `GovernmentDashboard` (métricas derivadas de cargas/embarcações/negociações mock).
- Dados operacionais vêm de **`readMock`** sobre `.mock-data/*.json` alimentados pelos seeds e cenários (`mock-scenarios`, reset via mock-mode para admin).
- **Perfis** no domínio de auth: `admin`, `shipper`, `carrier` (`UserRole`). “Governo/operação” **não é role técnico** hoje; corresponde ao uso da área `/governo` e audiências institucionais (planejar como persona + eventual flag ou role futura).

---

## 1. KPIs por perfil

Legenda dos KPIs candidatos:

| KPI | Significado operacional |
|-----|-------------------------|
| **Cargas publicadas** | Volume de cargas no marketplace (total ou filtrado por estado). |
| **Negociações abertas** | Negociações em estágio inicial / não encerradas (`pending`, estágios precotrativos). Definição precisa a fechar no domínio. |
| **Negociações concluídas** | Negociações em estágio terminal aceito / entregue (alinhar com `stage`, `status`). |
| **Embarcações disponíveis** | `vessel.status === 'available'` (ou capacidade livre futura). |
| **Tempo médio de negociação** | Duração entre primeiro evento e fechamento — **hoje não há timestamps ISO confiáveis** em todos os registros (`lastUpdate` é texto humano). |
| **Eventos de rastreio** | Contagem ou série temporal de `trackingEvents` (por carga/negociação ou globais). |
| **Impacto regional** | Indicadores ligados a corredores, CO₂, valor público — hoje parcialmente narrativo/mock (`co2Saving`, páginas de impacto). |

### Admin

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Visão global; útil para operação da plataforma e cenários QA. |
| Negociações abertas / concluídas | Alta | Monitoramento de funil; pode cruzar com mock-mode. |
| Embarcações disponíveis | Média | Capacidade aparente do sistema mock. |
| Tempo médio de negociação | Baixa (até modelo de dados melhorar) | Exige definir datas reais ou campo dedicado. |
| Eventos de rastreio | Média | Volume e eventual SLA de sincronização (demo). |
| Impacto regional | Média | Agregações por corredor / família de produto (reuso de lógica similar à página governo). |

### Shipper (embarcador)

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Filtrar por **`ownerId` = usuário sessão** quando aplicável. |
| Negociações abertas | Alta | Onde shipper é **`shipperId`**. |
| Negociações concluídas | Alta | Mesmo filtro participativo. |
| Embarcações disponíveis | Média | Contexto de mercado (pode ser global ou filtrado por corredor das cargas do shipper). |
| Tempo médio de negociação | Média | Apenas sobre negociações do shipper; depende de dados temporais. |
| Eventos de rastreio | Alta | Ligados às **cargas** do shipper (timeline resumida em KPI). |
| Impacto regional | Média | Destaque de CO₂ / narrativa das próprias cargas (`co2Saving`, corredor). |

### Carrier (transportador)

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Baixa/Média | Mercado relevante (não “suas” cargas); opcional como benchmark anonimizado. |
| Negociações abertas / concluídas | Alta | Filtrar por **`carrierId`** ou embarcações do carrier (`ownerId` vs vessel). |
| Embarcações disponíveis | Alta | Frota própria: disponíveis vs em rota / manutenção. |
| Tempo médio de negociação | Média | Somente deals onde participa. |
| Eventos de rastreio | Alta | Associados a negociações/cargas em que atua. |
| Impacto regional | Baixa | Opcional (mensagens ESG institucionais). |

### Governo / operação (persona institucional)

| KPI | Prioridade | Observação |
|-----|------------|------------|
| Cargas publicadas | Alta | Por corredor, tipo de produto, conectividade. |
| Negociações abertas / concluídas | Alta | Panorama setorial (sem exposição de PII — ver riscos). |
| Embarcações disponíveis | Média | Capacidade regional agregada. |
| Tempo médio de negociação | Média | Indicador de atrito regulatório/operacional se dados permitirem. |
| Eventos de rastreio | Alta | Visibilidade de fluxo físico e pontos de atraso (demo). |
| Impacto regional | Alta | Central para narrativa pública (reuso + KPIs tipo governo atual: bioeconomia, baixo sinal, sazonalidade). |

---

## 2. Fonte dos dados atuais

| Necessidade | Fonte atual no código | Observações |
|-------------|----------------------|-------------|
| Cargas | `readMock('cargoes')` → `listCargoes()` | Inclui `status`, `ownerId`, `corridor`, `co2Saving`, `productFamily`, `connectivity`, etc. |
| Negociações | `readMock('negotiations')` → `listNegotiations()` | `stage`, `status`, `shipperId`, `carrierId`, `cargoId`, `lastUpdate` (texto). |
| Embarcações | `readMock('vessels')` → `listVessels()` | `status`, `ownerId`, corredor. |
| Rastreio | `readMock('trackingEvents')` → `listTrackingEvents()` | Tipos operacionais (`kind`) na evolução recente do domínio. |
| Usuário / papel | Sessão mock (`getSessionUser`) | Para escopo por perfil na UI ou API. |
| Impacto narrativo | Páginas `impacto`, conteúdos mock/i18n | KPI “impacto regional” pode combinar métricas de cargas + conteúdo editorial até haver série histórica real. |
| Agregações já usadas | `getMarketplaceSummary()` | Contagens simples; tendências tipo `+18%` são **placeholder estático**, não série temporal. |

**Lacuna crítica para “tempo médio de negociação”:** ausência de `createdAt` / `closedAt` normalizados nas negociações no mock atual.

---

## 3. Componentes necessários (planejados)

| Componente | Função | Relação com o existente |
|------------|--------|-------------------------|
| **`ExecutiveKpiStrip` ou extensão de métricas** | Linha de cartões KPI por persona | Reuso de padrão visual de `DashboardOverview` / `GovernmentDashboard` (`Card`, `HydroIcon`). |
| **`ExecutiveAggregationService` (server)** | Funções puras ou serviço server-only que calculam KPIs a partir de listas mock (e futuro repositório/DB) | Evitar duplicar lógica entre dashboard shipper/carrier/admin/governo. |
| **`RoleScopedDashboardLayout`** | Decide quais KPIs/blocos renderizar conforme `role` | Pode ser composição na `dashboard/page.tsx` ou sub-rota. |
| **`NegotiationFunnelSummary`** | Abertas vs concluídas com definições explícitas | Derivado de `negotiations` filtradas. |
| **`TrackingVolumeSparkline` ou contador** | Eventos por período | Opcional na fase 1: apenas contagem total + últimos N eventos. |
| **`RegionalImpactPanel`** | CO₂ agregado, corredores, famílias de produto | Espelhar/recortar ideias de `GovernmentDashboard` sem duplicar strings (i18n). |

Não é obrigatório criar biblioteca de gráficos na primeira entrega; contagens + tabelas compactas atendem MVP executivo mock.

---

## 4. Rotas afetadas

| Rota | Impacto provável |
|------|------------------|
| **`/[locale]/dashboard`** | Principal candidata a ganhar variantes por role ou bloco “executivo” condicional. |
| **`/[locale]/governo`** | Possível alinhamento de KPIs com o mesmo serviço de agregação (uma fonte da verdade para números institucionais). |
| **`/[locale]/admin`** | Admin pode ver KPI globais + links para mock-mode e cenários (apenas navegação; não misturar reset em KPI). |
| **`/[locale]/impacto`** | Opcional: deep-links “ver impacto no dashboard executivo”. |
| **Middleware (`middleware.ts`)** | Se governo passar a exigir sessão institucional ou admin-only para certos números agregados, **ajustar `privateRoutes`** e política de exposição (decisão de produto). Hoje `/governo` é pública. |
| **APIs (`src/app/api/*`)** | Opcional criar **`GET /api/dashboard/summary`** (autenticado, escopo por role) para não expor todo o dataset ao cliente — recomendado antes de dados sensíveis reais. |

---

## 5. Testes necessários

| Camada | O quê testar |
|--------|----------------|
| **Unitário** | Funções de agregação (contagens por status, filtros por `ownerId`/`shipperId`/`carrierId`, exclusão de registros inconsistentes). |
| **Integração** | Se existir API dedicada: `401` sem sessão, `403` quando perfil não autorizado ao escopo, payload estável (`error` padronizado como no restante do projeto). |
| **i18n** | Todas as etiquetas/descrições de KPI novas em `pt-BR`, `en`, `es`; rodar `npm run check:i18n`. |
| **E2E (fase tardia)** | Smoke: usuário shipper vê apenas seus números; admin vê globais — depende de fixtures de login estáveis. |

---

## 6. Riscos de interpretação

| Risco | Detalhe |
|-------|---------|
| **Dados mock ≠ produção** | Contagens mudam com cenários (`mock-mode`); usuários podem interpretar como mercado real. |
| **Tendências fictícias** | Campos tipo `+18%` em cards atuais não são calculados; repetir isso no executivo seria enganoso sem série temporal. |
| **Definição ambígua de “aberta/concluída”** | `stage` vs `status` podem divergir; precisa contrato único documentado ao lado do KPI. |
| **Tempo médio de negociação** | Sem timestamps ISO, qualquer média será **heurística ou mock** até migração de dados (`docs/DATABASE-PLANNING.md`). |
| **Vazamento de informação agregada** | KPIs globais em governo público podem revelar estratégia de players se granularidade for alta (ex.: corredor único). |
| **Impacto regional** | Misturar “CO₂ médio das cargas mock” com narrativa institucional pode ser mal lido como auditoria oficial sem disclaimers. |

Recomenda-se **rótulo de contexto** na UI (“dados demonstrativos”) até backend real e políticas de privacidade estarem definidos.

---

## 7. Ordem segura de implementação

1. **Contrato de KPI no domínio** — Documentar definições matemáticas (o que conta como negociação aberta/concluída; como filtrar por papel). Sem código de UI ainda ou mudança mínima.
2. **Camada de agregação server-side** — Implementar funções puras + testes unitários contra fixtures (`readMock` ou snapshots pequenos); opcionalmente extrair para serviço reutilizável por dashboard e governo.
3. **`GET /api/dashboard/summary` (ou nome equivalente)** — Resposta já escopada por sessão; integração testando auth e formato JSON estável.
4. **UI incremental em `/dashboard`** — Primeiro apenas **uma persona** (ex.: shipper) para validar filtros; depois carrier; admin; governo pode consumir mesma API com política diferente ou página dedicada.
5. **KPIs avançados** — Tempo médio de negociação e séries temporais **somente após** campos de data normalizados ou fonte externa confiável.
6. **Impacto regional integrado** — Reuso de métricas já pensadas em governo + cargas; evitar duplicar números divergentes entre páginas.
7. **E2E e endurecimento** — Depois que login e dados por usuário estiverem estáveis; considerar restringir `/governo` se KPIs tornarem-se sensíveis.

---

## Referências internas

- Dashboard atual: `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx`
- Governo: `src/features/government/components/government-dashboard/government-dashboard.tsx`
- Serviços mock: `src/features/marketplace/services/marketplace.service.ts`
- Auditoria de APIs / exposição pública: `docs/API-SECURITY-AUDIT.md`
- Planejamento de persistência futura: `docs/DATABASE-PLANNING.md`
- Timeline de rastreio (eventos): `docs/TRACKING-TIMELINE.md`
