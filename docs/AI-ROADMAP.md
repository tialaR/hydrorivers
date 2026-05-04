# Roadmap de IA aplicada — HydroRivers

**Tipo:** documentação **somente de planejamento (visão futura / roadmap)**.

**Escopo deste arquivo:** define **como** o HydroRivers poderá introduzir IA **assistiva** em um momento posterior. **Não implementa IA**, **não adiciona SDK**, **não altera código nem testes**. Qualquer capacidade descrita abaixo deve ser tratada como **não existente em produto** até cumprir os critérios da §13.

**Base:** `docs/DEVELOPER-AI-ONBOARDING.md`, `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`, `docs/DATABASE-PLANNING.md`, `docs/DOCUMENTS-MODULE.md`, `docs/TRACKING-TIMELINE.md`, `docs/EXECUTIVE-DASHBOARD.md`. Política do repositório: **`AGENTS.md`** — não adicionar IA em produto antes de segurança, validação e testes consolidados.

---

### Legenda

| Marco | Significado neste documento |
|-------|------------------------------|
| **◇ Roadmap** | Planejado; não implementado como descrito até decisão explícita de produto e engenharia. |
| **◇ Futuro** | Depende de pré-requisitos (dados, APIs escopadas, módulo de documentos, dashboard executivo, etc.). |

---

## 1. Visão da IA no produto

**◇ Roadmap.** A IA no HydroRivers é **auxiliar**, não decisória: reduz atrito cognitivo (ler negociações longas, priorizar riscos, sugerir documentos, sintetizar painéis), sempre sobre **dados já autorizados ao usuário** naquele momento.

Princípios de alto nível (**◇ todos obrigatórios quando houver implementação**):

- Saídas são **propostas** ou **explicações** — nunca substituem decisão humana em matérias regulatórias, contratuais ou de estado autoritativo da plataforma.
- **Mesmo contrato de saída** com ou sem modelo: a UI deve funcionar idêntica quando o provedor falhar (**fallback determinístico** — §8).
- **Transparência:** recomendações devem ser **explicáveis** (§3 — “IA deve explicar recomendações”).
- **Servidor único:** qualquer chamada a modelo **◇ futura** permanece **server-side**; sem exposição de chaves ou SDK obrigatório no browser.

---

## 2. Por que IA não entra antes de dados e segurança

**◇ Fundamento de produto e engenharia.**

| Motivo | Consequência se IA entrar cedo demais |
|--------|--------------------------------------|
| **GETs amplos sem escopo real** (`docs/API-SECURITY-AUDIT.md`) | Um assistente poderia **parafrasear ou priorizar dados que nunca deveriam ter sido legíveis** ao usuário naquele papel — amplificando vazamento lateral via linguagem natural. |
| **Ownership inconsistente** (`docs/SECURITY-PRODUCT-DECISIONS.md`) | Sugestões baseadas em cargas “sem dono” ou contexto ambíguo geram **ações erradas** e disputas (“quem autorizou?”). |
| **Ausência de entidade `Document` e pipeline seguro** (`docs/DOCUMENTS-MODULE.md`) | Sugestão documental sem contrato de dados vira **alucinação regulatória** difícil de auditar. |
| **Timeline sem filtros autorizados na API** (`docs/TRACKING-TIMELINE.md`) | Modelo poderia inferir fluxo físico **fora do escopo** do participante. |
| **Dashboard executivo sem KPIs formais** (`docs/EXECUTIVE-DASHBOARD.md`) | “Resumo executivo” por IA pode **misturar demo com métrica oficial** sem definições explícitas de cada número. |
| **Persistência mock vs auditável** (`docs/DATABASE-PLANNING.md`) | Sem timestamps e trilhas duráveis, **logs de IA** e correlação com decisões humanas ficam frágeis para compliance. |

**Conclusão:** IA assistiva é **◇ etapa posterior** a: (a) autorização nas **leituras** alinhada ao perfil; (b) DTOs de domínio estáveis e redigidos por caso de uso; (c) baseline verde em lint, typecheck, testes e políticas acordadas (`AGENTS.md`, `docs/DEVELOPER-AI-ONBOARDING.md`).

---

## 3. Princípios de segurança

**◇ Contrato futuro entre produto, segurança e engenharia.** Os itens abaixo **obrigam** qualquer implementação; violação é motivo para **não ligar** o modelo em ambiente com dados reais.

### Regras obrigatórias (política explícita)

