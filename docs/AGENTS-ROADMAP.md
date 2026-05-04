# Roadmap de agentes inteligentes — HydroRivers

Documento de **planejamento apenas** (sem código). Define **agentes de produto** orientados a IA assistiva — **distintos** dos “agentes” descritos em `AGENTS.md` (instruções para ferramentas de desenvolvimento).

Princípios herdados de `docs/AI-ROADMAP.md`:

- IA não decide sozinha; não altera dados críticos sem confirmação humana.
- Entradas/saídas preferencialmente **estruturadas** e validadas por schema.
- **Fallback** determinístico obrigatório.
- **Auditoria** em todas as invocações.

---

## Document Agent

### 1. Responsabilidade

Sugerir e priorizar **pacotes documentais** (obrigatórios, condicionais, próxima fase) para cargas e negociações; explicar lacunas face ao que já está modelado em `requiredDocuments` / futura entidade `Document`; **nunca** substituir parecer oficial ou checklist regulatório definitivo.

### 2. Dados que pode acessar

Somente via servidor, após autorização no escopo do usuário:

- Subconjuntos de **`Cargo`**: `cargoType`, `productFamily`, `temperature`, corredor, `requiredDocuments`, `documents`, `documentReadiness`, conectividade.
- **`Negotiation`** ligada (IDs permitidos): `stage`, `status`, lista textual `documents` mock.
- Futuro: metadados **`Document`** (`docs/DOCUMENTS-MODULE.md`) sem conteúdo binário bruto em prompt (apenas tipo, status, visibilidade).

### 3. Ações permitidas

- Emitir **JSON estruturado** de sugestões (`documentType`, `necessity`, `rationaleTag`, `source: 'rule'|'model'`).
- Ordenar/racionalizar lista para exibição na UI.
- Acionar **fallback** por matriz `productFamily` / corredor quando o modelo falhar.

### 4. Ações proibidas

- Upload, exclusão ou alteração direta de arquivos/armazenamento.
- Alterar `requiredDocuments` ou status legal real sem fluxo humano confirmado no endpoint de domínio.
- Acessar documentos de terceiros fora do escopo da sessão.
- Inferir dados pessoais não presentes nos DTOs autorizados.

### 5. Necessidade de aprovação humana

**Obrigatória** para qualquer persistência (edição de carga, anexos, mudança de status documental). Sugestões são só **rascunho** até o usuário confirmar item a item ou submeter formulário validado.

### 6. Logs necessários

`requestId`, `agent=document`, `userId`, `role`, `cargoId`/`negotiationId`, versão do schema de entrada/saída, **hash** do payload estruturado, `usedFallback`, latência, resultado da validação schema, contagem de sugestões (não guardar texto integral sem política de retenção).

### 7. Riscos

Alucinação regulatória (exigências inventadas); excesso de confiança em checklist gerado; vazamento de metadados sensíveis em logs.

### 8. Testes possíveis

- Unitários: DTO allowlist + schema de saída + fallback por `productFamily`.
- Integração: endpoint retorna só campos whitelisted; `401`/`403` fora de escopo.
- Contrato: mesma resposta shape com modelo desligado (fallback).

### 9. Ordem de implementação

1. Fallback determinístico + API estável.  
2. UI de revisão manual das sugestões.  
3. Integração opcional com LLM após módulo de documentos esboçado em dados.  
4. Auditoria persistente + revisão jurídica de disclaimers.

**Prioridade global entre agentes:** *Baixa até médio prazo* — depende fortemente de `docs/DOCUMENTS-MODULE.md` e de regras regulatórias versionadas.

---

## Risk Agent

### 1. Responsabilidade

Consolidar e **priorizar** alertas operacionais a partir de dados já existentes (`operationalRisks`, `riskLevel`, conectividade, estágio de negócio); produzir narrativa auxiliar e **ações sugeridas** rotuladas como não vinculantes.

### 2. Dados que pode acessar

- **`Cargo`**: `operationalRisks`, `documentReadiness`, `predictability`, `connectivity`, status.
- **`Negotiation`**: `riskLevel`, `stage`, `status`.
- Opcional autorizado: lista resumida de **`TrackingEvent`** (`kind`, `status`, timestamps se existirem).

### 3. Ações permitidas

- Saída estruturada: severidade ordenada, drivers, `suggestedActions[]`, flags `inferred` quando extrapolar além dos campos explícitos.
- Fallback: ordenação por `riskLevel` + cópia determinística de `operationalRisks`.

### 4. Ações proibidas

- Criar ou gravar incidentes reais no banco sem fluxo próprio.
- Alterar `riskLevel` ou listas persistidas só pelo modelo.
- Afirmar conformidade legal ou segurança física garantida.

### 5. Necessidade de aprovação humana

Persistência de novo risco ou mudança de classificação **exige** confirmação; modo leitura (painel) não persiste.

### 6. Logs necessários

Mesmo núcleo de auditoria + `agent=risk`; registrar se cada item da saída veio de **campo domínio** vs **inferência**.

### 7. Riscos

