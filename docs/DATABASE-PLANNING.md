# Planejamento de Banco Real — HydroRivers

## Objetivo

Planejar a migração gradual do HydroRivers de `.mock-data` para banco real, preservando o modo mock, os testes existentes e a arquitetura atual em Next.js App Router.

Este documento não implementa banco. Ele define o modelo alvo, riscos e ordem recomendada.

## 1. Modelo Relacional

Entidades principais:

- `User`
- `Cargo`
- `Vessel`
- `Negotiation`
- `TrackingEvent`
- `Document` (futura)

Modelo conceitual:

```txt
users 1 ── N cargoes
users 1 ── N vessels
cargoes 1 ── N negotiations
vessels 1 ── N negotiations
users 1 ── N negotiations (como shipper)
users 1 ── N negotiations (como carrier)
cargoes 1 ── N tracking_events
negotiations 1 ── N tracking_events
cargoes 1 ── N documents
vessels 1 ── N documents
negotiations 1 ── N documents
users 1 ── N documents (uploaded_by)
```

## 2. Tabelas

### `users`

Campos recomendados:

- `id uuid primary key`
- `name text not null`
- `email text not null unique`
- `company text not null`
- `role text not null check (role in ('shipper', 'carrier', 'admin'))`
- `approved boolean not null default false`
- `avatar_url text`
- `phone text`
- `city text`
- `password_hash text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Observações:

- `password_hash` existe porque o auth atual é mock. Em auth real, pode ser substituído por provider externo.
- `email` deve ser normalizado para lowercase.

### `cargoes`

Campos recomendados:

- `id uuid primary key`
- `owner_id uuid references users(id)`
- `title text not null`
- `origin text not null`
- `destination text not null`
- `volume text not null`
- `window text not null`
- `cargo_type text not null`
- `status text not null check (status in ('open', 'bidding', 'contracting', 'reserved', 'boarded', 'delivered'))`
- `co2_saving text`
- `target_price text`
- `description text`
- `producer text`
- `temperature text`
- `product_family text`
- `corridor text`
- `main_river text`
- `service_type text`
- `predictability text`
- `eta_confidence text`
- `connectivity text`
- `document_readiness integer`
- `origin_context text`
- `operational_risks jsonb not null default '[]'`
- `required_documents jsonb not null default '[]'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Observações:

- Campos como `requiredDocuments` e `operationalRisks` podem começar como `jsonb` para preservar flexibilidade do mock.
- Em fase posterior, documentos reais devem migrar para a tabela `documents`.

### `vessels`

Campos recomendados:

- `id uuid primary key`
- `owner_id uuid references users(id)`
- `name text not null`
- `route text not null`
- `capacity text not null`
- `eta text`
- `status text not null check (status in ('available', 'route', 'maintenance'))`
- `owner text`
- `image_url text`
- `vessel_type text`
- `year integer`
- `draft text`
- `flag text`
- `certifications jsonb not null default '[]'`
- `amenities jsonb not null default '[]'`
- `sustainability_score text`
- `last_inspection date`
- `corridor text`
- `document_status text`
- `low_connectivity_ready boolean default false`
- `checklist_ready boolean default false`
- `available_from timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `negotiations`

Campos recomendados:

- `id uuid primary key`
- `cargo_id uuid references cargoes(id)`
- `vessel_id uuid references vessels(id)`
- `shipper_id uuid references users(id)`
- `carrier_id uuid references users(id)`
- `cargo_title text not null`
- `vessel_name text not null`
- `stage text not null`
- `status text not null check (status in ('pending', 'accepted', 'rejected', 'cancelled'))`
- `amount text not null`
- `last_update timestamptz not null default now()`
- `parties jsonb not null default '[]'`
- `route text`
- `payment_terms text`
- `insurance text`
- `documents jsonb not null default '[]'`
- `next_step text`
- `risk_level text`
- `history jsonb not null default '[]'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Observações:

- `cargo_title`, `vessel_name` e `parties` podem ser denormalizados para histórico/auditoria.
- O vínculo real deve ser feito por `cargo_id`, `vessel_id`, `shipper_id` e `carrier_id`.

### `tracking_events`

Campos recomendados:

