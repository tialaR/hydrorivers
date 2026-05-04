# Módulo de documentos — HydroRivers

**Tipo:** documentação apenas — **sem** implementação de upload, **sem** alteração de código de produção, **sem** alteração de testes e **sem** novas dependências neste arquivo.

**Público:** desenvolvedores novos — leiam também `docs/DEVELOPER-AI-ONBOARDING.md` (fluxo do projeto) e `docs/API-SECURITY-AUDIT.md` (exposição atual das APIs).

**Estado no código hoje:** o produto possui campos como `Cargo.requiredDocuments`, listas textuais em negociações e referências futuras (`TrackingEvent.evidenceDocumentId` na timeline — ver `docs/TRACKING-TIMELINE.md`). **Um módulo completo de documentos com upload, storage e revisão não está implementado** — o texto abaixo é **especificação e roadmap**.

Legendas rápidas neste documento:

| Marco | Significado |
|-------|-------------|
| **✓ Hoje (mock/UI parcial)** | Já existe algo equivalente simplificado ou apenas como dados estruturados em mock |
| **◇ Roadmap** | Planejado; sem comportamento final no produto |

---

## 1. Objetivo do módulo

Centralizar o **ciclo de vida** de arquivos e registros documentais no HydroRivers:

- satisfazer **compliance** operacional e regulatório (fiscal, sanitário, ambiental, hidroviário);
- **vincular provas** ao fluxo **carga → negociação → embarque → rastreio → entrega**;
- aplicar **autorização por papel** e por vínculo com entidades de negócio (`Cargo`, `Vessel`, `Negotiation`, `TrackingEvent`);
- separar **metadados no banco** de **bytes em storage privado** em produção (alinhado a `docs/DATABASE-PLANNING.md`);
- diferenciar **lista de exigências** (ex.: `requiredDocuments` na carga — ✓ parcialmente no mock) de **artefato armazenado** (entidade **`Document`** — ◇ roadmap).

---

## 2. Problema que resolve

| Problema | Por que dói sem um módulo |
|----------|---------------------------|
| **Provas dispersas** | NF-e, licenças e PODs ficam fora da plataforma → auditoria frágil e retrabalho. |
| **Compliance contextual** | O mesmo tipo de arquivo pode ser obrigatório ou não conforme **tipo de carga**, **corredor** ou **estágio do deal** — precisa de modelo explícito. |
| **Quem pode ver o quê** | Shipper, carrier e admin têm interesses diferentes; sem permissões granulares há **vazamento ou bloqueio excessivo**. |
| **Baixa conectividade** | Operação ribeirinha pode precisar de filas e estados **`pending`** claros na UX (**◇ roadmap** de offline/sync). |
| **Timeline auditável** | Eventos de rastreio devem poder apontar para **evidência persistente** (`evidenceDocumentId` — ◇). |

Referência de decisões de papel e ownership: `docs/SECURITY-PRODUCT-DECISIONS.md`. Referência de endurecimento de APIs: `docs/API-SECURITY-AUDIT.md`.

---

## 3. Entidade `Document` proposta (**◇ roadmap**)

Abstração única **`Document`**: pode representar um **slot obrigatório**, um **pedido de upload** ou um **arquivo recebido**, conforme `status` (ver §10).

Modelo conceitual ilustrativo em TypeScript (**não** é arquivo de produção):

```ts
type DocumentEntityType = 'cargo' | 'vessel' | 'negotiation' | 'tracking_event';

type DocumentVisibility = 'private' | 'participants' | 'admin_only';

/** Estados — ver §10 */
type DocumentStatus =
  | 'required'
  | 'pending'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

type Document = {
  id: string;
  entityType: DocumentEntityType;
  entityId: string;
  name: string;
  documentType: string; // código estável, ex.: 'nfe', 'delivery_proof'
  status: DocumentStatus;
  visibility: DocumentVisibility;
  storageKey?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  checksum?: string;
  uploadedBy?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
```

Princípios:

- **`storageKey`**: referência **opaca** ao objeto no bucket — **◇** só existe após upload real.
- **`entityType` + `entityId`**: vínculo polimórfico; validação no **servidor** com checagem de FK/participação.

Persistência SQL sugerida: `docs/DATABASE-PLANNING.md` (tabela **`documents`** futura).

---

## 4. Campos sugeridos (**◇ modelo alvo**)

