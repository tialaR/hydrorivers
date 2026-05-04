# Timeline operacional de rastreio (HydroRivers)

Este documento descreve o **primeiro estágio** da evolução do rastreio para uma **timeline operacional auditável**. Implementação atual cobre **modelo de dados**, **compatibilidade com mocks JSON**, **inferência para registros sem `kind`** e **ícones na UI** — sem upload de documentos nem mudanças em autenticação.

## Estado atual (após etapa 1)

| Área | Situação |
|------|-----------|
| Domínio | `OperationalTrackingEventKind`, `TrackingActorRole` e campos opcionais auditáveis em `TrackingEvent` (`marketplace.types.ts`). |
| Seed mock | Eventos em `marketplace.mock.ts` incluem **pelo menos um exemplo explícito de cada um dos nove `kind`s** (`cargo_created` … `proof_attached`), além de repetições realistas (`boarding_confirmed`, etc.). |
| Legado em disco | Arquivos `.mock-data/trackingEvents.json` antigos continuam válidos: campos novos são opcionais; UI/API não quebram. |
| Inferência | `resolveOperationalTrackingKind` (`tracking.helpers.ts`) deduz `kind` a partir de título, descrição, local e evidência quando `kind` está ausente. |
| UI | `TrackingTimeline` escolhe ícone por tipo operacional resolvido (`tracking-timeline.tsx`) e expõe `aria-label` com `{kind}:{título}` para leitores de tela (carimbo auditável legível por máquina sem novo texto visual). |
| API | `GET /api/rastreio` permanece pass-through de `readMock('trackingEvents')` — contrato JSON evolui de forma compatível. |

## Modelo ideal de evento

### Tipos operacionais (`OperationalTrackingEventKind`)

Ordem lógica no fluxo (não obrigatória para todos os casos):

1. `cargo_created` — carga criada/publicada no sistema.
2. `proposal_sent` — proposta ou contraproposta registrada.
3. `negotiation_accepted` — negociação aceita / contrato operacional iniciado.
4. `documentation_pending` — pendência documental bloqueante ou em análise.
5. `boarding_confirmed` — embarque confirmado (lacre, checklist, janela de atracação, documentos conferidos).
6. `in_transit` — em movimento na hidrovia (inclui sincronização tardia como contexto).
7. `delay_reported` — atraso ou revisão de ETA/previsão.
8. `delivered` — entrega concluída (sem necessidade de comprovante anexo neste momento).
9. `proof_attached` — comprovante (ex.: POD) registrado; campo futuro `evidenceDocumentId` referencia documento quando existir.

### Campos auditáveis (opcionais na etapa 1)

| Campo | Descrição |
|-------|-----------|
| `kind` | Tipo operacional; ausência aciona inferência. |
| `actorId` | Quem causou o evento (usuário mock quando aplicável). |
| `actorRole` | `shipper` \| `carrier` \| `admin` \| `system`. |
| `occurredAt` | Quando o fato operacional ocorreu (ISO 8601). |
| `recordedAt` | Quando o sistema registrou o evento (ISO 8601). |
| `evidenceDocumentId` | Reservado para vínculo com módulo de documentos (não implementado). |
| `metadata` | Pares chave/valor livres para telemetria ou refs externas. |

Campos já existentes (`title`, `description`, `location`, `timestamp`, `status`, `evidence`, `cargoId`, `negotiationId`) permanecem a base para UI e i18n via `translateMock`.

## Impacto na API (próximas etapas)

- Filtrar por `cargoId` / `negotiationId` e ordenar por `occurredAt` / `recordedAt`.
- Validar permissões (participantes da carga/negociação) antes de expor timeline — ver `docs/API-SECURITY-AUDIT.md`.
- Endpoints de escrita (`POST`/`PATCH`) para criar eventos com auditoria explícita (fora do escopo da etapa 1).

## Impacto na UI (próximas etapas)

- Consumir `GET /api/rastreio` ou dados filtrados por código de rastreio real.
- Exibir carimbo de tempo auditável (`occurredAt`) além do `timestamp` localizado de demo.
- Badges por `kind` e tooltips com `metadata`.

## Testes

| Tipo | Arquivo | Cobertura |
|------|---------|-----------|
| Unitário | `tests/unit/features/marketplace/tracking.helpers.test.ts` | `resolveOperationalTrackingKind`, lista de kinds. |
| Integração | `tests/integration/api/rastreio.get.test.ts` | Resposta 200 com mix legado + evento rico. |

## Implementação incremental sugerida

1. **Etapa 1 (concluída neste PR)** — Tipos, inferência, seed, ícones, testes, documentação.
2. **Etapa 2** — Normalização na leitura (`readMock`) opcional + filtros na API + testes de autorização.
3. **Etapa 3** — Criação automática de eventos a partir de mutações (`POST /api/cargas`, `PATCH /api/negociacoes`, etc.).
4. **Etapa 4** — Integração com `evidenceDocumentId` e módulo de documentos (`docs/DOCUMENTS-MODULE.md`).

## Riscos

- **Inferência**: texto ambíguo pode classificar evento incorretamente até haver `kind` explícito em todas as fontes.
- **Fuso horário**: `occurredAt`/`recordedAt` devem ser UTC na persistência real; `timestamp` segue como legenda humana demo.
- **Segurança**: timeline continua pública na API atual — endurecimento é fase separada.

## Referências de código

- `src/features/marketplace/domain/marketplace.types.ts` — tipos.
- `src/features/marketplace/domain/tracking.helpers.ts` — inferência e constante de kinds.
- `src/features/marketplace/data/marketplace.mock.ts` — dados seed.
- `src/features/tracking/components/tracking-timeline/tracking-timeline.tsx` — apresentação.
