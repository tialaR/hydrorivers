# Roadmap de agentes inteligentes — HydroRivers

**Tipo:** documentação **somente de planejamento — visão futura / roadmap**.

**Escopo:** descreve **agentes de produto** (assistência contextual sobre o domínio HydroRivers). **Não implementa agentes**, **não adiciona SDK**, **não altera código nem testes**. Qualquer comportamento descrito deve ser considerado **inexistente em produto** até passar pelos critérios mínimos deste documento.

**Distinção importante:** este arquivo não substitui **`AGENTS.md`** na raiz do repositório — aquele orienta **desenvolvimento humano e uso de ferramentas de IA na codificação**. Aqui, “agente” significa **pacote futuro de política + DTO + (opcional) modelo**, sempre subserviente à **`docs/AI-ROADMAP.md`**.

**Base:** `docs/AI-ROADMAP.md`, `docs/DEVELOPER-AI-ONBOARDING.md`, `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`, `docs/DATABASE-PLANNING.md`, `docs/DOCUMENTS-MODULE.md`, `docs/TRACKING-TIMELINE.md`.

---

### Legenda

| Marco | Significado |
|-------|-------------|
| **◇ Futuro** | Planejado; depende de pré-requisitos de dados, segurança e produto. |

---

## Princípios transversais (◇ obrigatórios quando houver implementação)

Herança direta de **`docs/AI-ROADMAP.md`**:

| Princípio | Significado para agentes |
|-----------|---------------------------|
| **Não decisório** | Agente não altera estado autoritativo sozinho. |
| **Confirmação humana para escrita** | Persistência ou efeitos irreversíveis só após revisão explícita → endpoints de domínio validados. |
| **Paridade de permissões** | Contexto montado apenas com dados que o usuário poderia ler pela API **◇ endurecida**. |
| **DTO estruturado** | Entrada/saída versionadas e validadas por schema; texto livre do usuário isolado e limitado. |
| **Fallback determinístico** | Mesmo contrato JSON com ou sem modelo; falha do provedor não amplia escopo. |
| **Auditoria** | Toda invocação registrada com metadados mínimos (**◇** persistência durável com DB — `docs/DATABASE-PLANNING.md`). |
| **Explicação** | Recomendações com âncoras em dados ou tag `inferred` quando não dedutíveis. |

---

## Arquitetura geral dos agentes (◇ futura)

Visão em camadas — **nenhuma peça abaixo existe como produto só por estar documentada**:

```txt
[ Cliente Next.js ]
       |
       v
[ Route Handler / BFF ]          <-- sessão, autorização, rate limit; único lugar permitido para orquestrar agente/modelo
       |
       +--> [ Orquestrador "Agent Runner" ]   <-- resolve agentId, monta allowlist de campos, chama fallback ou modelo
       |         |
       |         +--> [ Provedor de modelo ]   <-- opcional, trocável; sem SDK obrigatório no browser
       |
       +--> [ Fallback determinístico por agente ]
       |
       v
[ Auditoria ◇ persistência ]
```

- **Contratos:** entrada/saída por agente com versão (`schemaVersion`); validação estrita antes de responder ao cliente.
- **Sem SDK no cliente:** chaves e integrações ficam **server-side**.
- **Agentes são perfis de política**, não microsserviços obrigatórios: podem compartilhar o mesmo binário com **políticas diferentes** por `agentId`.

---

## Relação com permissões e roles (◇ futura)

| Role | Observação para todos os agentes |
|------|-----------------------------------|
| **shipper** | Contexto centrado em cargas onde é **`ownerId`** **◇** (decisão em `docs/SECURITY-PRODUCT-DECISIONS.md`) e negociações onde é **`shipperId`**. |
| **carrier** | Negociações como **`carrierId`**; frota no escopo do usuário; respeitar **`approved`** — carriers não aprovados não devem receber assistência que dependa de mutações bloqueadas sem mascarar o motivo. |
| **admin** | Escopo ampliado **somente** onde a política admin já permite leitura real; agente **não** é atalho para contornar segregação futura nem **`mock-mode`** para não-admin (`docs/API-SECURITY-AUDIT.md`). |
| **Governo / institucional ◇** | Persona de produto (`docs/DEVELOPER-AI-ONBOARDING.md`) — **◇** claims ou role técnica dedicada antes de Impact Agent ou agregações sensíveis; agregação mínima para mitigar antitruste. |