| Campo | Função |
|-------|--------|
| `id` | UUID (recomendado em produção). |
| `entity_type`, `entity_id` | Associação à carga, embarcação, negociação ou evento de rastreio. |
| `document_type` | Taxonomia estável (§5); evita apenas texto livre no cliente. |
| `name` | Rótulo exibível; i18n pode derivar chave do tipo. |
| `status` | Ciclo obrigação → envio → revisão → aprovação (§10). |
| `visibility` | Escopo de listagem/leitura de metadados. |
| `storage_key`, `file_name`, `mime_type`, `size_bytes`, `checksum` | Integridade do arquivo **após** upload (**◇**). |
| `uploaded_by`, `reviewed_by` | IDs de usuário para auditoria. |
| `rejection_reason` | Texto ou código estruturado em rejeições. |
| `expires_at` | Licenças e documentos temporários. |
| `metadata` | Extensível (número NF-e, idioma, template, etc.). |
| `created_at`, `updated_at` | Auditoria temporal (`timestamptz` no SQL). |

---

## 5. Tipos de documento (**◇ catálogo**)

Taxonomia por código **`document_type`** (versionar em catálogo futuro — tabela ou config).

### Carga / obrigatoriedade operacional

| Código sugerido | Descrição |
|-----------------|-----------|
| `nfe` | Nota fiscal eletrônica |
| `cte` | CT-e / documentação de transporte |
| `romaneio` | Lista de volumes |
| `dof` | Documentação florestal quando aplicável |
| `sanitary_certificate` | Laudo ou documentação sanitária |
| `temperature_log` | Evidência de cadeia fria |
| `cargo_type_requirement` | Pacote ligado a tipo de carga / `productFamily` |

### Embarcação / conformidade

| Código | Descrição |
|--------|-----------|
| `vessel_license` | Licença da embarcação |
| `insurance_certificate` | Seguro |
| `inspection_report` | Inspeção / segurança |
| `crew_qualification` | Tripulação (**◇** LGPD / minimização) |

### Negociação / contrato

| Código | Descrição |
|--------|-----------|
| `commercial_proposal` | Proposta comercial |
| `contract_or_terms` | Termos ou minuta |
| `boarding_authorization` | Autorização de embarque |

### Rastreio / evidências

| Código | Descrição |
|--------|-----------|
| `boarding_checklist` | Checklist de embarque |
| `seal_photo` | Evidência de lacre |
| `delivery_proof` | POD / comprovante de entrega |
| `delay_or_incident_note` | Incidente ou atraso com anexo |

Novos tipos devem entrar por **mudança de catálogo versionada**, não só string solta na UI.

---

## 6. Relacionamentos com `Cargo`, `Vessel`, `Negotiation` e `TrackingEvent`

| Entidade | Papel dos documentos |
|----------|----------------------|
| **Cargo** | Pacote fiscal/regulatório da mercadoria; exigências por tipo/corredor; **`requiredDocuments`** (✓ mock) pode **evoluir** para slots que referenciam ou geram linhas `Document` (**◇**). |
| **Vessel** | Licenças, seguros, inspeções da frota (`owner_id` do transportador). |
| **Negotiation** | Proposta, termos e anexos do deal; visibilidade típica **participantes**. |
| **TrackingEvent** | Evidências pontuais; campo futuro **`evidence_document_id`** → `documents.id` (**◇**, ver `TRACKING-TIMELINE.md`). |

Cardinalidade típica (**◇ modelo alvo**):

- 1 **Cargo** → N **Documents**
- 1 **Vessel** → N **Documents**
- 1 **Negotiation** → N **Documents**
- 1 **TrackingEvent** → 0..1 documento principal + opcionalmente N via metadados

Regra transversal: validar no servidor que o usuário tem **autorização** até `entity_id` (owner, participant, admin).

Implementação técnica futura deve passar por **`getRepositories()`** quando existir `DocumentsRepository` (**◇** — `docs/REPOSITORY-BOUNDARY.md`), para não acoplar handlers ao storage/SQL cru.

---

## 7. Permissões por role: admin, shipper, carrier (**◇ alvo produção**)

Alinhado à auditoria e decisões de produto — **nem todo comportamento está aplicado nas APIs atuais**.

### Shipper

- **◇** Criar/registrar documentos ligados às **próprias cargas** (`owner_id`).
- **◇** Enviar/evidenciar nas **negociações onde é `shipper_id`** — tipos permitidos por política.
- **◇** Ler conforme `visibility`.
- Normalmente **não** aprova documentos regulatórios de terceiros (função admin/compliance).

### Carrier

- **◇** Gerir documentos das **próprias embarcações**.
- **◇** Anexar nas negociações onde é **`carrier_id`** (e **`approved`** quando política exigir — `SECURITY-PRODUCT-DECISIONS.md`).
- **◇** Não alterar pacotes documentais de cargas de terceiros sem vínculo autorizado.

### Admin

- **◇** Filas de revisão (`under_review`), transições **approved/rejected**.
- **◇** Leitura institucional conforme política — sempre com **auditoria** (`reviewed_by`, motivo).
- Decisão documentada: admin **não** deve substituir fluxo operacional de criação de negócio por hacks sem trilha (`SECURITY-PRODUCT-DECISIONS.md`).

