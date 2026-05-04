# Planejamento de banco real para produção — HydroRivers

**Tipo:** documentação apenas — **sem** implementação de banco, **sem** ORM, **sem** alteração obrigatória de código neste arquivo.

**Público:** desenvolvedores novos no projeto e revisores de arquitetura.

**Base:** domínios em `src/features`, `.mock-data/*.json`, `docs/REPOSITORY-BOUNDARY.md`, `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`, `docs/DEVELOPER-AI-ONBOARDING.md`, `docs/TRACKING-TIMELINE.md`, `docs/DOCUMENTS-MODULE.md` (módulo de documentos é **roadmap**, não produto finalizado).

---

## 1. Objetivo da migração para banco real

### Por que sair gradualmente do `.mock-data`

| Motivo | Explicação didática |
|--------|---------------------|
| **Concorrência e consistência** | Arquivos JSON no disco não são um bom substituto para **transações** (ex.: criar negociação e atualizar status da carga ao mesmo tempo). Em produção, duas escritas simultâneas podem corromper ou perder dados. |
| **Auditoria e compliance** | Operações hidroviárias precisam de **histórico confiável**, timestamps em UTC e trilhas que um arquivo mock atualizado “na mão” não garante. |
| **Autorização real** | O projeto já documenta que **GETs amplos sem sessão** são risco (`docs/API-SECURITY-AUDIT.md`). Com banco real, filtros por **dono**, **participante** e **papel** ficam nas queries — não apenas na boa vontade do handler. |
| **Escalar times e ambientes** | Staging, preview e produção precisam de **mesmo modelo de dados**, não cópias divergentes de JSON local. |

### Por que manter mock para demo e testes

- **Velocidade local:** clone → `npm install` → subir app sem Postgres é ótimo para UX de desenvolvimento (vide fluxo em `docs/DEVELOPER-AI-ONBOARDING.md`).
- **Testes automatizados:** a suíte Vitest atual pode continuar usando **adapter mock** rápido e determinístico; CI opcional adiciona Postgres depois.
- **Cenários controlados:** `mock-mode` e seeds reproduzem estados específicos para QA sem poluir banco compartilhado — desde que o **contrato dos repositórios** seja o mesmo nos dois adapters.

Conclusão: o alvo não é “apagar mock amanhã”, e sim **introduzir banco real atrás da mesma porta** (`getRepositories()`), com **feature flag** ou variável de ambiente, até o rollout estar maduro.

---

## 2. Estratégia recomendada

### Usar repository boundary

Handlers HTTP devem falar com **interfaces de repositório** (`CargoesRepository`, `VesselsRepository`, …), não com SQL nem `readMock` espalhado. Estado atual documentado em `docs/REPOSITORY-BOUNDARY.md` — **em evolução:** por exemplo **`GET /api/cargas`** e **`GET /api/embarcacoes`** já passam por `getRepositories()`; outras rotas ainda acessam `mock-db` diretamente até migração incremental.

### Manter mock adapter

`createMockRepositories()` (ou nome equivalente) continua delegando para `readMock` / `writeMock`. Isso preserva:

- testes de integração que mockam `@/shared/server/mock-db`;
- demos sem infraestrutura.

### Criar database adapter futuro

Nova implementação `createPostgresRepositories()` (nome ilustrativo) que satisfaz os **mesmos tipos TypeScript** dos repositórios. Queries podem ser SQL textual ou um query builder **leve** — **fora do escopo deste doc** definir biblioteca; o princípio é **uma implementação por ambiente**, não IF espalhado no handler.

### Evitar API acoplada ao banco

O contrato público permanece **JSON estável** (`{ data: [...] }`, códigos HTTP da auditoria). Detalhes de colunas, índices e joins **não vazam** para o cliente. Versionamento de schema é problema de **migrations**, não de breaking change na UI sem necessidade.

---

## 3. Modelo relacional inicial

Visão **normalizada inicial** para Postgres (ou compatível). Nomes em **snake_case** no SQL; API pode continuar em **camelCase** via mapeamento na camada de repositório ou DTO.

