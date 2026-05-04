# Planejamento de migração para banco real — HydroRivers

**Tipo:** documentação apenas — sem implementação de banco, sem ORM, sem alteração de código de produção neste arquivo.

**Base:** estado atual do repositório (App Router, `.mock-data`, domínios em `src/features`), `docs/REPOSITORY-BOUNDARY.md`, `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`.

---

## 1. Objetivo da migração

Substituir gradualmente a persistência **somente em arquivo JSON** (`.mock-data`) por um **banco relacional transacional** (ex.: Postgres), mantendo:

- contratos HTTP estáveis para clientes existentes;
- capacidade de **demo/QA** via dados controlados;
- alinhamento com **autorização por entidade** (`owner_id`, participantes de negociação, decisões em `SECURITY-PRODUCT-DECISIONS.md`);
- evolução da camada **`getRepositories()`** descrita em `REPOSITORY-BOUNDARY.md`.

O modelo SQL abaixo é **proposta inicial** — pode ser refinado em migrações futuras sem mudar o objetivo estratégico.

---

## 2. Por que não trocar mock direto por banco

| Motivo | Explicação |
|--------|------------|
| **Acoplamento disperso** | Vários handlers chamam `readMock`/`writeMock`/`upsert*` diretamente; trocar tudo de uma vez quebra testes e aumenta regressões. |
| **Transações** | Fluxos como «criar negociação + atualizar status da carga» precisam **atomicidade**; arquivo JSON não oferece transação segura em concorrência. |
| **Autorização** | O projeto documenta GET públicos sensíveis (`docs/API-SECURITY-AUDIT.md`). Persistência real exige **filtros no servidor** alinhados a `owner_id` / participantes — decisão explicitada para **`owner_id` obrigatório em cargas** (`SECURITY-PRODUCT-DECISIONS.md`). |
| **IDs e tipos** | IDs string derivados de timestamp no mock não são ideais para FK e unicidade global; migração gradual permite mapa ou fase intermediária `text` → `uuid`. |
| **Repository boundary** | A primeira fatia já separa **`GET /api/cargas`** do acesso direto ao mock (`REPOSITORY-BOUNDARY.md`). Trocar «só o arquivo» pelo pool Postgres ignoraria esse boundary e duplicaria caminhos de dados. |
| **Sem ORM neste plano** | O projeto pede **sem ORM na fase de planejamento**; SQL explícito ou query builder leve pode vir depois — o importante é contrato de **repositório** antes do motor físico. |

Conclusão: introduzir **repositórios** + **flag de fonte de dados** + **migrations incrementais**, depois ligar Postgres atrás dos mesmos contratos.

---

## 3. Modelo relacional inicial

Entidades principais alinhadas ao domínio TypeScript atual:

| Entidade | Observação |
|----------|------------|
| **User** | `HydroUser`: roles `shipper` \| `carrier` \| `admin`, `approved`. |
| **Cargo** | `Cargo`: status operacional, metadados logísticos, `owner_id` alvo (**decisão de produto**). |
| **Vessel** | `Vessel`: frota ligada a transportador (`owner_id`). |
| **Negotiation** | `Negotiation`: liga `cargo`, `vessel`, `shipper`, `carrier`; histórico pode ser `jsonb` inicialmente. |
| **TrackingEvent** | `TrackingEvent`: timeline por `cargo` / `negotiation`; campos auditáveis (`kind`, `occurred_at`, …). |
| **Document** (futura) | Metadados + storage externo; vínculo polimórfico ou por tipo de entidade. |

Diagrama conceitual:

```txt
users 1 ── N cargoes             (owner_id)
users 1 ── N vessels             (owner_id)
cargoes 1 ── N negotiations
vessels 1 ── N negotiations
users 1 ── N negotiations        (shipper_id)
users 1 ── N negotiations       (carrier_id)
cargoes 1 ── N tracking_events
negotiations 1 ── N tracking_events
cargoes | vessels | negotiations | tracking_events ── N documents (futura)
users 1 ── N documents           (uploaded_by)
```

---

## 4. Tabelas propostas

Nomes em **snake_case** SQL; mapeamento para o front/API mantém camelCase onde já existe.

