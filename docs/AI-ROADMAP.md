# Roadmap da camada de IA — HydroRivers

Documento de **planejamento apenas**. Não implementa código. Objetivo: definir como introduzir capacidades de IA **assistiva** sem violar as políticas do projeto (**segurança, validação e testes antes de IA em produto**, vide `AGENTS.md`) e sem substituir decisão humana ou persistência autoritativa.

## Princípios obrigatórios (regras de produto)

| Regra | Implicação técnica |
|--------|---------------------|
| **IA não decide sozinha** | Saídas são **propostas** (sugestão, rascunho, classificação auxiliar). Fluxos que alteram estado exigem **ação explícita** do usuário ou sistema legível sem modelo. |
| **IA não altera dados críticos sem confirmação humana** | Nenhum `POST`/`PATCH`/`PUT` direto gerado só pelo modelo. Escrita opcional apenas via **confirm UI** → endpoint que valida permissões e payload **determinístico** (schema). |
| **IA deve usar dados estruturados** | Entrada principal: JSON/schema estável derivado do domínio (`Cargo`, `Negotiation`, `Vessel`, `TrackingEvent`, futuro `Document`). Texto livre só como campo secundário rotulado. |
| **IA deve ter fallback** | Mesmo caso de uso deve funcionar **sem modelo**: regras determinísticas, templates, ou “dados crus” formatados na UI. Timeout, rate limit e erro de provedor caem no fallback. |
| **IA deve registrar logs/auditoria** | Cada invocação: `requestId`, `userId`, `role`, escopo (`cargoId`, `negotiationId`, …), versão do prompt/schema, hash do input estruturado, latência, sucesso/falha, uso de fallback, **sem gravar dados pessoais desnecessários** (minimização). |

---

## Arquitetura proposta

### Visão em camadas

```txt
[ Cliente Next.js ]
       |
       v
[ API de orquestração / BFF ]  <-- autenticação, autorização, rate limit
       |
       +--> [ Serviço "AI Assist" ]  <-- monta payload estruturado + política do caso de uso
       |         |
       |         +--> [ Provedor de modelo ] (opcional, trocaável)
       |
       +--> [ Fallback determinístico ]  <-- mesma interface de saída (schema JSON)
       |
       v
[ Armazenamento de auditoria ]  <-- append-only ou tabela dedicada (futuro DB)
```

- **BFF / Route Handler dedicado** (ex.: `POST /api/ai/assist` ou rotas por caso): único ponto que chama o modelo; **nunca** expor API keys ao browser.
- **Serviço “AI Assist”** no servidor:
  - Valida sessão e **escopo** (usuário só vê cargas/negociações que já pode ler hoje).
  - Monta **input estruturado** (DTO versionado, ex.: `AiNegotiationSummaryInputV1`).
  - Chama provedor ou **fallback**.
  - Valida **saída** contra schema (ex.: Zod) antes de responder — texto livre apenas em campos permitidos e com limites de tamanho.
- **Provedor**: plugável (HTTP para LLM, ou modelo interno). Troca não altera contratos públicos estáveis.
- **Auditoria**: persistência separada de dados operacionais; retenção e LGPD/GDPR alinhadas ao backend real quando existir (`docs/DATABASE-PLANNING.md`).

### Fluxo de escrita (proibido automático)

```txt
IA sugere JSON estruturado → UI mostra diff/resumo → usuário confirma
→ cliente envia payload VALIDADO pelo mesmo schema que o servidor esperaria sem IA
→ endpoint de domínio existente ou novo endpoint “apply suggestion” que só aceita IDs + campos já whitelisted
```

A IA **não** substitui o handler de negócio; no máximo pré-preenche uma **proposta** que o usuário submete pelo fluxo normal.

---

## Casos de uso

### 1. Sugestão de documentos obrigatórios