**Regra de ouro:** se **`GET`** endurecido futuro não devolver um recurso ao usuário, **nenhum agente** pode incluí-lo no contexto — inclusive via linguagem natural.

---

## Fallback sem agente (◇ obrigatório)

Para **cada** agente:

- Deve existir caminho **100% determinístico** (regras, templates i18n, tabelas estágio/status) que produz **o mesmo schema JSON** que o caminho com modelo.
- Feature flag global **modelo desligado** deve manter o produto utilizável em CI e ambientes restritos (`docs/AI-ROADMAP.md`).
- Circuit breaker no provedor → fallback automático **sem** elevação de privilégio.

---

## Agentes previstos — fichas completas

Cada agente segue a mesma estrutura: **1–11**.

---

### Document Agent (◇ futuro)

#### 1. Responsabilidade

Sugerir e priorizar **pacotes documentais** (obrigatórios, condicionais, próximos passos) para cargas e negociações; explicar lacunas face a `requiredDocuments` e **◇** entidade `Document`; **nunca** substituir parecer oficial ou checklist regulatório definitivo (`docs/DOCUMENTS-MODULE.md`).

#### 2. Público-alvo

Primário: **shipper** e **carrier** envolvidos na mesma negociação ou na carga visível. Secundário **◇**: **admin** em modo suporte/compliance (somente com política explícita). Não destinado ao público externo sem autenticação.

#### 3. Dados que pode acessar (◇ após autorização)

Subconjuntos autorizados no servidor:

- **`Cargo`:** `cargoType`, `productFamily`, `temperature`, corredor/origem/destino, `requiredDocuments`, listas textuais de documentos mock, `documentReadiness`, conectividade narrativa.
- **`Negotiation`** ligada por IDs permitidos: `stage`, `status`, lista textual `documents` quando existir no modelo.
- **◇ Futuro:** metadados **`Document`** (tipo, status, visibilidade) — **sem** bytes de arquivo nem URLs pré-assinadas em prompt.

#### 4. Dados que não pode acessar

- Cargas ou negociações **fora do escopo** da sessão.
- **Lista global** do marketplace ou “todos os documentos da plataforma”.
- Conteúdo binário de arquivos, PII de terceiros não estritamente necessária, credenciais, logs de outros usuários.
- **Hashes de senha** ou dados de sessão alheia.

#### 5. Ações permitidas

- Emitir **JSON estruturado** de sugestões (`documentType`, prioridade, `rationaleAnchors`, `source: 'rule' | 'model'`, `inferred` quando aplicável).
- Ordenar e rotular para UI; acionar **fallback** por matriz produto/corredor.

#### 6. Ações proibidas

- Upload, exclusão ou alteração direta em storage.
- Persistir mudanças em `requiredDocuments` ou status legal **sem** fluxo humano → endpoint de domínio.
- Criar obrigações regulatórias **novas** não respaldadas por matriz versionada **◇**.

#### 7. Quando precisa de aprovação humana

**Sempre** que houver **persistência** ou efeito jurídico/operacional equivalente (aceitar documento, rejeitar, marcar compliance). Sugestões em tela são **rascunho** até confirmação explícita item a item ou lote auditável.

#### 8. Logs / auditoria necessários

`requestId`, timestamp UTC, `userId`, `role`, `agent=document`, `useCase`, `schemaVersion`, IDs autorizados (`cargoId`, `negotiationId`), hash do payload estruturado de entrada, `usedFallback`, resultado validação schema, contagem de sugestões, latência **◇** evitar texto integral sem política de retenção (`docs/DATABASE-PLANNING.md`).

#### 9. Riscos

