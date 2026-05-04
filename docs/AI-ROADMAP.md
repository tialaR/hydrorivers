# Camada de IA aplicada — HydroRivers (planejamento)

Documento **somente de planejamento**. **Não implementa IA**, **não adiciona SDK ao cliente nem ao servidor neste artefato** e **não altera código**. Objetivo: definir como introduzir IA **assistiva** respeitando as políticas do repositório (**segurança, validação e testes antes de IA em produto**, vide `AGENTS.md`) e sem substituir decisão humana nem persistência autoritativa.

---

## 1. Visão da IA no produto

A IA no HydroRivers é **auxiliar**, não decisória: reduz atrito cognitivo (ler negociações longas, priorizar riscos, sugerir documentos), sempre sobre **dados já autorizados ao usuário**, com **mesma forma de saída** com ou sem modelo (fallback determinístico).

**Princípios obrigatórios (contrato de produto)**

| Regra | Implicação |
|-------|-------------|
| **IA não decide sozinha** | Saídas são **propostas** (sugestão, rascunho, classificação auxiliar). Mudanças de estado exigem **ação explícita** humana ou fluxo legível sem modelo. |
| **IA não altera dados críticos sem confirmação humana** | Nenhum `POST`/`PATCH`/`PUT` disparado apenas pelo modelo. Qualquer escrita: **UI de confirmação** → endpoint de domínio com permissões e payload validados por **schema determinístico**. |
| **IA deve usar dados estruturados** | Entrada principal: JSON/DTO versionado derivado do domínio (`Cargo`, `Negotiation`, `Vessel`, `TrackingEvent`, futuro `Document`). Texto livre do usuário só como campo **opcional e rotulado**, nunca como substituto do DTO autorizado. |
| **IA deve ter fallback sem IA** | Cada caso de uso funciona **sem modelo**: regras, templates ou dados formatados; falhas de rede, timeout, rate limit ou provedor indisponível caem no fallback **sem degradar permissões**. |
| **IA deve registrar logs/auditoria** | Cada invocação gera registro mínimo (metadados); ver §6. |
| **IA deve respeitar permissões do usuário** | O servidor só monta inputs **após** resolver sessão e escopo como na app hoje/futuro (`ownerId`, participação em negociação, papel `shipper`/`carrier`/`admin`); nunca enviar ao modelo dados que o usuário **não poderia ler** via API autorizada. |

---

## 2. Casos de uso priorizados

Ordem sugerida equilibra **risco**, **dependência de dados** e **valor**. Todas as linhas assumem §§3–7.

| Prioridade | Caso | Objetivo | Natureza |
|------------|------|----------|----------|
| **P1** | **5. Explicação de status da carga** | Traduzir `Cargo.status` e próximos marcos em linguagem clara, com bloqueadores explícitos. | Somente leitura; fallback forte via i18n. |
| **P2** | **2. Resumo de negociação** | Painel com estágio, valores e próximos passos em texto curto + bullets. | Somente leitura; não altera `Negotiation`. |
| **P3** | **3. Análise de risco operacional** | Ordenar e explicar riscos a partir de campos mock (`operationalRisks`, `riskLevel`, conectividade) e, futuro, eventos de rastreio. | Somente leitura; inferências marcadas (`inferred`). |
| **P4** | **4. Checklist operacional** | Etapas pré-embarque / trânsito / atracação alinhadas a `Cargo.status` × `Negotiation.stage`. | Leitura + UX local até existir entidade persistida de checklist. |
| **P5** | **1. Sugestão de documentos obrigatórios** | Expandir/refinar lista esperada por corredor, produto, temperatura. | **Alto impacto regulatório**; depende de `docs/DOCUMENTS-MODULE.md` e revisão humana antes de persistir. |
| **P6** | **6. Suporte contextual (shipper / carrier / admin)** | Respostas curtas “o que faço aqui?” baseadas na **rota**, **papel** e **IDs resolvíveis** no escopo (ex.: página da negociação atual). | Somente leitura orientativa; links para fluxos reais; sem executar ações. |

**Observação:** a ordem **P1→P2** pode ser invertida por produto se o valor do resumo de negociação for prioridade máxima; **P5** deve ficar **deliberadamente tarde** até regras documentais estarem versionadas.