Sensacionalização de risco; mascarar ausência de dados críticos; decisões tomadas pela UI sem leitura humana.

### 8. Testes possíveis

- Golden files: entrada fixa mock → ordem esperada dos alertas no fallback.
- Propriedade: nunca mais itens que uma lista máxima; todos os IDs citados existem no input.
- Integração: usuário sem acesso à negociação não recebe dados da mesma.

### 9. Ordem de implementação

1. Fallback puro + schema de saída.  
2. UI somente leitura com disclaimers.  
3. Camada LLM opcional para wording (mesmo schema).  
4. Ligação futura com ticketing/incidentes quando existir produto.

**Prioridade global:** *Média* — alto valor no MVP atual porque o domínio já expõe `operationalRisks` / `riskLevel`.

---

## Negotiation Agent

### 1. Responsabilidade

Gerar **resumos** e **próximos passos sugeridos** para negociações; auxiliar leitura de histórico mock; facilitar onboarding do usuário no estágio atual (`DealStage`).

### 2. Dados que pode acessar

- **`Negotiation`** autorizada: `stage`, `status`, valores textuais, `history`, rotas, partes **já visíveis** à sessão (nomes públicos conforme política).
- Objeto **`Cargo`** / **`Vessel`** resumido se o usuário tiver permissão de leitura nos IDs ligados.

### 3. Ações permitidas

- Texto limitado + bullets estruturados; espelhar `stageInterpretation` coerente com o campo real ou marcar `unknown`.
- Fallback: templates por `stage` + concatenação de `history`.

### 4. Ações proibidas

- `PATCH`/`POST` em negociação ou proposta sem confirm UI → endpoint legítimo.
- Revelar identidade ou dados de contraparte além do permitido pela autorização atual.
- Alterar valores (`amount`) ou estágio por conta própria.

### 5. Necessidade de aprovação humana

Qualquer **efeito lateral** (aceitar, recusar, contraproposta) permanece 100% humano via fluxos existentes; agente só informa.

### 6. Logs necessários

`agent=negotiation`, IDs autorizados, hash do subset usado, versão template/fallback.

### 7. Riscos

Resumo enviesado ou omissão de risco alto; dependência de `history` textual inconsistente.

### 8. Testes possíveis

- Snapshot estável do fallback por estágio.
- Validação: `stageInterpretation === negotiation.stage` ou flag explícita de mismatch.
- Segurança: usuário shipper não recebe negociação de terceiros.

### 9. Ordem de implementação

1. Fallback template + limite de caracteres.  
2. Endpoint dedicado somente leitura.  
3. Opcional LLM com mesmo schema.  
4. Internacionalização das strings geradas por template (preferir keys i18n).

**Prioridade global:** *Alta entre agentes de leitura* — encaixa no fluxo atual sem persistência.

---

## Tracking Agent

### 1. Responsabilidade

Explicar timeline operacional; gerar **checklist operacional** sugerido alinhado a status de carga/negócio e eventos (`OperationalTrackingEventKind` onde existir); destacar atrasos e lacunas de sincronização **com base em dados fornecidos**.

### 2. Dados que pode acessar

- **`TrackingEvent`** filtrados por `cargoId`/`negotiationId` autorizados.
- **`Cargo.status`**, **`Negotiation.stage`** para contextualizar checklist.

### 3. Ações permitidas

- Gerar lista estruturada de passos (`id`, label, opcional obrigatório) + explicações curtas.
- Fallback: máquina de estados determinística (`status` × `stage`) conforme `docs/TRACKING-TIMELINE.md` / regras internas.

### 4. Ações proibidas

- Inserir eventos de rastreio reais ou alterar `status`/`kind` persistidos sem API humana.
- Simular posição GPS ou telemetria inexistente.

### 5. Necessidade de aprovação humana

Registro de novo evento ou “marcar etapa como concluída” em sistema persistido **exige** confirmação e uso do fluxo oficial (futuro `POST` auditável).

### 6. Logs necessários

`agent=tracking`, escopo temporal dos eventos considerados, contagem de eventos, uso de fallback.

### 7. Riscos

Falsa sensação de rastreio em tempo real; inferência errada quando `occurredAt` ausente.

### 8. Testes possíveis

- Unitários: checklist fallback para cada par estágio/status relevante.
- Integração: lista de eventos vazia → mensagem segura sem inventar fatos.

### 9. Ordem de implementação

1. Checklist determinística + explicações i18n.  
2. Leitura de eventos com schema estável (`docs/TRACKING-TIMELINE.md`).  
3. Camada opcional de linguagem natural.  
4. Integração com escrita de eventos só após API de tracking endurecida.

**Prioridade global:** *Alta* — forte sinergia com domínio já modelado.

---

## Impact Agent

### 1. Responsabilidade

Traduzir indicadores de **impacto socioambiental** e valor público (ex.: `co2Saving`, corredor, família de produto) em linguagem acessível para o perfil do usuário; **não** produzir auditoria oficial ou relatório regulatório.

### 2. Dados que pode acessar