| # | Regra | Implicação operacional |
|---|-------|-------------------------|
| R1 | **IA não decide sozinha** | Nenhuma mudança de `Cargo`, `Negotiation`, `Vessel`, eventos de rastreio ou documentos apenas por saída do modelo. |
| R2 | **IA não altera dados críticos sem confirmação humana** | Fluxo obrigatório: **proposta estruturada → revisão na UI → confirmação →** endpoint de domínio já existente **◇ futuro** com permissões + schema **whitelist**, **sem distinguir** origem manual vs sugestão. |
| R3 | **IA deve respeitar role/permissão do usuário** | Montagem do contexto **apenas após** sessão válida e **paridade com o que a API autorizada retornaria** (`docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`). |
| R4 | **IA deve usar dados estruturados do domínio** | Entrada principal: JSON/DTO versionado (`Cargo`, `Negotiation`, `Vessel`, `TrackingEvent`, **◇** `Document`). Texto livre do usuário só como campo **opcional e rotulado**, nunca substituto do DTO autorizado. |
| R5 | **IA deve ter fallback sem IA** | Regras/templates determinísticos; falhas de rede, timeout, schema inválido, rate limit → fallback **sem degradar permissões**. |
| R6 | **IA deve gerar logs/auditoria** | Registro mínimo por invocação (§7); **◇** persistência durável quando houver DB (`docs/DATABASE-PLANNING.md`). |
| R7 | **IA deve explicar recomendações** | Cada sugestão relevante inclui **justificativa curtinha ancorada em dados de entrada** (campos citados, regra aplicada ou tag `inferred` quando não dedutível dos dados); proibição de “confiança opaca” como única mensagem. |

### Limites adicionais explícitos (**◇ roadmap**)

- **Allowlist por caso de uso:** apenas campos necessários entram no payload para modelo ou fallback.
- **Sem treino em dados de cliente** no MVP de IA; preferir **processamento efêmero**; política de retenção antes de armazenar texto completo.
- **Injection / prompt stuffing:** schemas fechados, limites de tamanho, sanitização onde houver markdown renderizado.
- **Rate limit** por usuário, caso de uso e global (abuso e custo).
- **Circuit breaker** no provedor → apenas fallback.
- **Disclaimers jurídico-regulatórios** em **i18n fixo** (não gerados pelo modelo) onde o texto possa confundir-se com parecer oficial.
- **Menor privilégio para admin:** IA não amplia escopo além da política admin já definida; governo/persona institucional **◇** política dedicada antes de sumários sensíveis.

---

## 4. Casos de uso priorizados

**◇ Roadmap.** Ordem sugerida equilibra **risco**, **dependência de dados** e **valor**. Prioridades podem ser ajustadas por produto; **documentos obrigatórios** permanecem **deliberadamente tardios** até `docs/DOCUMENTS-MODULE.md` e matriz regulatória estarem maduros.

| ID | Caso de uso | Objetivo | Notas de risco / dependência |
|----|-------------|----------|-------------------------------|
| **UC5** | **Explicação de status da carga** | Traduzir `Cargo.status`, bloqueadores e próximos marcos em linguagem clara. | Leitura; fallback forte via i18n/regras. |
| **UC2** | **Resumo de negociação** | Estágio, valores, próximos passos em texto curto + bullets. | Leitura; não alterar `Negotiation`. |
| **UC3** | **Análise de risco operacional** | Ordenar/explicar riscos a partir de campos do domínio e **◇** eventos de rastreio. | Inferências marcadas `inferred`; sem persistência automática. |
| **UC4** | **Checklist operacional** | Etapas alinhadas a `Cargo.status` × `Negotiation.stage` (e **◇** timeline). | Pode evoluir para entidade checklist persistida. |
| **UC6** | **Suporte contextual (shipper / carrier / admin)** | “O que faço aqui?” por rota + papel + IDs no escopo. | Links para fluxos reais; sem executar ações remotas. |
| **UC7** | **Alertas sobre documentação pendente** | Destacar pendências com base em **lista de exigências** e **◇** estados `Document`; explicar o que falta e por quê. | Depende de modelo documental ou, em MVP IA, **heurísticas explícitas** + disclaimer se dados forem incompletos. |
| **UC8** | **Resumo executivo para admin / governo** | Narrativa curta sobre KPIs **no escopo autorizado** (alinhado a `docs/EXECUTIVE-DASHBOARD.md`). | **Alto risco interpretativo:** só após KPIs definidos e dados escopados; nunca misturar mock demo com “oficial” sem rótulo. |
| **UC1** | **Sugestão de documentos obrigatórios** | Expandir/refinar lista esperada por corredor, produto, temperatura. | **Alto impacto regulatório**; revisão humana obrigatória antes de persistir; depende `docs/DOCUMENTS-MODULE.md`. |