| Tabela | Papel |
|--------|--------|
| **`users`** | Identidade HydroRivers: papel (`shipper` \| `carrier` \| `admin`), `approved`, credenciais ou vínculo futuro a provedor OAuth (**roadmap** detalhado de auth forte). |
| **`cargoes`** | Demandas do marketplace (origem, destino, tipo, status operacional, metadados). Dono da publicação = **`owner_id`** → `users` (**decisão de produto** em `SECURITY-PRODUCT-DECISIONS.md`). |
| **`vessels`** | Frota; dono típico = transportador (`owner_id`). Campos espelham `Vessel` no TypeScript (com possível deprecação do texto `owner` legado em favor da FK). |
| **`negotiations`** | Liga **uma carga** e **uma embarcação** a **shipper** e **carrier**, com estágio e valores. |
| **`tracking_events`** | Linha do tempo operacional; opcionalmente ligada a `cargo` e/ou `negotiation`; campos auditáveis alinhados a `docs/TRACKING-TIMELINE.md`. |
| **`documents`** (**futura**) | Metadados de arquivos + referência a storage; política em `docs/DOCUMENTS-MODULE.md` — **não implementado** como upload completo no estado atual do produto. |

**Impacto** e **painéis institucionais** podem continuar derivados por **views** ou agregações sobre estas tabelas em fases posteriores — não é obrigatório uma tabela “impact” separada no primeiro schema.

---

## 4. Campos sugeridos por tabela

Abaixo: campos **mínimos sugeridos** + principais do domínio. Lista pode crescer via migrações; `jsonb` absorve estruturas ainda fluidas no mock (`history`, `required_documents`).

### `users`

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | `uuid` PK (ou `text` numa fase intermediária «a confirmar») | |
| `email` | `text` UNIQUE, armazenar lowercase | |
| `name`, `company` | `text` | |
| `role` | `text` CHECK (`shipper`,`carrier`,`admin`) | |
| `approved` | `boolean` NOT NULL DEFAULT false | Política shipper/carrier em `SECURITY-PRODUCT-DECISIONS.md` |
| `password_hash` | `text` nullable | Roadmap: OAuth/passkeys pode substituir |
| `avatar_url`, `phone`, `city` | `text` nullable | |
| `created_at`, `updated_at` | `timestamptz` | |

### `cargoes`

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | PK | |
| `owner_id` | FK → `users(id)` NOT NULL (**alvo produção**) | |
| `title`, `origin`, `destination`, `volume`, `window` | `text` | |
| `cargo_type`, `status`, `target_price`, `co2_saving` | `text` | `status` alinhado ao enum de domínio |
| `product_family`, `corridor`, `connectivity`, … | `text` ou enums | Ver `Cargo` em TypeScript |
| `required_documents`, `operational_risks` | `jsonb` | Até migrar para `documents` |
| `created_at`, `updated_at` | `timestamptz` | |

### `vessels`

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | PK | |
| `owner_id` | FK → `users(id)` | Transportador |
| `name`, `route`, `capacity`, `eta`, `status` | `text` | |
| `certifications`, `amenities` | `jsonb` | Opcional |
| `created_at`, `updated_at` | `timestamptz` | |

### `negotiations`

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | PK | |
| `cargo_id` | FK → `cargoes(id)` | |
| `vessel_id` | FK → `vessels(id)` | |
| `shipper_id`, `carrier_id` | FK → `users(id)` | Participant check nas APIs |
| `stage`, `status`, `amount`, `cargo_title`, `vessel_name`, `last_update` | `text` | `history`, `documents` em `jsonb` até normalizar |
| `created_at`, `updated_at` | `timestamptz` | |

### `tracking_events`

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | PK | |
| `cargo_id`, `negotiation_id` | FK nullable | Pelo menos um contexto quando regra exigir |
| `title`, `description`, `location`, `timestamp` | `text` | `timestamp` pode ser label humana legacy |
| `status` | `text` CHECK (`done`,`current`,`pending`) | |
| `kind` | `text` nullable | Valores `OperationalTrackingEventKind` |
| `actor_id` | FK nullable | |
| `actor_role`, `evidence` | `text` | |
| `occurred_at`, `recorded_at` | `timestamptz` nullable | Auditoria |
| `evidence_document_id` | `uuid` nullable | Ligação futura a `documents` |
| `metadata` | `jsonb` | |
| `created_at` | `timestamptz` | |