---

## 3. Dados necessários

### Princípios de origem

- Dados vêm **apenas do servidor**, após **autenticação** e **autorização de escopo** (evolução alinhada a `docs/API-SECURITY-AUDIT.md`).
- O cliente **não** envia blobs arbitrários como “contexto”; no máximo **identificadores** já validados (`cargoId`, `negotiationId`) + **tipo de caso de uso** + locale.

### Por caso de uso

| Caso | DTO / Fonte mínima | Campos típicos (subconjuntos autorizados) | Dependências futuras |
|------|-------------------|--------------------------------------------|----------------------|
| **1. Documentos** | `Cargo` (+ `Negotiation` se ligada) | `cargoType`, `productFamily`, `temperature`, origem/destino, `requiredDocuments`, `documents`, `documentReadiness`, conectividade | Entidade `Document`, matriz regulatória versionada (`docs/DOCUMENTS-MODULE.md`) |
| **2. Resumo negociação** | `Negotiation` + refs autorizadas | `stage`, `status`, valores, rota, `riskLevel`, histórico resumido, `cargoId`/`vesselId` só se leitura permitida | Timestamps ISO para narrativa factual |
| **3. Risco operacional** | `Cargo` + `Negotiation` + opcional `TrackingEvent[]` | `operationalRisks`, `predictability`, `connectivity`, `documentReadiness`; eventos com `kind`, `status`, timestamps | Dados externos (porto, clima) — fora do escopo atual |
| **4. Checklist** | `Cargo`, `Negotiation`, `Vessel` resumido | `status`, `stage`, capacidades/calado quando aplicável | Entidade checklist ou vínculo com timeline |
| **5. Status carga** | `Cargo` | `status`, janela, `documentReadiness`, resumo de documentos | Máquina de transição explícita no backend |
| **6. Suporte contextual** | Sessão + rota + recurso opcional | `role`, ids resolvíveis, título da página/caso; **sem** dados de terceiros fora do escopo | Mapa de ajuda i18n por rota |

---

## 4. Arquitetura proposta

### Visão em camadas

```txt
[ Cliente Next.js ]
       |
       v
[ Route Handler / BFF ]     <-- sessão, autorização, rate limit; único lugar habilitado a chamar modelo no futuro
       |
       +--> [ Serviço "AI Assist" ]   <-- monta DTO versionado + política do caso de uso
       |         |
       |         +--> [ Provedor de modelo ]   <-- opcional, trocável; **sem SDK obrigatório no browser**
       |
       +--> [ Fallback determinístico ]   <-- mesma interface de saída validada por schema
       |
       v
[ Auditoria ]                   <-- append-only / tabela dedicada / log estruturado (evolução com DB)
```

- **Sem SDK no cliente:** qualquer integração futura com provedor permanece **server-side**; variáveis sensíveis não aparecem no bundle.
- **Contratos versionados:** exemplos conceituais `AiNegotiationSummaryInputV1`, `AiAssistResponseV1` — nomes ilustrativos até haver RFC interna.
- **Validação de saída:** toda resposta passa por **schema** (ex.: Zod mencionado em `docs/ARCHITECTURE.md` como direção); rejeitar se inválida → fallback ou erro controlado.

### Fluxo de escrita (vedado automático pela IA)

```txt
IA propõe JSON estruturado → UI exibe revisão → usuário confirma
→ cliente chama endpoint de domínio já existente (ou “apply suggestion”) com payload **whitelistado**
→ servidor valida permissões + schema **sem distinguir** se veio da IA ou formulário manual
```

---

## 5. Limites de segurança