Alucinação regulatória; excesso de confiança em checklist gerado; vazamento de metadados sensíveis em logs; confusão entre “sugerido pela plataforma” e “exigido pela lei”.

#### 10. Testes possíveis (◇ planejamento)

Unitários: allowlist + schema de saída + fallback por `productFamily`/corredor. Integração: `401`/`403` fora de escopo; shape idêntico com modelo desligado. Contrato: snapshots estáveis. Segurança: IDs não autorizados não aparecem na saída.

#### 11. Métricas de sucesso (◇ produto)

- Taxa de uso do fallback vs modelo (estabilidade).
- **Adoption:** % de fluxos onde usuário **confirma** pelo menos uma sugestão vs abandono (sem medir “decisão da IA”).
- Tempo até usuário marcar pendência como “entendida” (proxy de clareza).
- Incidentes reportados de orientação documental incorreta / escalações ao suporte humano.

---

### Risk Agent (◇ futuro)

#### 1. Responsabilidade

Consolidar e **priorizar** alertas operacionais narrativos a partir de dados existentes (`operationalRisks`, `riskLevel`, conectividade, estágio de negócio); produzir **ações sugeridas** não vinculantes e marcadas quando **inferidas**.

#### 2. Público-alvo

**Shipper**, **carrier** e **admin** (este último ◇ apenas onde já há permissão de leitura das mesmas entidades). Adequado a telas de detalhe de carga/negociação.

#### 3. Dados que pode acessar (◇ após autorização)

- **`Cargo`:** `operationalRisks`, `documentReadiness`, `predictability`, `connectivity`, `status`.
- **`Negotiation`:** `riskLevel`, `stage`, `status`.
- **◇ Opcional:** lista resumida de **`TrackingEvent`** autorizados (`kind`, `status`, `occurredAt` se existir).

#### 4. Dados que não pode acessar

Negociações/cargas de terceiros; séries globais não filtradas; dados de telemetria/GPS **ineditos** no domínio; benchmarks competitivos identificáveis sem política.

#### 5. Ações permitidas

Saída estruturada: severidades ordenadas, drivers, `suggestedActions[]` de biblioteca **fechada**, flags `inferred`. Fallback: ordenação por `riskLevel` + eco determinístico de `operationalRisks`.

#### 6. Ações proibidas

Persistir incidentes ou alterar `riskLevel`/listas só pelo modelo; declarar conformidade legal ou segurança física **garantidas**; criar obrigações operacionais formais sem sistema dedicado.

#### 7. Quando precisa de aprovação humana

Qualquer **registro persistente** de incidente ou mudança de classificação oficial **◇** exige fluxo próprio + confirmação. Modo leitura **não persiste**.

#### 8. Logs / auditoria necessários

Núcleo padrão + `agent=risk`; por item da saída, indicar origem **campo domínio** vs **inferência**; IDs autorizados e versão do conjunto de regras fallback.

#### 9. Riscos

Sensacionalização; omitir ausência de dados críticos; usuário tomar decisão só pelo texto sem ler campos-fonte.

#### 10. Testes possíveis

Golden files no fallback; invariantes (tamanho máximo da lista; IDs citados ⊆ entrada); integração com escopo negado.

#### 11. Métricas de sucesso

- Correlação entre severidade exibida e campos `riskLevel`/`operationalRisks` (auditoria de consistência interna).
- Redução de tickets “o que é esse risco?” **◇** medida por pesquisa ou menos tempo na página de ajuda.
- Taxa de `inferred` quando dados são esparsos — monitorar para calibragem.

---

### Negotiation Agent (◇ futuro)

#### 1. Responsabilidade

Gerar **resumos** e **próximos passos sugeridos** para negociações; auxiliar leitura de histórico; clarificar estágio atual (**DealStage** / equivalente) sem alterar o registro.

#### 2. Público-alvo

**Shipper** e **carrier** participantes da negociação; **admin** ◇ apenas se política permitir leitura da mesma negociação.

#### 3. Dados que pode acessar (◇ após autorização)