### `documents` (**futura** — roadmap)

| Campo | Tipo sugerido | Notas |
|-------|----------------|-------|
| `id` | PK | |
| `entity_type`, `entity_id` | vínculo polimórfico | cargo / vessel / negotiation / tracking_event |
| `document_type`, `name`, `status` | `text` | |
| `storage_key` | `text` | Bucket privado; URL assinada na leitura |
| `uploaded_by` | FK → `users` | |
| `created_at`, `updated_at` | `timestamptz` | |

---

## 5. Relacionamentos

| Origem | Destino | Cardinalidade | Significado |
|--------|---------|----------------|-------------|
| `users` | `cargoes` | **1:N** | Um embarcador (ou política futura) **publica** várias cargas (`owner_id`). |
| `users` | `vessels` | **1:N** | Um transportador **possui** várias embarcações (`owner_id`). |
| `cargoes` | `negotiations` | **1:N** | Uma carga pode ter várias negociações ao longo do tempo (versões/concorrentes — **«a confirmar»** regra de unicidade). |
| `vessels` | `negotiations` | **1:N** | Uma embarcação pode aparecer em várias negociações. |
| `negotiations` | `tracking_events` | **1:N** | Eventos ligados ao deal. |
| `cargoes` | `tracking_events` | **1:N** | Eventos ligados à carga mesmo sem negociação explícita. |
| Entidades negócio | `documents` | **1:N** (**futuro**) | Anexos por carga/embarcação/negociação/evento. |

**Nota:** `shipper_id` e `carrier_id` em `negotiations` conectam **dois usuários** à mesma linha — não é uma N:M separada na primeira versão; basta integridade referencial e índices.

---

## 6. Regras de autorização por entidade

Consolidado com a **matriz alvo** da auditoria e decisões de produto (**nem todo comportamento está pleno no código mock** — isto é o norte para quando houver banco).

### Papéis base

- **`admin`:** operações de plataforma, moderação, auditoria; **não** deve ser autor operacional de negociação em produção (`SECURITY-PRODUCT-DECISIONS.md`).
- **`shipper`:** dono típico das **cargas** que publica; participa como `shipper_id` nas negociações.
- **`carrier`:** dono típico das **embarcações**; propõe fretes; sujeito a **`approved`** antes de certas mutações.

### Por entidade

| Entidade | Leitura (produção alvo) | Escrita |
|----------|-------------------------|---------|
| **User** | Perfil próprio; admin conforme política | Update perfil sem mudar `role`/`approved`/segredo por payload público |
| **Cargo** | Escopo por **`owner_id`** + políticas institucionais; eliminar lista global sensível (`API-SECURITY-AUDIT.md`) | Shipper (e políticas); **`owner_id` obrigatório** na persistência alvo |
| **Vessel** | Escopo por **`owner_id`** | Dono transportador / admin institucional |
| **Negotiation** | Participantes (`shipper_id`, `carrier_id`) + admin auditoria | POST por **carrier** aprovado (decisão alvo); PATCH só **participant check** |
| **TrackingEvent** | Por `cargo_id` / `negotiation_id` autorizados | Sistema/job ou usuário com permissão; registrar `actor_id` / tempos quando possível |
| **Document** | Por vínculo à entidade + papel (**futuro**) | Upload com confirmação e storage privado (**roadmap**) |

### `mock-mode` separado

Reset de cenários (`POST /api/mock-mode`) é **ferramenta admin/demo**, não substitui mutações de negócio. Em produção real: **desabilitar** ou proteger por ambiente; nunca misturar reset em arquivo com dados de clientes sem isolamento total.

---

## 7. Status e máquinas de estado

Sugestão alinhada aos tipos **já existentes** em TypeScript (`marketplace.types.ts`). Transições exatas devem ser formalizadas num documento de domínio ou ADR antes de enforcement estrito no SQL.

### Cargo (`CargoStatus`)

Valores atuais no código: `open` → `bidding` → `contracting` → `reserved` → `boarded` → `delivered`.