### `users`

- `id` `uuid` PK (ou `text` na fase intermediária **«a confirmar»**)
- `name` `text` NOT NULL  
- `email` `text` NOT NULL UNIQUE (normalizado lowercase)  
- `company` `text` NOT NULL  
- `role` `text` NOT NULL CHECK (`role` IN (`'shipper'`,`'carrier'`,`'admin'`))  
- `approved` `boolean` NOT NULL DEFAULT false — política shipper/carrier conforme `SECURITY-PRODUCT-DECISIONS.md`  
- `avatar_url`, `phone`, `city` `text`  
- `password_hash` `text` (ou substituído por provider OAuth em auth real)  
- `created_at`, `updated_at` `timestamptz` NOT NULL DEFAULT now()

### `cargoes`

- `id` PK  
- `owner_id` FK → `users(id)` **NOT NULL** na versão alvo de produção (alinhado à decisão de produto)  
- Campos espelhando `Cargo`: `title`, `origin`, `destination`, `volume`, `window`, `cargo_type`, `status`, `co2_saving`, `target_price`, descrições, `product_family`, corredor, conectividade, etc.  
- `required_documents`, `operational_risks` `jsonb` DEFAULT `'[]'` (flexível como no mock)  
- `documents` `jsonb` opcional até migração para tabela `documents`  
- `created_at`, `updated_at`

### `vessels`

- `id` PK  
- `owner_id` FK → `users(id)` (transportador)  
- Campos espelhando `Vessel`: `name`, `route`, `capacity`, `eta`, `status`, texto `owner` legado vs FK, imagens, certificações em `jsonb`, etc.  
- `created_at`, `updated_at`

### `negotiations`

- `id` PK  
- `cargo_id` FK → `cargoes(id)`  
- `vessel_id` FK → `vessels(id)`  
- `shipper_id`, `carrier_id` FK → `users(id)`  
- `cargo_title`, `vessel_name`, `stage`, `status`, `amount`, `last_update`  
- `parties`, `documents`, `history` `jsonb` onde o mock já usa estruturas livres  
- `created_at`, `updated_at`  

**Produto:** decisão documentada de **não permitir admin criando negociação operacional** via API — `carrier_id` deve refletir transportador real (`SECURITY-PRODUCT-DECISIONS.md`).

### `tracking_events`

- `id` PK  
- `cargo_id` FK nullable conforme regra de negócio  
- `negotiation_id` FK nullable  
- `title`, `description`, `location`, `timestamp` (label humana pode coexistir com `occurred_at`)  
- `status` CHECK (`done` \| `current` \| `pending`)  
- `evidence` `text`  
- Opcional auditável: `kind` `text`, `actor_id` FK → `users`, `actor_role` `text`, `occurred_at`, `recorded_at` `timestamptz`, `evidence_document_id` `uuid` nullable, `metadata` `jsonb`  
- `created_at`

### `documents` (futura)

- `id` PK  
- `entity_type` CHECK inclui `'cargo'`, `'vessel'`, `'negotiation'`, `'tracking_event'` (**«a confirmar»** inclusão de `user`)  
- `entity_id` UUID (ou texto compatível com PKs intermediários)  
- `name`, `document_type`, `status`  
- `storage_key` / `storage_url` conforme política de segurança (URLs não públicas sem auth)  
- `uploaded_by` FK → `users`  
- `metadata` `jsonb`  
- `created_at`, `updated_at`

---

## 5. Relacionamentos

| De | Para | Cardinalidade |
|----|------|----------------|
| `users` | `cargoes` | 1:N (`owner_id`) |
| `users` | `vessels` | 1:N (`owner_id`) |
| `cargoes` | `negotiations` | 1:N |
| `vessels` | `negotiations` | 1:N |
| `users` | `negotiations` | N:M implícito via `shipper_id` e `carrier_id` |
| `cargoes` | `tracking_events` | 1:N |
| `negotiations` | `tracking_events` | 1:N |
| `documents` | entidades | N:1 polimórfico (`entity_type`, `entity_id`) |

