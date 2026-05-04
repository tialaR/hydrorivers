# Timeline operacional auditável — Rastreio (HydroRivers)

**Tipo:** documentação de produto e arquitetura — complementa o código em `src/features/marketplace/domain`, `tracking-timeline` e `GET /api/rastreio`.

**Escopo atual no código:** modelo `TrackingEvent` com `kind` operacional opcional, inferência quando `kind` ausente, seed mock, ícones e `aria-label` na UI, timestamps ISO opcionais (`occurredAt` / `recordedAt`). **Sem** upload de documentos, **sem** IA, **sem** mudanças de autenticação neste módulo.

---

## 1. Objetivo

Evoluir o **rastreio por eventos** para uma **timeline operacional auditável**:

- cada marco é **tipado** (`OperationalTrackingEventKind`) para leitura humana e máquina;
- tempos **`occurred_at`** / **`recorded_at`** (quando existirem) sustentam ordenação e compliance futuros;
- **compatibilidade** com mocks JSON antigos (sem `kind` ou com kind renomeado) via inferência e normalização no cliente/helpers;
- a UI permanece **incremental** — não substitui um TMS enterprise.

---

## 2. Eventos suportados

Os nove tipos operacionais (**canônicos**) em `OperationalTrackingEventKind`:

| Ordem lógica | `kind` | Significado |
|--------------|--------|-------------|
| 1 | `cargo_created` | Carga criada/publicada no sistema. |
| 2 | `proposal_sent` | Proposta ou contraproposta registrada. |
| 3 | `negotiation_accepted` | Negociação aceita / contrato operacional iniciado. |
| 4 | `documentation_pending` | Pendência documental ou análise (sem módulo de upload na UI). |
| 5 | `shipment_confirmed` | Embarque/expedição confirmada (lacre, checklist, janela de atracação, documentos conferidos). |
| 6 | `in_transit` | Em movimento na hidrovia (inclui contexto de sincronização tardia). |
| 7 | `delay_reported` | Atraso ou revisão de ETA/previsão. |
| 8 | `delivered` | Entrega concluída. |
| 9 | `proof_attached` | Comprovante / POD registrado; `evidenceDocumentId` reserva vínculo ao **módulo de documentos** (roadmap). |

**Legado:** registros em disco com `kind: "boarding_confirmed"` continuam válidos — `resolveOperationalTrackingKind` normaliza para **`shipment_confirmed`**.

### Campos auditáveis (opcionais)

| Campo | Descrição |
|-------|-----------|
| `kind` | Tipo operacional; ausência aciona inferência por texto/status. |
| `actorId`, `actorRole` | Quem causou o evento (`shipper` \| `carrier` \| `admin` \| `system`). |
| `occurredAt`, `recordedAt` | ISO 8601 — na UI, `<time dateTime={occurredAt}>` quando existir. |
| `evidenceDocumentId` | Roadmap — `docs/DOCUMENTS-MODULE.md`. |
| `metadata` | Pares chave/valor livres. |

Campos já existentes (`title`, `description`, `location`, `timestamp`, `status`, `evidence`, `cargoId`, `negotiationId`) permanecem a base demo + i18n via `translateMock`.

---

## 3. Eventos futuros

| Ideia | Estado |
|-------|--------|
| Tipos adicionais por domínio (ex.: `customs_cleared`) | Roadmap — exige catálogo versionado. |
| Eventos gerados automaticamente a partir de `POST/PATCH` em cargas/negociações | Roadmap — orquestração server-side. |
| Correlação obrigatória com documento comprovativo | Depende do **módulo de documentos**. |
| Séries temporais e KPIs executivos | `docs/EXECUTIVE-DASHBOARD.md`. |

---

## 4. Relação com cargas, negociações e documentos

| Entidade | Relação |
|----------|---------|
| **Cargo** | `cargoId` opcional no evento; timeline costuma seguir o ciclo da carga. |
| **Negotiation** | `negotiationId` opcional; eventos após deal aceito ligam-se ao fluxo comercial. |
| **Documentos** | **Roadmap:** `evidenceDocumentId` apontará para metadados em storage privado (`DOCUMENTS-MODULE.md`). Hoje apenas campo reservado no tipo. |

A API **`GET /api/rastreio`** permanece **pass-through** do mock — sem filtros por participante até fase de segurança (`docs/API-SECURITY-AUDIT.md`).

---

## 5. Permissões esperadas

**Estado atual:** leitura ampla documentada como risco — timeline na UI usa import direto do seed em parte do fluxo demo.

**Alvo produção (documentado, não obrigatoriamente implementado):**

- apenas **participantes** da carga/negociação ou perfis institucionais autorizados veem eventos sensíveis;
- escrita de eventos com **`actorId`** explícito e trilha em servidor;
- **mock-mode** (admin) permanece ferramenta de cenário — separado da timeline operacional real.

Ver `docs/SECURITY-PRODUCT-DECISIONS.md` para papéis e ownership.

---

## 6. Testes recomendados

| Camada | Arquivo / foco |
|--------|----------------|
| Unitário | `tests/unit/features/marketplace/tracking.helpers.test.ts` — inferência, lista de kinds, cobertura do seed, **normalização `boarding_confirmed` → `shipment_confirmed`**. |
| Integração | `tests/integration/api/rastreio.get.test.ts` — contrato JSON estável para cliente. |
| E2E (futuro) | Smoke da página `/rastreio` quando fluxos críticos estiverem estáveis (`docs/E2E-PLAYWRIGHT.md`). |

---

## 7. Roadmap incremental

1. **✓ Etapa atual** — Tipos canônicos (`shipment_confirmed`), inferência, normalização legado, seed, ícones, `aria-label`, `<time dateTime>` quando há `occurredAt`.
2. **Próxima** — Repositório/`GET /api/rastreio` com filtros por `cargoId` / `negotiationId` + autorização.
3. **Depois** — Escrita auditável (`POST`/`PATCH` eventos) e ordenação por `occurredAt`.
4. **Com documentos** — Preencher `evidenceDocumentId` com políticas de `DOCUMENTS-MODULE.md`.

---

## Riscos

- **Inferência ambígua** até todos os registros terem `kind` explícito na fonte.
- **Fuso:** persistir UTC em produção; `timestamp` segue como legenda humana demo.
- **Segurança:** timeline pública na API atual — endurecimento em fase dedicada.

---

## Referências de código

- `src/features/marketplace/domain/marketplace.types.ts` — `OperationalTrackingEventKind`, `TrackingEvent`.
- `src/features/marketplace/domain/tracking.helpers.ts` — `resolveOperationalTrackingKind`, `OPERATIONAL_TRACKING_EVENT_KINDS`.
- `src/features/marketplace/data/marketplace.mock.ts` — seed.
- `src/features/tracking/components/tracking-timeline/tracking-timeline.tsx` — apresentação.
- `src/app/api/rastreio/route.ts` — API mock.