1. **Autenticação obrigatória** para casos que carregam dados de negócio (alinhado ao endurecimento desejado das APIs — `docs/API-SECURITY-AUDIT.md`).
2. **Allowlist por caso de uso:** apenas campos necessários entram no DTO enviado ao modelo ou ao fallback.
3. **Sem treino em dados de cliente** no MVP; preferir **processamento efêmero**; política de retenção definida antes de guardar texto completo.
4. **Contract stuffing / injection:** schemas fechados, limites de tamanho em campos de texto natural; sanitização onde houver markdown.
5. **Rate limit** por usuário, por caso de uso e global — custo e abuso.
6. **Circuit breaker** quando o provedor falhar repetidamente → fallback apenas.
7. **Disclaimer jurídico-regulatório** na UI para casos 1 e 3–6 onde o texto possa ser confundido com parecer oficial (**texto fixo em i18n**, não gerado pelo modelo).
8. **Menor privilégio:** admin não recebe “dump” extra via IA que não esteja já autorizado pela política de administração.

---

## 6. Permissões e auditoria

### Permissões

- **Paridade com a API:** se `GET /api/negociacoes/:id` (futuro) ou lista filtrada não devolver uma negociação ao usuário, o caso **2**, **3**, **4**, **6** não podem incluí-la no contexto.
- **Shipper:** foco em cargas próprias e negociações onde `shipperId` coincide com o usuário (ou política documentada equivalente).
- **Carrier:** foco em negociações/cargas/embarcações no seu escopo; respeitar **`approved`** e bloqueios já definidos (`docs/SECURITY-PRODUCT-DECISIONS.md`).
- **Admin:** acesso ampliado **somente** onde o produto já permitir ao admin ler dados reais; IA não é atalho para contornar segregação futura.

### Auditoria (registro mínimo recomendado)

| Campo | Descrição |
|-------|-----------|
| `requestId` | Correlação ponta a ponta |
| `timestamp` | UTC |
| `userId` | Identificador interno |
| `role` | `shipper` \| `carrier` \| `admin` |
| `useCase` | Enum estável (ex.: `document_suggestion`) |
| `schemaVersion` | Versão do DTO entrada/saída |
| `resourceScope` | Ex.: `{ cargoIds: [...], negotiationIds: [...] }` — apenas autorizados |
| `inputHash` | Hash do payload estruturado de entrada (não necessariamente plaintext) |
| `usedFallback` | boolean |
| `providerOutcome` | `ok` \| `timeout` \| `invalid_schema` \| `rate_limited` |
| `latencyMs` | Observabilidade |

**Minimização LGPD/GDPR:** evitar guardar texto livre completo até política de retenção existir (`docs/DATABASE-PLANNING.md`).

---

## 7. Fallback sem IA

| Caso | Estratégia determinística |
|------|---------------------------|
| **1. Documentos** | Matriz por `productFamily` / corredor + cópia literal de `requiredDocuments` já na carga; ordenação fixa; `source: 'rule'` em todos os itens. |
| **2. Resumo** | Template por `DealStage` + bullets montados de `history[]` mock sem parafrasear. |
| **3. Risco** | Ordenação por `riskLevel` + lista `operationalRisks`; `suggestedActions` de biblioteca interna por tags. |
| **4. Checklist** | Tabela estática `(Cargo.status × Negotiation.stage)` → lista de passos; labels via i18n. |
| **5. Status carga** | Strings por enum em `messages/*` (pt-BR, en, es); `nextMilestones` derivados por regra, não por LLM. |
| **6. Suporte** | FAQ/rota estática por `(locale, role, pathname)` + links para telas reais; sem geração livre ou com modelo opcional apenas para reformulação **depois** que baseline existe. |

**Requisito:** o contrato JSON de **saída** é **idêntico** nos ramos “modelo” e “fallback”, para a UI não bifurcar comportamento crítico.

---

## 8. Riscos

| Risco | Mitigação |
|-------|-----------|
| **Alucinação regulatória** (documentos) | Fallback obrigatório; revisão humana; `source` por item; disclaimers fixos. |
| **Alucinação operacional** (risco, checklist) | Marcar inferências; não persistir automaticamente; biblioteca de ações sugeridas fechada. |
| **Vazamento lateral via prompt** | Nunca incluir lista global do marketplace; só objetos já autorizados. |
| **Dependência de provedor** | Interface estável; circuit breaker; flag “model off”. |
| **Custo e latência** | Cache por hash do input (TTL curto); debounce; limites de tokens. |
| **Auditoria incompleta** | Gate de release: todo caminho registra auditoria mínima; testes §9. |
| **Violação de roadmap de segurança** | IA só após baseline verde em lint/typecheck/testes e endurecimento progressivo (`AGENTS.md`). |