### Mock-mode (**✓ hoje**, ferramenta separada)

Reset de cenários **não** substitui permissões do módulo de documentos — em produção real, **◇** desabilitar ou isolar mock-mode por ambiente (`docs/DEVELOPER-AI-ONBOARDING.md`).

---

## 8. Fluxo de upload (**◇ não implementado**)

Descrição **alvo** — **não** existe pipeline de upload real no estado atual do repositório.

1. Usuário autenticado abre contexto (detalhe de carga, negociação, etc.).
2. Cliente solicita **permissão de upload** ou **URL assinada** (**◇ API futura**).
3. Servidor valida: sessão, papel, vínculo com entidade, tipo MIME permitido, tamanho máximo.
4. **◇** Envio dos bytes ao storage privado (direto ao bucket ou via backend — decisão futura).
5. **◇** Persistir `Document` com `uploaded_by`, `storage_key`, hash/tamanho; `status` adequado.
6. UI atualiza checklist/lista (**◇**).

Variante apenas mock (**◇**): registros sem bytes para QA, estados simulados — não equivale a produção.

---

## 9. Fluxo de revisão / aprovação (**◇ não implementado**)

1. Documento em **`uploaded`** ou **`under_review`** entra na fila do revisor (admin/compliance **◇**).
2. Revisor obtém **visualização segura** (URL assinada de TTL curto ou streaming server-side **◇**).
3. Transições:
   - **`approved`** → registra `reviewed_by`, timestamp.
   - **`rejected`** → `rejection_reason` obrigatório; novo ciclo de upload conforme regra.
   - **`expired`** → jobs avaliam `expires_at`.
4. **◇** Auditoria append-only ou log estruturado por transição.

Checklist «documentação obrigatória por tipo de carga»: **◇** fechar apenas quando políticas de produto e slots **`required`** estiverem satisfeitos (**«a confirmar»** exceções reguladas).

---

## 10. Status possíveis do documento (**◇ máquina de estados alvo**)

| Status | Significado |
|--------|-------------|
| `required` | Exigência declarada; slot pode existir antes de qualquer arquivo (**◇**). |
| `pending` | Aguardando envio ou reenvio. |
| `uploaded` | Arquivo recebido; não revisado (**◇** depende de upload). |
| `under_review` | Fila de compliance/admin. |
| `approved` | Aceito para fins operacionais/regulatórios (**◇** sempre com critério de produto). |
| `rejected` | Recusado com motivo. |
| `expired` | Validade ultrapassada (`expires_at`). |

Transições exatas devem ser formalizadas num ADR ou diagrama antes de enforcement estrito no código.

---

## 11. Storage recomendado para produção (**◇**)

| Opção | Quando faz sentido |
|-------|-------------------|
| **Bucket privado S3-compatível** | Produção flexível (lifecycle, versionamento, IAM). |
| **Supabase Storage / equivalente** | Se a stack Postgres escolher o mesmo ecossistema. |

Boas práticas **◇**:

- Bucket **privado**; download só via **URL assinada** ou proxy autenticado.
- Chaves não previsíveis; prefixo por organização/ambiente quando multi-tenant existir.
- **Retenção** e exclusão alinhadas a LGPD.
- **◇** Pipeline futuro: antivírus / inspeção de conteúdo antes de `approved`.

Evitar: URL pública permanente; armazenar binários grandes apenas em JSON no banco.

---

## 12. Riscos de segurança (**◇ foco em upload/leitura futuros**)

| Risco | Impacto | Mitigação resumida |
|-------|---------|---------------------|
| **Malware / polyglot** | Alto | Allowlist MIME, limite de tamanho, scan **◇**, nunca executar arquivo como código. |
| **Path traversal / chaves fracas** | Alto | Apenas servidor gera `storage_key`. |
| **IDOR** (`entity_id` alheio) | Alto | Validar ownership/participação sempre (`API-SECURITY-AUDIT.md`). |
| **Vazamento por URL/cache** | Alto | TTL curto em URLs assinadas; headers adequados. |
| **LGPD em dados pessoais** em documentos | Alto | Minimização; bases legais; direitos do titular. |
| **Admin sem auditoria** | Médio | Registrar `reviewed_by`, motivos; não sobrescrever silenciosamente. |

---

## 13. Validações necessárias (**◇ servidor**)

- Autenticação para qualquer escrita/leitura sensível (**◇** alinhado ao endurecimento de GETs documentado).
- **`entity_type` + `entity_id`** válidos e autorizados para a sessão.
- **`document_type`** pertencente ao catálogo permitido para aquele contexto (carga vs vessel vs negotiation vs tracking).
- Limites: **tamanho máximo**, **MIME permitido**, **quantidade** por entidade (**◇ quotas**).
- **Checksum** e **size_bytes** obrigatórios quando `status` indicar arquivo persistido (**◇**).
- **◇** Rate limiting em endpoints de upload/intenção de upload.