- Sugestão: CHECK constraint ou enum Postgres espelhando esses valores.
- **Máquina:** definir transições válidas (ex.: não voltar de `delivered` para `open` sem fluxo administrativo).

### Embarcação (`VesselStatus`)

`available` \| `route` \| `maintenance`.

### Negociação

- **`stage` (`DealStage`):** `quote` \| `counteroffer` \| `contract` \| `boarding` \| `delivered`.
- **`status` opcional:** `pending` \| `accepted` \| `rejected` \| `cancelled`.

Recomenda-se documentar **matriz estágio × status** aceita antes de triggers ou constraints complexas.

### Evento de rastreio

- **`status` de timeline:** `done` \| `current` \| `pending`.
- **`kind` (`OperationalTrackingEventKind`):** nove valores da timeline auditável (`docs/TRACKING-TIMELINE.md`).

### Documento (**futuro**)

Exemplo genérico até `DOCUMENTS-MODULE.md` fixar: `draft` \| `pending_review` \| `approved` \| `rejected` — **roadmap**, não contrato fechado hoje.

---

## 8. Índices recomendados

Índices aceleram filtros que as APIs de listagem usarão quando **escopadas por usuário**:

| Tabela | Índice sugerido | Motivo típico |
|--------|-----------------|---------------|
| `users` | UNIQUE `lower(email)` | Login e cadastro |
| `users` | `(role)`, `(approved)` | Painéis admin/moderação |
| `cargoes` | `(owner_id)` | “Minhas cargas” |
| `cargoes` | `(status)`, `(corridor)`, `(product_family)` | Marketplace filtrado |
| `vessels` | `(owner_id)`, `(status)` | Frota do carrier |
| `negotiations` | `(cargo_id)`, `(vessel_id)`, `(shipper_id)`, `(carrier_id)` | Joins e autorização |
| `negotiations` | `(stage)`, `(status)` | Dashboard comercial |
| `tracking_events` | `(cargo_id)`, `(negotiation_id)` | Timeline por contexto |
| `tracking_events` | `(occurred_at)` ou `(recorded_at)` | Ordenação auditável |
| `tracking_events` | `(kind)` | Filtros por tipo operacional |
| `documents` | `(entity_type, entity_id)` (**futuro**) | Listagem por entidade |

---

## 9. Seed / demo

Objetivo: **paridade perceptível** entre demo mock e demo em banco, sem obrigar desenvolvedor a editar SQL na mão.

1. **Fonte:** dados atuais em `marketplace.mock.ts`, `auth.mock`, `mock-scenarios.ts` e JSON em `.mock-data/` — são **referência**, não verdade eterna.
2. **Script futuro** `seed:demo` (nome ilustrativo): idempotente (`UPSERT` por email em `users`, por `id` estável nas demais tabelas).
3. **Usuários demo:** mesmos papéis/senhas de demo que o README documenta para não quebrar histórias de QA (**atenção:** senhas apenas em ambientes não produtivos).
4. **Cenários:** equivalente aos cenários de `mock-mode` pode virar **conjuntos de seed nomeados** (`demo-base`, `demo-atraso`, …) — **roadmap** de ferramentas.
5. **Testes:** manter **Vitest com mock** como linha principal; pipeline opcional com Postgres para detectar divergência de schema (**fase 6** abaixo).

---

## 10. Migração incremental

Ordem pensada para **reduzir regressões** e permitir rollback conceitual (voltar adapter mock).

| Fase | Nome | Entrega principal |
|------|------|-------------------|
| **1** | Repository boundary completa | Todas as rotas relevantes em `src/app/api` passam por **`getRepositories()`** — sem `readMock`/`writeMock` soltos nos handlers (auth pode ser última fatia). Estado atual **parcial** — ver `REPOSITORY-BOUNDARY.md`. |
| **2** | Schema | Migrations versionadas criando tabelas + FKs + índices mínimos; **sem** dados de cliente real ainda. |
| **3** | Adapter database | `createPostgresRepositories()` implementando os mesmos métodos que o mock (começar **read-only** numa entidade piloto). |
| **4** | Seed | Scripts populando demo/staging; documentação de como regenerar. |
| **5** | Feature flag mock/database | Variável tipo `HYDRORIVERS_DATA_SOURCE=mock \| postgres` escolhendo factory em runtime (**servidor apenas**). |
| **6** | Testes | Integração contra Postgres opcional em CI; comparar payloads com suite mock; cobrir decisões críticas (`owner_id`, participant check). |
| **7** | Rollout | Staging estável → produção com monitoramento, backup, plano de rollback (voltar flag para mock **apenas em emergência de código**, não como estratégia de dados). |