- `id uuid primary key`
- `cargo_id uuid references cargoes(id)`
- `negotiation_id uuid references negotiations(id)`
- `title text not null`
- `description text not null`
- `location text not null`
- `timestamp timestamptz not null`
- `status text not null check (status in ('done', 'current', 'pending'))`
- `evidence text`
- `created_at timestamptz not null default now()`

### `documents` (futura)

Campos recomendados:

- `id uuid primary key`
- `entity_type text not null check (entity_type in ('cargo', 'vessel', 'negotiation', 'tracking_event', 'user'))`
- `entity_id uuid not null`
- `name text not null`
- `document_type text not null`
- `status text not null`
- `storage_url text`
- `metadata jsonb not null default '{}'`
- `uploaded_by uuid references users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Observações:

- Usar `entity_type + entity_id` permite começar simples.
- Se o domínio exigir constraints fortes, migrar depois para tabelas específicas (`cargo_documents`, `vessel_documents`, etc.).

## 3. Relacionamentos

- `users.id -> cargoes.owner_id`
- `users.id -> vessels.owner_id`
- `cargoes.id -> negotiations.cargo_id`
- `vessels.id -> negotiations.vessel_id`
- `users.id -> negotiations.shipper_id`
- `users.id -> negotiations.carrier_id`
- `cargoes.id -> tracking_events.cargo_id`
- `negotiations.id -> tracking_events.negotiation_id`
- `users.id -> documents.uploaded_by`

Regras esperadas:

- Uma carga pertence a um embarcador (`owner_id`).
- Uma embarcação pertence a um transportador (`owner_id`).
- Uma negociação liga carga, embarcação, embarcador e transportador.
- Eventos de rastreio pertencem a carga e, quando aplicável, negociação.

## 4. Índices Importantes

### `users`

- `unique index users_email_unique on users(lower(email))`
- `index users_role_idx on users(role)`
- `index users_approved_idx on users(approved)`

### `cargoes`

- `index cargoes_owner_id_idx on cargoes(owner_id)`
- `index cargoes_status_idx on cargoes(status)`
- `index cargoes_corridor_idx on cargoes(corridor)`
- `index cargoes_product_family_idx on cargoes(product_family)`
- `index cargoes_origin_destination_idx on cargoes(origin, destination)`

### `vessels`

- `index vessels_owner_id_idx on vessels(owner_id)`
- `index vessels_status_idx on vessels(status)`
- `index vessels_corridor_idx on vessels(corridor)`

### `negotiations`

- `index negotiations_cargo_id_idx on negotiations(cargo_id)`
- `index negotiations_vessel_id_idx on negotiations(vessel_id)`
- `index negotiations_shipper_id_idx on negotiations(shipper_id)`
- `index negotiations_carrier_id_idx on negotiations(carrier_id)`
- `index negotiations_status_idx on negotiations(status)`
- `index negotiations_stage_idx on negotiations(stage)`

### `tracking_events`

- `index tracking_events_cargo_id_idx on tracking_events(cargo_id)`
- `index tracking_events_negotiation_id_idx on tracking_events(negotiation_id)`
- `index tracking_events_status_idx on tracking_events(status)`
- `index tracking_events_timestamp_idx on tracking_events(timestamp)`

### `documents`

- `index documents_entity_idx on documents(entity_type, entity_id)`
- `index documents_uploaded_by_idx on documents(uploaded_by)`
- `index documents_status_idx on documents(status)`
- `index documents_document_type_idx on documents(document_type)`

## 5. Regras de Autorização por Entidade

### `User`

- Usuário autenticado pode ler e editar o próprio perfil.
- Admin pode listar/aprovar usuários em fase futura.
- Payload de perfil nunca pode alterar `id`, `role`, `approved` ou `password_hash`.

### `Cargo`

- `shipper` aprovado pode criar carga.
- `carrier` não pode criar carga.
- Dono da carga (`owner_id`) pode editar/cancelar em fase futura.
- Admin pode auditar/listar.
- Leitura pública deve ser via DTO sanitizado; leitura completa deve exigir sessão.

### `Vessel`

- `carrier` aprovado pode criar/editar embarcação própria em fase futura.
- `shipper` não deve editar embarcações.
- Admin pode auditar/aprovar.
- Leitura pública deve ser sanitizada.

### `Negotiation`

- `carrier` pode criar proposta para carga válida.
- `shipper_id` e `carrier_id` podem visualizar a negociação.
- Apenas participante pode alterar status.
- Regras futuras por transição:
  - carrier cria proposta
  - shipper aceita/rejeita
  - ambos podem cancelar conforme estado
- Admin pode auditar.

### `TrackingEvent`

- Participantes da carga/negociação podem visualizar eventos relacionados.
- Operações/admin podem visualizar todos.
- Criação de eventos deve ser restrita a usuário autorizado ou serviço operacional.

### `Document`

- Upload permitido apenas para usuário autenticado com relação à entidade.
- Leitura depende da entidade:
  - documento de cargo: owner, participante de negociação, admin
  - documento de embarcação: owner carrier, admin
  - documento de negociação: participantes, admin
- Nunca expor `storage_url` sensível sem autorização.

## 6. Estratégia de Seed Demo

Manter os dados atuais de mock como fonte inicial de seed.

Fases:

1. Criar script `seed:demo` futuro.
2. Converter `defaultUsers`, `cargoes`, `vessels`, `negotiations` e `trackingEvents` para inserts.
3. Preservar emails e usuários demo:
   - `tiala@hydrorivers.com`
   - `joao@naveganorte.com`
   - `admin@hydrorivers.com`
4. Mapear IDs atuais para UUIDs ou manter IDs string em fase intermediária.
5. Criar seed idempotente:
   - upsert por email em `users`
   - upsert por slug/id externo nas demais entidades

Recomendação:

- Primeira versão pode manter `id text` para reduzir migração.
- Versão de produção deve migrar para `uuid`.

## 7. Como Manter Mock e Banco em Paralelo

A camada de repository deve selecionar a fonte de dados por ambiente:

```txt
HYDRORIVERS_DATA_SOURCE=mock
HYDRORIVERS_DATA_SOURCE=postgres
```

Estratégia:

- Default: `mock`
- Testes unitários/integration atuais continuam usando mock.
- Ambiente local pode alternar para `postgres`.
- E2E pode rodar em `mock` inicialmente.
- Staging pode rodar em `postgres` com seed demo.

Fluxo esperado:

```txt
API Route
  -> getRepositories()
    -> mock repositories
    -> postgres repositories (futuro)