**Ordem de entrega sugerida (◇):** UC5 → UC2 → UC3 → UC4 → UC6 → UC7 → UC8 → UC1 — com **feature flag modelo desligado** até infra de auditoria e schemas estarem prontos.

---

## 5. Dados necessários

**◇ Roadmap.** Princípios:

- Dados obtidos **somente no servidor**, **após** autenticação e autorização de escopo (evolução descrita em `docs/API-SECURITY-AUDIT.md`).
- Cliente envia no máximo **identificadores validados** (`cargoId`, `negotiationId`, …), **tipo de caso de uso**, **locale** — não “contexto blob” arbitrário.

### Por caso de uso

| Caso | Fonte / DTO mínimo | Campos típicos (subconjunto autorizado) | Dependências ◇ futuras |
|------|-------------------|------------------------------------------|-------------------------|
| UC1 | `Cargo` (+ `Negotiation` se aplicável) | Tipo de carga, família de produto, temperatura, corredor, `requiredDocuments`, prontidão documental | Entidade `Document`, matriz regulatória versionada (`docs/DOCUMENTS-MODULE.md`) |
| UC2 | `Negotiation` + refs autorizadas | `stage`, `status`, valores, `riskLevel`, histórico resumido; `cargoId`/`vesselId` só se leitura permitida | Timestamps ISO para narrativa factual (`docs/DATABASE-PLANNING.md`) |
| UC3 | `Cargo` + `Negotiation` + ◇ `TrackingEvent[]` | Riscos operacionais, conectividade, previsibilidade; eventos com `kind`, `occurredAt` | Dados externos (clima, porto) — fora do escopo inicial |
| UC4 | `Cargo`, `Negotiation`, `Vessel` resumido | `status`, `stage`, capacidade/calado quando pertinente | Vínculo explícito com timeline (`docs/TRACKING-TIMELINE.md`) |
| UC5 | `Cargo` | `status`, janela, prontidão documental, documentos exigidos | Máquina de estados documentada no backend |
| UC6 | Sessão + rota + recurso opcional | `role`, IDs resolvíveis, pathname; sem dados de terceiros fora do escopo | Mapa i18n de ajuda por rota como baseline |
| UC7 | `Cargo` / `Negotiation` + ◇ `Document[]` | Pendências, estados, SLAs narrativos; eventos `documentation_pending` na timeline | Consolidar KPI “documentação pendente” (`docs/EXECUTIVE-DASHBOARD.md`) |
| UC8 | Agregados ◇ dashboard autorizados | Séries/conagens já filtradas por papel; **nunca** coleções brutas do marketplace | API tipo `GET /api/dashboard/summary` escopada (`docs/EXECUTIVE-DASHBOARD.md`) |

---

## 6. Arquitetura proposta

**◇ Futuro — diagrama conceitual.** Nenhum componente abaixo existe como produto final por força deste documento.

```txt
[ Cliente Next.js ]
       |
       v
[ Route Handler / BFF ]     <-- sessão, autorização, rate limit; único lugar permitido para chamar modelo
       |
       +--> [ Serviço "AI Assist" ]   <-- monta DTO versionado + política do caso de uso
       |         |
       |         +--> [ Provedor de modelo ]   <-- opcional, trocável; sem SDK no browser
       |
       +--> [ Fallback determinístico ]   <-- mesma interface de saída validada por schema
       |
       v
[ Auditoria ]                   <-- append-only / tabela dedicada / log estruturado (◇ DB)
```

- **Contratos versionados:** exemplos ilustrativos `AiAssistInputV1`, `AiAssistResponseV1` — RFC interna **◇**.
- **Validação de saída:** schema estrito (ex.: direção Zod citada em `docs/ARCHITECTURE.md`); saída inválida → fallback ou erro controlado **sem** vazar prompt interno.

### Fluxo de escrita (vedado automático pela IA)

```txt
IA propõe JSON estruturado → UI exibe revisão + explicação → usuário confirma
→ cliente chama endpoint de domínio com payload whitelistado
→ servidor valida permissões + schema (independente da origem manual ou assistida)
```

---

## 7. Permissões e auditoria

### Permissões (**◇ paridade com API futura endurecida**)