Integridade: ao apagar ou arquivar entidades, definir política **soft-delete** ou RESTRICT para não quebrar auditoria (**«a confirmar»** política de retenção).

---

## 6. Índices importantes

### `users`

- UNIQUE em `lower(email)`  
- `(role)`, `(approved)` para painéis admin/moderação  

### `cargoes`

- `(owner_id)`  
- `(status)`, `(corridor)`, `(product_family)`  
- `(origin, destination)` para buscas de marketplace  

### `vessels`

- `(owner_id)`, `(status)`, `(corridor)`  

### `negotiations`

- `(cargo_id)`, `(vessel_id)`, `(shipper_id)`, `(carrier_id)`  
- `(status)`, `(stage)`  
- Composto opcional `(carrier_id, status)` para dashboards  

### `tracking_events`

- `(cargo_id)`, `(negotiation_id)`  
- `(occurred_at)` ou `(timestamp)` conforme colunas escolhidas  
- `(kind)` se filtros por tipo operacional forem frequentes  

### `documents`

- `(entity_type, entity_id)`  
- `(uploaded_by)`, `(status)`, `(document_type)`  

---

## 7. Regras de autorização por entidade

Consolidado com `API-SECURITY-AUDIT.md` e decisões de produto **alvo** (nem todas aplicadas no código ainda):

### User

- Leitura/edição do **próprio** perfil; campos sensíveis (`id`, `role`, `approved`, segredo de auth) **imutáveis** via payload público (`SECURITY-PRODUCT-DECISIONS.md`).  
- Admin: moderação/aprovação em fluxos futuros.

### Cargo

- Criação: **shipper** (ou papel institucional explícito); **carrier** bloqueado; respeitar `approved` conforme API atual e decisões.  
- Leitura: hoje GET pode ser público — **produção** deve evoluir para lista **filtrada** ou DTO sanitizado (`API-SECURITY-AUDIT.md`).  
- **`owner_id`** obrigatório na persistência alvo (`SECURITY-PRODUCT-DECISIONS.md`).  

### Vessel

- CRUD futuro restrito ao **owner** transportador ou admin institucional.  
- GET público atual é **risco** documentado — mesmo tratamento que cargas em produção.

### Negotiation

- Criação: **carrier** aprovado (decisão: **não admin** como autor operacional — `SECURITY-PRODUCT-DECISIONS.md`).  
- Leitura: participantes (`shipper_id`, `carrier_id`) + admin auditoria.  
- PATCH status: apenas participantes (com máquina de estados futura).

### TrackingEvent

- Leitura escopada por **cargo/negociação** autorizados ao usuário; institucional pode ter visão agregada com política própria.  
- Escrita: usuário autorizado ou job/sistema com auditoria (`actor_id`, `recorded_at`).

### Document (futura)

- Upload/leitura conforme vínculo à entidade e papel; sem expor storage sem autorização (`API-SECURITY-AUDIT.md`).

---

## 8. Estratégia de seed/demo

1. Derivar seed dos mocks atuais: `auth.mock`, `marketplace.mock`, cenários em `mock-scenarios`.  
2. Script futuro **`seed:demo`** idempotente: upsert por **email** em `users`; upsert por **chave estável** (ex.: slug/id demo) nas demais tabelas.  
3. Preservar identidades demo conhecidas nos mocks (emails admin/carrier/shipper usados em QA).  
4. Primeira migração pode usar **`text` PK** compatível com IDs atuais; segunda onda migra para **uuid**.  
5. Separar **seed demo** de **migrations estruturais** (nunca misturar dados voláteis em migration obrigatória sem reversão).

---

## 9. Como manter mock e banco em paralelo

Variável de ambiente sugerida (exemplo):

```txt
HYDRORIVERS_DATA_SOURCE=mock | postgres
```

Fluxo alinhado ao boundary:

```txt
Route Handler → getRepositories() → implementação mock (readMock/writeMock)
                                  → implementação Postgres (queries SQL)
```

Regras:

- **Default local:** `mock` para desenvolvimento rápido e testes Vitest existentes.  
- **CI opcional:** job separado com Postgres + migrations quando estável.  
- **Não remover `.mock-data`** até repositório real, seeds e rollback estarem maduros (`REPOSITORY-BOUNDARY.md`).  
- Expandir interfaces em `src/shared/server/repositories/` antes de duplicar SQL nos handlers.