```

Não remover `.mock-data` até:

- repository real estar estável
- testes rodarem contra banco
- seed demo estar confiável
- estratégia de rollback existir

## 8. Riscos de Migração

- **Divergência mock vs banco:** regras podem passar em mock e falhar em Postgres.
- **Transações:** fluxos como criar negociação + atualizar carga precisam ser atômicos no banco.
- **IDs:** timestamps/string IDs atuais podem conflitar com UUIDs.
- **Autorização:** relações como `owner_id`, `shipper_id` e `carrier_id` precisam estar sempre preenchidas.
- **Dados sensíveis:** documentos, evidências e negociações não devem continuar públicos.
- **Testes:** mocks atuais precisarão conviver com testes contra repository real.
- **Seed:** seed não idempotente pode duplicar dados demo.
- **Schema prematuro:** normalizar tudo cedo demais pode atrasar o MVP; `jsonb` é aceitável em campos flexíveis na primeira migração.

## 9. Ordem de Implementação

### Fase 1 — Boundary de repository

Status: iniciada.

- Criar interfaces.
- Criar mock repositories.
- Migrar uma rota piloto.
- Validar testes.

### Fase 2 — Migrar rotas simples para repository

- `/api/embarcacoes`
- `/api/rastreio`
- `marketplace.service`

### Fase 3 — Migrar auth para repository

- `getSessionUser`
- `login`
- `register`
- `profile`

### Fase 4 — Migrar negociações para repository

- `POST /api/negociacoes`
- `PATCH /api/negociacoes`
- concentrar escrita dupla em métodos de repository ou service transacional futuro

### Fase 5 — Preparar schema SQL

- Criar migrations iniciais.
- Criar seed demo.
- Não ativar em produção ainda.

### Fase 6 — Implementar Postgres repositories

- Começar por leitura.
- Depois escrita simples.
- Por último fluxos transacionais.

### Fase 7 — Rodar em paralelo

- `mock` para desenvolvimento e QA visual.
- `postgres` para staging.
- Comparar contratos de API.

### Fase 8 — Hardening para produção

- Auth real.
- DTOs públicos/privados.
- Storage real para documentos.
- Logs/auditoria.
- Testes de autorização contra banco.