**`Negotiation`:** `stage`, `status`, valores textuais, `history`, rotas; identidades públicas conforme política atual/futura.

**`Cargo` / `Vessel`** apenas em **subconjunto resumido** se IDs ligados forem legíveis ao usuário.

#### 4. Dados que não pode acessar

Negociações de terceiros; campos internos de outros usuários; propostas ou histórico não exposto pela API autorizada; dados “admin-only” sem política.

#### 5. Ações permitidas

Texto limitado + bullets; `stageInterpretation` coerente com campos reais ou flag `unknown`; fallback por templates por estágio + concatenação controlada de `history`.

#### 6. Ações proibidas

`PATCH`/`POST` em negociação (aceitar, recusar, valores) sem UI humana → endpoints legítimos; revelar dados de contraparte além do permitido; alterar `amount`/estágio automaticamente.

#### 7. Quando precisa de aprovação humana

**Todo** efeito comercial ou mudança de estado permanece **100% humano** via fluxos existentes; agente só **informa**.

#### 8. Logs / auditoria necessários

`agent=negotiation`, IDs autorizados, hash do subset de entrada, versão de template/fallback, `usedFallback`, latência.

#### 9. Riscos

Resumo enviesado ou omissão de risco alto; dependência de `history` textual inconsistente; linguagem que sugira acordo já firmado.

#### 10. Testes possíveis

Snapshots do fallback por estágio; invariante `stageInterpretation` vs `negotiation.stage` ou mismatch explícito; testes de isolamento entre shipper/carrier.

#### 11. Métricas de sucesso

- Tempo médio até usuário executar próxima ação correta no fluxo (proxy — **◇** com cuidado causal).
- Clareza: pesquisas rápidas pós-visualização ou redução de erros de estágio na UI **◇**.
- Taxa de fallback — monitor de estabilidade.

---

### Tracking Agent (◇ futuro)

#### 1. Responsabilidade

Explicar **timeline operacional**; sugerir **checklist** alinhado a `Cargo.status`, `Negotiation.stage` e eventos (`OperationalTrackingEventKind` — `docs/TRACKING-TIMELINE.md`); destacar atrasos **somente** quando sustentados nos dados.

#### 2. Público-alvo

Participantes da carga/negociação (**shipper**, **carrier**) com eventos autorizados; **admin** ◇ conforme política.

#### 3. Dados que pode acessar (◇ após autorização)

**`TrackingEvent`** filtrados por `cargoId`/`negotiationId` autorizados; campos permitidos incluem `kind`, `status`, `title`, `description`, `occurredAt`, `recordedAt` **◇**.

**`Cargo.status`**, **`Negotiation.stage`** para contextualizar checklist.

#### 4. Dados que não pode acessar

Eventos de outras cargas; posição GPS ou telemetria não modelada; dados de outros usuários; inferências de localização física **sem** campo-fonte.

#### 5. Ações permitidas

Lista estruturada de passos sugeridos + explicações curtas com âncoras; fallback por máquina determinística (`status` × `stage` × últimos eventos).

#### 6. Ações proibidas

Inserir ou alterar eventos persistidos **sem** API humana auditável; simular sincronização ou ETA não presentes nos dados; marcar etapa como “oficialmente concluída” no sistema só pelo agente.

#### 7. Quando precisa de aprovação humana

**Todo** registro novo na timeline oficial ou mudança de estado persistido **◇** exige confirmação e uso do fluxo dedicado (`docs/TRACKING-TIMELINE.md`).

#### 8. Logs / auditoria necessários

`agent=tracking`, intervalo temporal dos eventos considerados, contagem de eventos, IDs autorizados, `usedFallback`, presença/ausência de timestamps ISO.

#### 9. Riscos

Falsa sensação de rastreio em tempo real; inferência incorreta quando `occurredAt` ausente; linguagem que substitua evidência oficial.

#### 10. Testes possíveis

Matrizes de checklist fallback; lista vazia de eventos → mensagem segura sem inventar fatos; escopo negado por participante.