- Se uma negociação ou carga **não** seria retornada ao usuário pela API autorizada, **não entra** no contexto dos UC2–UC4, UC7 (parcial), UC8.
- **Shipper:** foco em cargas próprias (`ownerId` **◇** consistente — `docs/SECURITY-PRODUCT-DECISIONS.md`) e negociações como `shipperId`.
- **Carrier:** escopo em deals/frota permitidos; respeitar **`approved`** e bloqueios existentes.
- **Admin:** sem “super-leitura” extra via IA além da política admin **◇** formalizada.
- **Governo / institucional (UC8):** **◇** papel ou claims específicos; agregações mínimas para reduzir risco antitruste (`docs/EXECUTIVE-DASHBOARD.md`).

### Auditoria — registro mínimo recomendado (**◇**)

| Campo | Descrição |
|-------|-----------|
| `requestId` | Correlação ponta a ponta |
| `timestamp` | UTC |
| `userId` | Identificador interno |
| `role` | `shipper` \| `carrier` \| `admin` (+ ◇ institucional se existir) |
| `useCase` | Enum estável (ex.: `negotiation_summary`) |
| `schemaVersion` | Versão entrada/saída |
| `resourceScope` | IDs autorizados incluídos no contexto |
| `inputHash` | Hash do payload estruturado de entrada |
| `usedFallback` | boolean |
| `providerOutcome` | `ok` \| `timeout` \| `invalid_schema` \| `rate_limited` |
| `latencyMs` | Observabilidade |
| ◇ `explanationAnchors` | Referências não sensíveis a campos/regras usados na explicação (§3 R7) |

**Minimização LGPD/GDPR:** evitar persistir texto livre completo até política de retenção (`docs/DATABASE-PLANNING.md`).

---

## 8. Fallback sem IA

**◇ Obrigatório antes de qualquer provedor em produção.** O contrato JSON de **saída** deve ser **idêntico** nos ramos “modelo” e “fallback”.

| Caso | Estratégia determinística (exemplos) |
|------|--------------------------------------|
| UC1 | Matriz por família de produto/corredor + cópia de `requiredDocuments`; `source: 'rule'` por item |
| UC2 | Template por estágio + bullets de histórico sem parafrasear livremente |
| UC3 | Ordenação por `riskLevel` + lista fechada de ações sugeridas por tags |
| UC4 | Tabela `(Cargo.status × Negotiation.stage)` → passos; labels i18n |
| UC5 | Mensagens por enum em `messages/*`; próximos marcos derivados por regra |
| UC6 | FAQ por `(locale, role, pathname)` + links para telas |
| UC7 | Regras sobre `requiredDocuments`, ◇ estado `Document`, ◇ eventos `documentation_pending` |
| UC8 | Template sobre **agregados numéricos já calculados** (sem LLM nos números); texto só **interpreta** KPIs definidos |

---

## 9. Riscos

| Risco | Mitigação |
|-------|-----------|
| **Alucinação regulatória** (UC1, UC7) | Fallback obrigatório; revisão humana; disclaimers i18n fixos; `source` por item |
| **Alucinação operacional** (UC3, UC4) | Marcar `inferred`; não persistir automaticamente |
| **Vazamento lateral via linguagem natural** | Contexto mínimo autorizado; nunca enviar lista global do marketplace ao modelo |
| **Dependência de provedor** | Interface estável; circuit breaker; flag “model off” |
| **Custo e latência** | Cache por hash (TTL curto); debounce; limites de tokens |
| **Interpretação errada de KPIs** (UC8) | Somente após `docs/EXECUTIVE-DASHBOARD.md` estável + dados escopados; rótulos “demonstrativo” |
| **Implementação antes de segurança** | Gate §13 + política `AGENTS.md` |

---

## 10. Testes possíveis

**◇ Planejamento — não obriga testes neste artefato.**

| Camada | Escopo |
|--------|--------|
| **Unitário** | Allowlist de DTO; validação de schema de saída; fallbacks; redação para logs |
| **Integração** | ◇ Handler tipo `POST /api/ai/assist`: `401`/`403`; shape estável; ramo fallback ≡ ramo modelo (fixture) |
| **Contrato** | Snapshots JSON de saída por caso com entrada mínima (sem rede) |
| **Segurança negativa** | ID não autorizado → `403` ou contexto vazio |
| **i18n** | Novas chaves de disclaimer / fallback cobertas por `npm run check:i18n` |
| **E2E tardio** | Feature flag sempre fallback em CI; smoke opcional com sandbox fora do caminho crítico |

---

## 11. Roadmap incremental

**◇ Etapas sugeridas.**