| Aspecto | Detalhe |
|---------|---------|
| Objetivo | Completar ou revisar lista de documentos esperados para uma **carga** ou **negociação**, dados corredor, produto, temperatura e regulatório implícito no mock. |
| Entrada estruturada | `Cargo` (ou subset): `cargoType`, `productFamily`, `temperature`, `origin`/`destination`, `requiredDocuments[]`, `documents[]`, `documentReadiness`, metadados de conectividade. |
| Saída estruturada | Lista de `{ documentType, necessity: 'required'|'conditional', rationaleTag, confidenceBand }` + referência a regra determinística quando aplicável (`source: 'rule'|'model'`). |
| Fallback | Matriz fixa por `productFamily` + cópia de `requiredDocuments` já existente na carga; ordenação e labels só via template. |
| Confirmação | Usuário **adiciona/remove** itens na UI; persistência só via fluxo atual/futuro de edição de carga ou módulo de documentos (`docs/DOCUMENTS-MODULE.md`). |

### 2. Resumo de negociação

| Aspecto | Detalhe |
|---------|---------|
| Objetivo | Texto curto para painel: estágio, partes (IDs mascarados ou nomes já autorizados), valores, próximo passo sugerido **em linguagem natural**. |
| Entrada estruturada | `Negotiation`: `stage`, `status`, `amount`, `route`, `riskLevel`, `history[]`, IDs ligados (`cargoId`, `vesselId`) resolvidos **somente se** o usuário tiver permissão de leitura. |
| Saída estruturada | `{ summary: string (limitado), bullets: string[], stageInterpretation: DealStage }` onde `stageInterpretation` deve **coincidir** com o campo real ou vir marcado como `unknown`. |
| Fallback | Template por `stage` + concatenação de `history` já no mock; sem LLM. |
| Confirmação | Somente leitura; não altera negociação. |

### 3. Análise de risco operacional

| Aspecto | Detalhe |
|---------|---------|
| Objetivo | Priorizar alertas legíveis a partir de `operationalRisks`, `riskLevel`, conectividade, documentação e (futuro) eventos de tracking. |
| Entrada estruturada | `Cargo` + `Negotiation` + opcional lista resumida de `TrackingEvent` (kinds, status). |
| Saída estruturada | `{ severityOrdered: RiskItem[], drivers: string[], suggestedActions: string[] }` com `severityOrdered` espelhando ou **refinando** riscos já listados — nunca inventar novos IDs de incidente sem flag `inferred`. |
| Fallback | Ordenação por `riskLevel` + lista fixa `operationalRisks`; `suggestedActions` de biblioteca interna por tag. |
| Confirmação | Não grava risco novo; usuário pode **copiar** para comentário ou abrir ticket manual. Qualquer campo persistido no domínio exige fluxo apartado. |

### 4. Checklist operacional

| Aspecto | Detalhe |
|---------|---------|
| Objetivo | Lista de etapas (pré-embarque, em trânsito, atracação) alinhada ao estágio atual e ao tipo de serviço. |
| Entrada estruturada | `Cargo.status`, `Negotiation.stage`, `Vessel` resumido (calado, capabilities), política de conectividade. |
| Saída estruturada | `{ steps: { id, labelKeyOrText, done: boolean, optional: boolean }[], source }` — preferir `labelKeyOrText` referenciando i18n quando possível. |
| Fallback | Checklist estática por máquina de estados (`status` × `stage`); já é auditável sem modelo. |
| Confirmação | Marcar “feito” só grava se o produto tiver entidade de checklist; caso contrário, **somente UX local** ou integração futura com `TrackingEvent` / documentos. |

### 5. Explicação de status da carga

| Aspecto | Detalhe |
|---------|---------|
| Objetivo | Explicar em linguagem natural o que significa `CargoStatus` para o usuário e o que falta para avançar. |
| Entrada estruturada | `Cargo` (status, janela, documentReadiness, requiredDocuments resumo). |
| Saída estruturada | `{ explanation: string, nextMilestones: CargoStatus[], blockers: string[] }` com `nextMilestones` **subconjunto válido** da enum de domínio. |
| Fallback | Strings fixas por `CargoStatus` em `messages/*` (i18n); garantir paridade pt/en/es. |
| Confirmação | Leitura apenas; não muda status. |

---

## Limites de segurança