#### 11. Métricas de sucesso

- Consistência entre texto do agente e eventos `kind` efetivamente presentes (amostragem auditada).
- Redução de dúvidas sobre “em que etapa estou?” **◇**.
- Taxa de uso de fallback vs modelo.

---

### Impact Agent (◇ futuro)

#### 1. Responsabilidade

Traduzir indicadores de **impacto socioambiental** e valor público (ex.: `co2Saving`, corredor, família de produto) em linguagem acessível — **sem** emitir relatório regulatório oficial nem auditoria ambiental certificada.

#### 2. Público-alvo

Usuários autenticados com **leitura** da carga ou agregação autorizada; persona **governo/institucional ◇** apenas após política de escopo explícita (agregação mínima). Uso público externo **◇** exige revisão institucional prévia.

#### 3. Dados que pode acessar (◇ após autorização)

Campos **já autorizados** de **`Cargo`** e **◇** agregações utilizadas em páginas de impacto/governo — apenas números e labels presentes nos DTOs.

#### 4. Dados que não pode acessar

Volumes estratégicos ou dados competitivos não autorizados ao papel; séries brutas identificáveis de terceiros; PII desnecessária.

#### 5. Ações permitidas

Resumo textual **extractivo** + bullets referenciando **literalmente** números-fonte do DTO; fallback por templates (`productFamily`, corredor).

#### 6. Ações proibidas

Inventar percentuais ou métricas não presentes nos dados; afirmar certificações ou cumprimento legal sem campo-fonte; greenwashing por linguagem gloriosa sem âncora numérica.

#### 7. Quando precisa de aprovação humana

**Qualquer** publicação institucional de novo indicador ou mudança de narrativa oficial **fora** do escopo do agente; uso interno somente leitura não dispensa disclaimer **◇**.

#### 8. Logs / auditoria necessários

`agent=impact`, IDs de cargas ou IDs de agregação autorizada, versão/indicadores-fonte citados, `usedFallback`.

#### 9. Riscos

Greenwashing inadvertido; uso político de texto sem revisão humana; confundir dados demo com série oficial.

#### 10. Testes possíveis

Invariante: todo número na saída ⊆ entrada (extração validada); snapshots de fallback; testes de escopo por role.

#### 11. Métricas de sucesso

- **Violations:** contagem de saídas que falham validação extractiva — deve tender a zero.
- Engajamento com links “ver metodologia” **◇** quando existirem.
- Feedback institucional em revisões de conteúdo (qualitativo).

---

### Support Agent (◇ futuro)

#### 1. Responsabilidade

Responder dúvidas **de produto e navegação** (“o que faço aqui?”) usando **base curada** + **DTO resumido** do recurso em foco quando aplicável; encaminhar a humano quando fora do escopo.

#### 2. Público-alvo

**Shipper**, **carrier**, **admin** autenticados — intents fechados por role e rota; **não** substituir suporte jurídico/compliance formal.

#### 3. Dados que pode acessar (◇ após autorização)

FAQ/help versionado **◇**, glossário de enums (`Cargo.status`, estágios de negociação), **rótulos já visíveis** na tela atual (IDs permitidos).

#### 4. Dados que não pode acessar

Todo o marketplace; dados de outros usuários; conteúdo de APIs não autorizadas; instruções para **`mock-mode`** ou bypass de segurança para não-admin.

#### 5. Ações permitidas

Respostas curtas; deep-links para telas reais; escalação explícita ao suporte humano.

#### 6. Ações proibidas

Executar operações remotas em nome do usuário; revelar dados de terceiros; ensinar evasão de políticas; responder sobre dados não confirmados na sessão.

#### 7. Quando precisa de aprovação humana

Alterações de conta, dados sensíveis, disputas contratuais e qualquer tema que exija parecer especializado — **fora** do agente ou com humano obrigatório.

#### 8. Logs / auditoria necessários

`agent=support`, intent enum (taxonomia fechada), `pathname`, locale, truncamento/redação da query livre conforme política PII, `usedFallback`.