---

## 10. Ordem incremental de implementação

| Etapa | Entrega |
|-------|---------|
| **E1** | Expandir repository mock: `cargoes.upsert`, listagens usadas por APIs — completar migração de **todas** as operações de **cargas** antes do SQL. |
| **E2** | Introduzir `NegotiationsRepository` + transação lógica «negociação + atualização de carga» encapsulada (ainda mock ou unit-of-work em memória). |
| **E3** | `VesselsRepository`, `TrackingRepository`; alinhar `marketplace.service` a `getRepositories()`. |
| **E4** | Auth users via repositório (leitura/login/register/profile). |
| **E5** | Schema SQL inicial + migrations **somente estrutura**; sem ligar produção. |
| **E6** | Implementação Postgres **read-only** para uma entidade piloto (ex.: cargas). |
| **E7** | Escrita Postgres + transações (`negotiations`). |
| **E8** | Tabela `documents` + storage externo (**fora** deste plano detalhado). |
| **E9** | Endurecer autorização nas APIs conforme matriz deste doc + auditoria. |

Estado **atual** documentado em `REPOSITORY-BOUNDARY.md`: piloto **`GET /api/cargas`** já usa `getRepositories().cargoes.list()`.

---

## 11. Riscos

| Risco | Mitigação |
|-------|-----------|
| Divergência comportamento mock vs Postgres | Contratos de repositório testados; smoke comparativo de payloads JSON. |
| Ausência de transação na migração inicial | Introduzir fronteira única (`createNegotiationWithCargoUpdate`) antes do SQL. |
| IDs incompatíveis | Plano explícito text→uuid ou mapa de correlação no seed. |
| Exposição de dados sensíveis mantida após DB | Priorizar **auth em GET** conforme `API-SECURITY-AUDIT.md`. |
| Schema excessivamente normalizado cedo | Manter `jsonb` onde o produto ainda iter (`history`, `required_documents`). |
| Seed não idempotente | Upserts e constraints UNIQUE claros. |
| ORM introduzido informalmente | Manter política «SQL explícito / camada fina» até decisão formal. |

---

## 12. Critérios de pronto

Para considerar a migração **concluída em um ambiente** (ex.: staging):

1. **Schema:** todas as tabelas deste documento criadas por migrations versionadas; FKs e índices mínimos aplicados.  
2. **Repositories:** todas as rotas críticas em `src/app/api` passam apenas por implementações mock ou Postgres atrás de `getRepositories()` (sem `readMock` solto nos handlers).  
3. **Auth:** usuários persistidos no banco; `approved` e roles aplicados nas queries autorizadas.  
4. **Transações:** fluxos multi-linha (negociação + carga) atômicos no Postgres.  
5. **Seed demo:** reproduz cenário utilizável pela UI sem `.mock-data`.  
6. **Segurança:** ausência de GET públicos abertos para dados operacionais completos **ou** DTO sanitizado aceito por produto (`API-SECURITY-AUDIT.md`).  
7. **Testes:** integração contra Postgres em CI opcional; regressão Vitest mock verde; decisões `SECURITY-PRODUCT-DECISIONS.md` cobertas onde aplicável (`owner_id`, papel em negociação).  
8. **Rollback:** procedimento documentado para voltar `HYDRORIVERS_DATA_SOURCE=mock` sem perda de código.

---

## Referências cruzadas

- `docs/REPOSITORY-BOUNDARY.md` — boundary atual e próximos passos  
- `docs/API-SECURITY-AUDIT.md` — sessão, papéis, exposição de dados  
- `docs/SECURITY-PRODUCT-DECISIONS.md` — `approved`, `ownerId`, admin em negociações, erros de API  
- `docs/DOCUMENTS-MODULE.md` — evolução da entidade Document  

---

*Documento revisado para refletir as seções obrigatórias do planejamento de migração; ajustar datas e tecnologia exata do provedor (RDS, Neon, Supabase, etc.) em ADR futuro.*
