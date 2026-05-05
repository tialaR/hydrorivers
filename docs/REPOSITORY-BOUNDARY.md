# Repository boundary — HydroRivers

## Objetivo

Separar **Route Handlers** e serviços de alto nível do **acesso direto** a `readMock` / `writeMock` em `mock-db`, permitindo trocar a fonte de dados (persistência real, feature flags) **sem** alterar contratos HTTP públicos nesta fase.

Escopo atual: **somente mock em arquivo** (`.mock-data`); **sem** ORM, **sem** banco real.

## Estado implementado (etapa 1)

| Item | Detalhe |
|------|---------|
| Pasta | `src/shared/server/repositories/` |
| Contratos | `CargoesRepository`, agregado `Repositories` (`types.ts`) |
| Implementação | `createMockRepositories()` delega para `readMock` (`mock-repositories.ts`) |
| Entrada única | `getRepositories()` (`index.ts`) — singleton por runtime Node |
| Rota piloto | **`GET /api/cargas`** usa `getRepositories().cargoes.list()` |
| `POST /api/cargas` | Usa **`commitPublishCargo`** (não o repositório); define **`ownerId`/`shipperId`**, revalida tags/paths de cache conforme `cargo-cache-tags` |

Comportamento da API (`200`, corpo `{ data: Cargo[] }`) **inalterado** para clientes.

## Relação com segurança e produto

- `docs/API-SECURITY-AUDIT.md`: `GET /api/cargas` permanece **público** nesta etapa; o boundary **não** resolve exposição de dados — apenas isola persistência.
- `docs/SECURITY-PRODUCT-DECISIONS.md`: escopo por sessão em **GET** e regras em repositório **◇** futuro; **ownership na escrita** já centralizado em **`commitPublishCargo`**.

## Próximas etapas sugeridas (não implementadas)

1. Estender `CargoesRepository` com `upsert(cargo)` e migrar **`POST /api/cargas`** / **`commitPublishCargo`** para delegar ao repositório.
2. Introduzir `NegotiationsRepository` + métodos usados por `GET`/`POST`/`PATCH` em `/api/negociacoes`.
3. Opcional: factory que escolhe `createMockRepositories()` vs implementação Postgres quando existir (`docs/DATABASE-PLANNING.md`).
4. Testes de integração continuam podendo mockar `@/shared/server/mock-db`; quando útil, mockar `getRepositories` para cenários isolados.

## Arquivos tocados nesta etapa

```
src/shared/server/repositories/types.ts
src/shared/server/repositories/mock-repositories.ts
src/shared/server/repositories/index.ts
src/app/api/cargas/route.ts          # apenas GET
tests/integration/api/cargas.get.test.ts
docs/REPOSITORY-BOUNDARY.md
```