1. **Pré-requisitos sem IA** — Endurecer leituras (`docs/API-SECURITY-AUDIT.md`); `ownerId`/escopo (`docs/SECURITY-PRODUCT-DECISIONS.md`); timestamps onde necessário (`docs/DATABASE-PLANNING.md`).
2. **Contratos + auditoria + flag** — Schemas entrada/saída versionados; armazenamento de auditoria; **modelo globalmente desligado** com fallback 100%.
3. **UC5 e UC2** — Somente leitura; explicações ancoradas em dados + i18n.
4. **UC3 e UC4** — Inferências rotuladas; sem escrita automática.
5. **UC6** — Baseline i18n; opcional parafraseo **depois**.
6. **UC7** — Após modelo mínimo de pendência documental ou heurística documentada + disclaimer.
7. **UC8** — Após agregados escopados do dashboard executivo (**◇** API agregadora).
8. **UC1** — Após `docs/DOCUMENTS-MODULE.md` e revisão jurídica/compliance.
9. **Observabilidade** — Métricas: fallback rate, latência, erros de schema, custo por caso.
10. **Revisão legal / DPO** — Antes de dados reais identificáveis.

---

## 12. Agentes futuros

**◇ Conceito apenas.** Agentes são **empacotamentos** de política + DTO + prompts internos versionados; **não** substituem §3.

Detalhamento nomeado pode seguir **`docs/AGENTS-ROADMAP.md`** (**◇**). Mapa ilustrativo:

| Agente ◇ | Casos |
|----------|--------|
| Document Agent | UC1, UC7 |
| Negotiation Agent | UC2 |
| Risk Agent | UC3 |
| Checklist Agent | UC4 |
| Support Agent | UC6 |
| Tracking Agent | Enriquece UC3/UC4 com `TrackingEvent` (`docs/TRACKING-TIMELINE.md`) |
| Executive Narrative Agent | UC8 (depende dashboard escopado — `docs/EXECUTIVE-DASHBOARD.md`) |

**Regra:** todo agente mantém **fallback determinístico** e **auditoria** no mesmo pipeline da §6.

---

## 13. Critérios de pronto para começar implementação

**◇ Gate conjunto produto + engenharia + segurança.** Somente após todos os itens abaixo (ou exceção explícita documentada):

| # | Critério |
|---|----------|
| G1 | Políticas **R1–R7** (§3) aceitas pelo time e refletidas em RFC técnica curta |
| G2 | Leituras sensíveis **não** dependem de “confiar no cliente” — escopo servidor alinhado à direção em `docs/API-SECURITY-AUDIT.md` (**◇ milestones acordados**) |
| G3 | Contratos JSON entrada/saída **versionados** + validação por schema definida |
| G4 | Caminho de **auditoria** mínima implementável (logs estruturados ou tabela ◇) |
| G5 | **Fallback 100% funcional** para o primeiro caso de uso escolhido (§8) com **paridade de UI** |
| G6 | **Feature flag** para desligar modelo globalmente sem quebrar build |
| G7 | **Disclaimers** em i18n para o caso de uso |
| G8 | **Sem SDK obrigatório no browser**; segredos apenas server-side |
| G9 | `npm run lint`, `npm run typecheck`, `npm run check:i18n`, `npm run test` verdes na baseline do PR que introduz infraestrutura |
| G10 | Para UC1/UC7: alinhamento com `docs/DOCUMENTS-MODULE.md`; para UC8: alinhamento com KPIs formais em `docs/EXECUTIVE-DASHBOARD.md` |

---

## Referências internas

| Documento | Uso |
|-----------|-----|
| `AGENTS.md` | Ordem: segurança, validação, testes antes de IA em produto |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Contexto produto e camadas |
| `docs/API-SECURITY-AUDIT.md` | Exposição atual e direção de auth |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Papéis, `approved`, ownership |
| `docs/DATABASE-PLANNING.md` | Persistência e auditoria durável |
| `docs/DOCUMENTS-MODULE.md` | Documentos ◇ |
| `docs/TRACKING-TIMELINE.md` | Eventos operacionais |
| `docs/EXECUTIVE-DASHBOARD.md` | KPIs e escopo executivo ◇ |
| `docs/AGENTS-ROADMAP.md` | Agentes nomeados ◇ |
| `docs/ARCHITECTURE.md` | Direções técnicas gerais |

Este arquivo **não** substitui parecer jurídico, DPIA ou política corporativa de uso de IA; deve ser revisado antes de qualquer processamento com dados reais identificáveis.