#### 9. Riscos

Prompt injection / jailbreak; respostas desatualizadas face ao produto; confundir FAQ com obrigação legal.

#### 10. Testes possíveis

Golden FAQs; testes negativos de injeção (entrada maliciosa não produz ações proibidas); regressão i18n em templates.

#### 11. Métricas de sucesso

- Taxa de escalação para humano bem-sucedida (issues resolvidos vs abandonados).
- **Unsafe suggestion rate ◇** — amostragem manual ou classificador para respostas que violariam política (meta: zero tolerância).
- Satisfação opcional (CSAT) em fluxos de ajuda.

---

## Ordem incremental de implementação (◇ recomendada)

Ordem macro entre agentes — alinhada à **`docs/AI-ROADMAP.md`** (pré-requisitos de segurança antes de modelo):

| Etapa | Agente | Motivo |
|-------|--------|--------|
| 1 | **Negotiation Agent** | Somente leitura; forte encaixe no fluxo atual; fallback por templates claro. |
| 2 | **Tracking Agent** | Sinergia com `docs/TRACKING-TIMELINE.md`; risco médio se timestamps esparsos — mitigar com texto cauteloso. |
| 3 | **Risk Agent** | Campos `operationalRisks` / `riskLevel` já narrativos no domínio; disclaimers obrigatórios. |
| 4 | **Impact Agent** | Começar **extractivo**; revisão institucional antes de texto voltado ao público externo. |
| 5 | **Document Agent** | Depende de **`docs/DOCUMENTS-MODULE.md`** e matriz regulatória versionada. |
| 6 | **Support Agent** | Superfície de abuso maior (texto livre); implementar após hardening de auth/API e base FAQ estável. |

**Pré-requisito transversal:** políticas **`docs/AI-ROADMAP.md` §13**, endurecimento progressivo **`docs/API-SECURITY-AUDIT.md`**, política **`AGENTS.md`** (sem IA/agents prematuramente).

---

## Critérios mínimos antes de implementar qualquer agente

**◇ Gate conjunto** — espelho enxuto de `docs/AI-ROADMAP.md` §13, especializado para agentes:

| ID | Critério |
|----|----------|
| A1 | Princípios transversais (topo deste doc) aceitos e RFC técnica por agente |
| A2 | Schema JSON entrada/saída **versionado** + validação obrigatória |
| A3 | **Fallback** funcional com **paridade de contrato** para o agente escolhido |
| A4 | **Auditoria** mínima implementável (logs estruturados ou tabela ◇) |
| A5 | **Feature flag** desliga modelo sem quebrar build ou UX crítica |
| A6 | **Disclaimers** i18n onde confusão com parecer oficial for plausível |
| A7 | Escopo servidor consistente com **paridade de API ◇ endurecida** — sem montar contexto “por conveniência” |
| A8 | Sem SDK obrigatório no browser; segredos apenas server-side |
| A9 | Baseline verde: `npm run lint`, `npm run typecheck`, `npm run check:i18n`, `npm run test` no PR que introduz infraestrutura |
| A10 | Document Agent / partes documentais de Tracking **◇**: alinhamento com `docs/DOCUMENTS-MODULE.md` antes de produção real |

---

## Referências internas

| Documento | Uso |
|-----------|-----|
| `docs/AI-ROADMAP.md` | Princípios, arquitetura assistiva, critérios de pronto |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Domínios e público |
| `docs/API-SECURITY-AUDIT.md` | Escopo e riscos atuais das APIs |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Roles, `approved`, ownership |
| `docs/DATABASE-PLANNING.md` | Persistência e auditoria durável |
| `docs/DOCUMENTS-MODULE.md` | Document Agent |
| `docs/TRACKING-TIMELINE.md` | Tracking Agent |
| `AGENTS.md` | Política de desenvolvimento — IA/agents após segurança e testes |

Este arquivo **não** substitui parecer jurídico, DPIA ou política corporativa de uso de modelos; revise antes de dados reais identificáveis.