- Campos públicos/autorizados de **`Cargo`** e agregações já usadas em **`GovernmentDashboard`** / páginas de impacto (indicadores mock).
- Não utilizar dados pessoais nem volumes estratégicos não autorizados ao papel.

### 3. Ações permitidas

- Resumo textual + bullets com referência aos **números de origem** (citados literalmente do DTO).
- Fallback: templates por corredor / `productFamily` sem modelo.

### 4. Ações proibidas

- Inventar percentuais ou impacto não presentes nos dados estruturados.
- Afirmar certificações ou cumprimento de leis específicas sem campo-fonte.
- Expor benchmark competitivo identificável sem política de dados agregados.

### 5. Necessidade de aprovação humana

Publicação institucional de novo indicador ou alteração de narrativa oficial **fora** do escopo do agente; uso interno é leitura.

### 6. Logs necessários

`agent=impact`, IDs agregados ou cargas autorizadas, versão dos indicadores fonte.

### 7. Riscos

Greenwashing inadvertido; uso político de texto gerado sem revisão.

### 8. Testes possíveis

- Verificação: todo número citado na saída aparece no input (extração ou regex controlada).
- Fallback snapshot por `productFamily`.

### 9. Ordem de implementação

1. Modo estritamente **extractivo** (só reorganiza dados existentes).  
2. Templates i18n.  
3. Parafrase opcional via modelo com validação numérica.  
4. Revisão com stakeholders institucionais antes de texto voltado ao público externo.

**Prioridade global:** *Média* — valor de UX alto; risco reputacional médio.

---

## Support Agent

### 1. Responsabilidade

Responder dúvidas **operacionais e de produto** dentro do HydroRivers (navegação, significado de campos, próximos passos não vinculantes), usando **base de conhecimento curada** + dados estruturados do objeto sob foco quando aplicável.

### 2. Dados que pode acessar

- Documentação interna versionada (FAQ, HELP.md futuro), glossário de domínio (`CargoStatus`, `DealStage`).
- **DTO resumido** da entidade atualmente visualizada na sessão (ex.: só IDs e labels já visíveis na tela).
- **Não** acessar todo o marketplace nem outros usuários.

### 3. Ações permitidas

- Respostas curtas; links para telas existentes; sugestão de fluxo “vá para Negociações”.
- Escalação explícita: “entre em contato com suporte humano” para casos não cobertos.

### 4. Ações proibidas

- Executar operações em nome do usuário.
- Revelar dados de terceiros ou conteúdo de APIs não autorizadas.
- Dar instruções que burlem segurança ou políticas (ex.: mock-mode para não-admin).

### 5. Necessidade de aprovação humana

Qualquer ação de conta, pagamento ou dados sensíveis permanece fora do agente ou exige humano.

### 6. Logs necessários

`agent=support`, tópico intent (enum), satisfação opcional, truncamento da query do usuário com política de PII.

### 7. Riscos

Jailbreak / prompt injection via texto livre do usuário; respostas desatualizadas face ao produto.

### 8. Testes possíveis

- Lista de FAQs com resposta esperada (golden).
- Testes de injeção: entrada maliciosa não deve gerar instruções proibidas (classificadores ou allowlist de intents).
- Regressão i18n nas respostas template.

### 9. Ordem de implementação

1. FAQ determinístico + busca lexical (sem LLM).  
2. Intents fechados com slots (qual tela, qual status).  
3. LLM opcional **somente** sobre texto pré-aprovado + RAG interno.  
4. Canal humano e métricas de escalação.

**Prioridade global:** *Baixa inicialmente* — útil para adoção, mas superfície de abuso maior; implementar depois de hardening de auth/API.

---

## Ordem sugerida entre agentes (visão macro)

Implementação incremental segura no produto:

| Ordem | Agente | Motivo |
|-------|--------|--------|
| 1 | **Negotiation Agent** | Só leitura; dados já estruturados; alto valor na UI atual. |
| 2 | **Tracking Agent** | Checklist/explicação alinhados ao roadmap de timeline; fallback claro. |
| 3 | **Risk Agent** | Usa campos já presentes (`operationalRisks`, `riskLevel`); exige disclaimers fortes. |
| 4 | **Impact Agent** | Começar extractivo/templates antes de parafrasear com modelo. |
| 5 | **Document Agent** | Depende de módulo de documentos e governança regulatória. |
| 6 | **Support Agent** | Depende de base de conhecimento madura e controles anti-abuso. |

Pré-requisito transversal (todas as ordens): políticas em `docs/AI-ROADMAP.md`, endurecimento progressivo de APIs (`docs/API-SECURITY-AUDIT.md`) e política **“sem IA antes de segurança, validação e testes”** em `AGENTS.md`.

---

## Referências

- `docs/AI-ROADMAP.md` — princípios e arquitetura da camada assistiva  
- `docs/DOCUMENTS-MODULE.md` — Document Agent  
- `docs/TRACKING-TIMELINE.md` — Tracking Agent  
- `docs/API-SECURITY-AUDIT.md` — escopo e exposição de dados  
- `AGENTS.md` — política de desenvolvimento (inclui restrição sobre IA prematura)  