1. **Autenticação obrigatória** para todos os casos que carregam dados de negócio (alinhado à evolução desejada das APIs públicas — `docs/API-SECURITY-AUDIT.md`).
2. **Autorização por escopo**: mesmas regras de owner/participante que o restante da app; servidor monta DTO **após** filtrar campos permitidos (allowlist por caso de uso).
3. **Sem treinamento em dados de cliente** no MVP; preferir **processamento efêmero** (não armazenar prompt/saída completa sem política); auditoria guarda metadados + hash, não necessariamente texto integral.
4. **Output schema + limite de tokens** para conter injection e vazamento de instruções; rejeitar respostas que não validem no schema.
5. **Rate limit por usuário e por caso** para conter abuso e custo.
6. **Dados sensíveis**: mascarar emails, hashes, internal IDs em logs; usar IDs opacos já autorizados na UI.
7. **Compliance regulatória**: qualquer texto que pareça parecer “parecer jurídico” deve trazer **disclaimer** fixo (não gerado pelo modelo) na UI.

---

## Dados necessários (por caso)

| Caso | Dados mínimos | Dependências futuras |
|------|----------------|----------------------|
| Documentos obrigatórios | `Cargo` (+ negociação se amarrada) | `Document` persistido, matriz regulatória versionada |
| Resumo de negociação | `Negotiation` + metadados de carga/embarcação autorizados | Timestamps ISO para linha do tempo factual |
| Risco operacional | `Cargo`, `Negotiation`, riscos mock | Eventos de tracking enriquecidos, clima/porto (futuro) |
| Checklist operacional | `Cargo.status`, `Negotiation.stage`, `Vessel` | Entidade checklist ou só tracking events |
| Status da carga | `Cargo` completo autorizado | Regras de transição explícitas no backend |

Todos os inputs devem ser obtidos por **serviços/server** já validados — não aceitar blob JSON arbitrário do cliente.

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| **Alucinação regulatória** | Fallback obrigatório; disclaimers; saída estruturada com `source` e revisão humana antes de qualquer uso externo. |
| **Vazamento lateral** | Prompt só com dados do escopo autorizado; não enviar lista completa do marketplace. |
| **Dependência de provedor** | Interface estável + fallback + circuit breaker. |
| **Custo e latência** | Cache por hash do input estruturado (TTL curto), debounce na UI. |
| **Auditoria incompleta** | Modelo de log antes do primeiro deploy; testes de que todo caminho grava auditoria mínima. |
| **Desvio de roadmap** | Implementar apenas após lint/typecheck/testes de segurança estáveis na baseline (`AGENTS.md`). |

---

## Ordem segura de implementação

1. **Pré-requisitos (sem IA)**  
   - Consolidar autorização nas **leituras** sensíveis.  
   - Schemas de payload (Zod ou equivalente) nos endpoints que a IA poderia “sugerir” em paralelo.  
   - Baseline de testes verde conforme política do repositório.

2. **Infraestrutura transversal**  
   - Contrato `AiAssistRequest` / `AiAssistResponse` versionados + validação saída.  
   - Armazenamento de auditoria (tabela ou log estruturado).  
   - Fallback determinístico como implementação **primeira** (feature flag “model off”).

3. **Casos somente leitura (menor risco)**  
   - **5. Explicação de status da carga** (fallback i18n primeiro).  
   - **2. Resumo de negociação** (sem persistência).

4. **Casos com maior superfície semântica**  
   - **3. Análise de risco operacional** (sempre rotular inferências).  
   - **4. Checklist operacional** (priorizar checklist determinística + opcional LLM para wording).

5. **Caso com impacto em compliance**  
   - **1. Sugestão de documentos obrigatórios** — somente após alinhamento com **módulo de documentos** e clareza jurídica de origem das regras (`docs/DOCUMENTS-MODULE.md`).

6. **Observabilidade e durabilidade**  
   - Métricas (taxa fallback, latência, erros schema), revisão de retenção de logs.

7. **E2E seletivo**  
   - Fluxos com flag de modelo desligada (fallback) para CI estável; opcional smoke com sandbox do provedor fora do caminho crítico.

---

## Relação com documentos existentes

- Política global (IA depois de segurança/testes): `AGENTS.md`  
- Modelo de dados alvo e auditoria futura: `docs/DATABASE-PLANNING.md`  
- Documentos e permissões: `docs/DOCUMENTS-MODULE.md`  
- Eventos operacionais: `docs/TRACKING-TIMELINE.md`  
- Exposição de dados nas APIs: `docs/API-SECURITY-AUDIT.md`  

Este roadmap **não** substitui parecer jurídico nem políticas de dados pessoais; deve ser revisado antes de qualquer processamento em produção.