**Documentação / IA:** uso de dados estruturados por IA assistiva (**roadmap**, `docs/AI-ROADMAP.md`) só deve entrar **depois** que leituras escopadas e auditoria estiverem sólidas — não são pré-requisito da Fase 2 de schema.

---

## 11. Riscos

| Risco | O que pode dar errado | Mitigação |
|-------|------------------------|-----------|
| **Quebra de testes** | Troca de adapter sem mocks atualizados | Manter contratos de repositório estáveis; CI verde antes de merge |
| **Divergência mock vs banco** | Mesmo endpoint retorna shapes diferentes | Testes de contrato JSON; DTO único na camada de repositório |
| **Autorização incorreta** | Filtro SQL esquecido expõe dados alheios | Revisão cruzada com `API-SECURITY-AUDIT.md`; testes de integração negativos (`403`) |
| **Dados órfãos** | FK ausente ou cascade errado | Política explícita: RESTRICT vs soft-delete; jobs de saneamento |
| **Migração sem rollback** | Migration irreversível em produção | Migrations reversíveis quando possível; backup antes de rollout |
| **Exposição de dados** | URLs públicas em storage ou GET sem auth | Storage privado; DTO sanitizado; revisão de segurança |

---

## 12. Critérios de pronto para “iniciar banco real”

O projeto está **pronto para começar a Fase 2 (schema)** quando:

1. **Boundary:** prioridade acordada para eliminar acessos diretos ao mock nos handlers-alvo (`REPOSITORY-BOUNDARY.md` próximo de completo para marketplace).
2. **Decisões de produto:** `owner_id`, participant check e papel em `POST /api/negociacoes` **implementados ou explicitamente aceitos** como débito com PR marcado (`SECURITY-PRODUCT-DECISIONS.md`).
3. **Ambiente:** definido provedor Postgres (RDS, Neon, Supabase, etc.) em ADR separado — **fora deste arquivo**.
4. **Time:** responsável por migrations e revisão de schema nomeado; rollback documentado em um runbook curto.

“Pronto para **produção** com dados reais” exige adicionalmente Fases **3–7**, auth forte, backups e endurecimento da matriz da auditoria.

---

## 13. Próximos PRs recomendados

PRs **pequenos** após esta documentação (sem obrigatoriedade de ordem rígida, mas sensatos):

1. Completar **`NegotiationsRepository`** + mover `GET/PATCH` negociações para repositório (sem mudar JSON).
2. Completar **`CargoesRepository.upsert`** + migrar **`POST /api/cargas`** do `upsertCargo` direto.
3. **`TrackingEventsRepository`** + migrar **`GET /api/rastreio`**.
4. Extrair leituras de **`users`** para repositório usado por login/register (**compatível com decisões de segurança**).
5. ADR: provedor Postgres + política de migrações (`squash` vs linear).
6. Esboço de migration **vazia** ou só extensões (`uuid-ossp`) validado em CI — **sem dados**.
7. Atualizar **`docs/REPOSITORY-BOUNDARY.md`** após cada fatia para não drift entre código e doc.

---

## Referências

| Documento | Uso |
|-----------|-----|
| `docs/REPOSITORY-BOUNDARY.md` | Estado atual do boundary |
| `docs/API-SECURITY-AUDIT.md` | Riscos de exposição |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | `approved`, `ownerId`, admin × negociação |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Fluxo novo dev + checklist |
| `docs/TRACKING-TIMELINE.md` | Eventos auditáveis |
| `docs/DOCUMENTS-MODULE.md` | Documentos — **roadmap** |
| `docs/AI-ROADMAP.md` | IA assistiva — **roadmap**, não pré-requisito do schema |

---

*Este plano não substitui parecer jurídico/DPO nem especificação de infraestrutura; revise antes de dados pessoais reais.*