---

## 14. Testes recomendados (**◇ quando API existir**)

| Camada | O quê cobrir |
|--------|----------------|
| **Unitário** | Máquina de `status`; mapa tipo ↔ entidade permitida; sanitização de metadados. |
| **Integração** | `401`/`403`/`404`; shipper só na própria carga; carrier só na própria frota/participação; admin revisão com auditoria mínima; **◇** rejeição sem motivo falha validação. |
| **E2E** | Fluxo feliz **◇** com storage fake/sandbox; tentativa de abrir documento de terceiros falha. |

Enquanto não houver rotas dedicadas, os testes acima são **especificação** — não obrigação da suite atual.

---

## 15. Impacto futuro na UI (**◇**)

Áreas prováveis:

- Detalhe de **carga**: checklist + anexos + estado por tipo.
- **Nova carga**: sugestões alinhadas a `requiredDocuments` (✓ mock pode **guiar** cópias — ◇ UI rica).
- Detalhe de **embarcação**: licenças e validades.
- Detalhe de **negociação**: pacote contratual e pendências.
- **Timeline de rastreio**: link para evidências quando `evidence_document_id` existir.

Requisitos:

- **next-intl** (`pt-BR`, `en`, `es`) — sem strings fixas (`AGENTS.md`).
- Botões «Baixar» que sempre passem pela **sessão** — sem link público eterno na UI.

---

## 16. Impacto futuro na API (**◇**)

Rotas ilustrativas (nomes **não** fixados até RFC interno):

- **◇** `GET /api/documentos?entityType=&entityId=` — lista escopada (substituir GET genéricos sensíveis — `API-SECURITY-AUDIT.md`).
- **◇** `POST /api/documentos` ou fluxo em duas etapas (intenção + confirmação).
- **◇** `PATCH /api/documentos/:id` — revisão (`approved`/`rejected`) restrita a papel revisora.

Contratos devem seguir erros padronizados (`400`, `401`, `403`, `413`, `415`, …) como no restante do projeto.

Implementação interna via **`DocumentsRepository`** (**◇**) atrás de `getRepositories()` (`REPOSITORY-BOUNDARY.md`).

---

## 17. Roadmap incremental

| Fase | Entrega |
|------|---------|
| **D1** | Congelar neste doc os tipos, status e permissões; revisão jurídica/DPO **◇** quando houver dados reais. |
| **D2** | Contratos TS compartilhados + **◇** repository mock somente leitura (`listByEntity`). |
| **D3** | **◇** APIs somente leitura com autorização por escopo. |
| **D4** | **◇** UI somente leitura / checklist derivada de `requiredDocuments` + seeds. |
| **D5** | **◇** Upload real + storage privado + URLs assinadas. |
| **D6** | **◇** Revisão admin/compliance + auditoria persistente. |
| **D7** | **◇** Ligação `TrackingEvent.evidence_document_id` e relatórios. |
| **D8** | **◇** Retenção, antivírus, políticas institucionais. |

**IA assistiva** para sugestão de pacotes documentais (**◇**) está em `docs/AI-ROADMAP.md` — **depois** de segurança, validação e testes do módulo base.

---

## 18. Critérios de pronto

**Para considerar o «módulo de documentos v1» entregue em um ambiente:**

1. **◇** Catálogo de `document_type` e máquina de `status` implementados e testados.
2. **◇** Upload com storage privado + metadados no banco + checksum.
3. **◇** Autorização coberta por testes de integração (sem IDOR).
4. **◇** Fluxo de revisão com auditoria mínima (`reviewed_by`, timestamps).
5. **◇** UI i18n para todas as superfícies tocadas.
6. **◇** Runbook de retenção/exclusão alinhado a LGPD.

**Critério atual do repositório:** este arquivo **documenta** o módulo; **upload e APIs dedicadas não fazem parte do critério de pronto da codebase até implementação explícita**.

---

## Referências internas

| Documento | Uso |
|-----------|-----|
| `docs/DATABASE-PLANNING.md` | Tabela `documents` proposta |
| `docs/REPOSITORY-BOUNDARY.md` | Evolução para `DocumentsRepository` |
| `docs/API-SECURITY-AUDIT.md` | Sessão e exposição de dados |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Papéis, ownership, mock-mode |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Contexto para novos devs |
| `docs/TRACKING-TIMELINE.md` | Evidências e `evidenceDocumentId` |
| `docs/AI-ROADMAP.md` | IA assistiva — roadmap |

---

*Documento vivo: atualizar após a primeira rodada de APIs e após revisão jurídica quando dados reais forem processados.*