---

## 9. Testes possíveis

| Camada | Escopo |
|--------|--------|
| **Unitário** | Montagem de DTO allowlist; validação de schema de saída; funções de fallback (matrizes estágio/status); hashing/redação para logs. |
| **Integração** | Handler `POST /api/ai/assist` (futuro): `401` sem sessão; `403` fora de escopo; resposta só com campos whitelistados; ramo `usedFallback: true` retorna mesmo shape que ramo modelo simulado. |
| **Contrato** | Snapshots estáveis do JSON de saída para cada caso com entrada fixture pequena (sem chamar rede). |
| **Segurança** | Testes negativos: tentativa de solicitar recurso por ID não autorizado → `403` ou lista vazia de contexto. |
| **i18n** | Fallback dos casos 5 e 6 coberto por `npm run check:i18n` onde houver chaves novas. |
| **E2E (tardio)** | Fluxo com feature flag modelo desligada (sempre fallback) para CI estável; smoke opcional com sandbox de provedor fora do caminho crítico. |

---

## 10. Roadmap incremental

1. **Pré-requisitos sem IA** — Endurecer leituras nas APIs conforme `docs/API-SECURITY-AUDIT.md`; definir/atribuir `ownerId` onde aplicável (`docs/SECURITY-PRODUCT-DECISIONS.md`); schemas nos endpoints que receberão “apply suggestion”.
2. **Infra transversal** — Contratos entrada/saída versionados; armazenamento de auditoria; feature flag global **modelo desligado** com fallback 100%.
3. **Entregar P1 e P2** — Explicação de status + resumo de negociação (somente leitura).
4. **Entregar P3 e P4** — Risco + checklist com rotulagem de inferência e sem persistência implícita.
5. **Entregar P5** — Somente após alinhamento com `docs/DOCUMENTS-MODULE.md` e origem das regras regulatórias.
6. **Entregar P6** — Suporte contextual sobre baseline i18n + opcional parafraseo por modelo.
7. **Observabilidade** — Métricas: taxa de fallback, latência, erros de schema, custo estimado por caso.
8. **Revisão legal/DPO** — Antes de qualquer ambiente com dados reais identificáveis.

---

## 11. Agentes futuros

Este roadmap define **casos de uso** transversais. O documento **`docs/AGENTS-ROADMAP.md`** especializa **agentes de produto** (nomeados, com dados permitidos/proibidos e ordem macro):

| Agente (futuro) | Relação com §2 |
|-----------------|----------------|
| **Document Agent** | Caso **1** |
| **Risk Agent** | Caso **3** |
| **Negotiation Agent** | Caso **2** |
| **Tracking Agent** | Enriquece **3** e **4** com eventos (`docs/TRACKING-TIMELINE.md`) |
| **Impact Agent** | Opcional para narrativa de impacto regional em painéis executivos (`docs/EXECUTIVE-DASHBOARD.md`) — sempre subsidiário |
| **Support Agent** | Caso **6** |

**Regra:** agentes não substituem os princípios da §1; são **empacotamentos** de política + DTO + prompts internos versionados. Implementação futura deve seguir a **ordem sugerida** em `docs/AGENTS-ROADMAP.md` e manter **fallback determinístico** como caminho obrigatório.

---

## Referências internas

| Documento | Uso |
|-----------|-----|
| `AGENTS.md` | IA depois de segurança, validação e testes |
| `docs/AGENTS-ROADMAP.md` | Agentes nomeados e limites |
| `docs/API-SECURITY-AUDIT.md` | Exposição atual das APIs e direção de auth |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Papéis, `approved`, ownership |
| `docs/DOCUMENTS-MODULE.md` | Documentos e permissões futuras |
| `docs/TRACKING-TIMELINE.md` | Eventos operacionais |
| `docs/DATABASE-PLANNING.md` | Persistência e auditoria durável |
| `docs/ARCHITECTURE.md` | Próximo salto (Zod, Postgres, etc.) |

Este arquivo **não** substitui parecer jurídico nem DPIA; deve ser revisado antes de processamento em produção.
