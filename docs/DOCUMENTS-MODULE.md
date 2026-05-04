# Módulo de documentos — HydroRivers

**Tipo:** documentação apenas — **sem** implementação de upload, **sem** alteração de código de produção e **sem** novas dependências neste documento.

Documentos podem estar associados a **cargas**, **embarcações**, **negociações** e **eventos de rastreio**. Exemplos de uso: **nota fiscal**, **licença**, **comprovante**, **checklist de embarque**, **evidência de entrega**, **documentação obrigatória por tipo de carga**.

Alinhamento conceitual: `docs/DATABASE-PLANNING.md` (tabela `documents` futura), `Cargo.requiredDocuments` no domínio atual (mock), `TrackingEvent.evidenceDocumentId` planejado na timeline operacional.

---

## 1. Objetivo do módulo

Centralizar o **ciclo de vida** de arquivos e registros documentais no HydroRivers:

- satisfazer **compliance** operacional e regulatório (hidrovia, fiscal, sanitário, ambiental);
- vincular provas ao **fluxo transacional** (carga → negociação → embarque → rastreio → entrega);
- aplicar **autorização por papel** e por vínculo com entidades de negócio;
- preparar **storage privado** com metadados no banco (nunca arquivo binário grande persistido só no DB em produção);
- servir de base para checklist «documentação obrigatória por tipo de carga» sem misturar **“lista sugerida”** (campo estruturado na carga) com **artefato armazenado** (linha `Document`).

---

## 2. Entidade `Document` proposta

Abstração única **`Document`** representando um **requerimento**, um **upload** ou ambos conforme `status`.

Modelo conceitual (TypeScript ilustrativo — não é código de produção):

```ts
type DocumentEntityType = 'cargo' | 'vessel' | 'negotiation' | 'tracking_event';

type DocumentStatus =
  | 'required'       // obrigatório ainda não enviado (slot ou exigência)
  | 'pending'       // aguardando upload ou reenvio
  | 'uploaded'      // arquivo recebido, não revisado
  | 'under_review'  // fila compliance/admin
  | 'approved'
  | 'rejected'
  | 'expired';

type DocumentVisibility = 'private' | 'participants' | 'admin';

type Document = {
  id: string;
  entityType: DocumentEntityType;
  entityId: string;
  name: string;
  documentType: string; // código estável, ex.: 'nfe', 'boarding_checklist'
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

- **`storageKey`**: referência opaca ao objeto no bucket; **não** URL pública permanente.
- **`entityType` + `entityId`**: associação polimórfica ao domínio (validação de FK ou política por serviço).
- Separação entre **metadado** (DB) e **bytes** (storage).

---

## 3. Campos principais

| Campo | Função |
|-------|--------|
| `id` | Identificador único (UUID recomendado em produção). |
| `entityType`, `entityId` | Associação à carga, embarcação, negociação ou evento de rastreio. |
| `documentType` | Taxonomia estável (NF-e, licença, POD…); permite regras e UI por tipo. |
| `name` | Rótulo exibível / nome amigável (i18n pode usar chave derivada do tipo). |
| `status` | Onde está no ciclo obrigação → upload → revisão → aprovação. |
| `visibility` | Quem pode ver metadados/listagem (participantes da negociação, só admin, etc.). |
| `storageKey`, `fileName`, `mimeType`, `sizeBytes`, `checksum` | Integridade e auditoria do arquivo **após** upload real. |
| `uploadedBy`, `reviewedBy` | Rastreabilidade humana (IDs de usuário). |
| `rejectionReason` | Texto curto ou código máquina para rejeição. |
| `expiresAt` | Licenças e documentos temporários. |
| `metadata` | Extensível (versão do template, idioma, correlação com NF-e número, etc.). |
| `createdAt`, `updatedAt` | Auditoria temporal. |

**Nota:** em MVP só mock, pode existir registro sem `storageKey` (`required` | `pending`). Em produção, estados com arquivo devem sempre ter `checksum` e política de retenção.

---

## 4. Tipos de documento

Taxonomia por **`documentType`** (códigos estáveis); exemplos alinhados ao contexto brasileiro hidroviário e aos exemplos do produto:

### Por carga / obrigatoriedade operacional

| Código sugerido | Descrição |
|-----------------|-----------|
| `nfe` | Nota fiscal eletrônica |
| `cte` | CT-e / documentação de transporte |
| `romaneio` | Romaneio / lista de volumes |
| `dof` | DOF / documentação florestal quando aplicável |
| `sanitary_certificate` | Laudo ou documentação sanitária |
| `temperature_log` | Registro / evidência de cadeia fria |
| `origin_declaration` | Declaração de origem / rastreabilidade |
| `cargo_type_requirement` | Pacote «documentação obrigatória por tipo de carga» (metadados ligados a `productFamily` / regulatório) |

### Licenças e conformidade embarcação

| Código | Descrição |
|--------|-----------|
| `antaq_registration` | Registro / conformidade ANTAQ (conceito) |
| `vessel_license` | Licença / habilitação da embarcação |
| `insurance_certificate` | Apólice / seguro |
| `inspection_report` | Inspeção / checklist de segurança |
| `crew_qualification` | Documentação de tripulação (**«a confirmar»** escopo LGPD) |

### Negociação / contrato

| Código | Descrição |
|--------|-----------|
| `commercial_proposal` | Proposta comercial |
| `contract_or_terms` | Minuta ou termos aceitos |
| `boarding_authorization` | Autorização / instrução de embarque |

### Rastreio / evidências

| Código | Descrição |
|--------|-----------|
| `boarding_checklist` | Checklist de embarque assinado/digitalizado |
| `seal_photo` | Evidência de lacre |
| `delivery_proof` | Comprovante / POD / evidência de entrega |
| `signature_capture` | Aceite em campo (**«a confirmar»** validade jurídica) |
| `delay_or_incident_note` | Registro de incidente ou atraso com anexo |

Novos tipos devem passar por **catálogo versionado** (tabela ou config) para evitar strings livres apenas no cliente.

---

## 5. Relacionamento com Cargo / Vessel / Negotiation / TrackingEvent

| Entidade | Papel dos documentos |
|----------|----------------------|
| **Cargo** | Pacote fiscal e regulatório da mercadoria; exigências por **tipo de carga** / corredor; ligação com `requiredDocuments` mock atual como **lista de slots** que pode gerar ou referenciar linhas `Document`. |
| **Vessel** | Licenças, seguros, inspeções da **frota**; visível ao transportador dono e a participantes quando relevante à negociação. |
| **Negotiation** | Proposta, termos comerciais, anexos da negociação; visibilidade **participants**. |
| **TrackingEvent** | Evidências pontuais (foto lacre, POD); campo futuro **`evidenceDocumentId`** na timeline pode apontar para `Document.id`. |

Cardinalidade típica:

- 1 **Cargo** → N **Documents**
- 1 **Vessel** → N **Documents**
- 1 **Negotiation** → N **Documents**
- 1 **TrackingEvent** → 0..1 **Document** evidência principal (+ opcionalmente N para anexos via metadados)

Integridade: sempre validar no servidor que o usuário tem **linha de autorização** até `entityId` (owner, participant, admin).

---

## 6. Permissões por role

### Shipper (embarcador)

- Criar/uploadar documentos ligados às **próprias cargas** e às **negociações onde é `shipperId`** (tipos permitidos por política).
- Ler documentos desses escopos conforme `visibility`.
- **Não** aprovar nem rejeitar em nome do sistema (**«compliance»** é admin/ops).

### Carrier (transportador)

- Gerir documentos das **próprias embarcações** (`owner_id`).
- Anexar evidências e documentos da **negociação onde é `carrierId`**.
- **Não** alterar documentos de carga cuja propriedade não seja sua nem sem negociação associada autorizada.

### Admin

- Ler/revisar globalmente conforme política institucional.
- Transições **`approved` / `rejected`** e filas **`under_review`**.
- **Não** substituir upload de terceiros sem **auditoria** (log + identidade).

### Futuro: operações / compliance / governo

- Mesmo núcleo que admin para revisão, com escopo institucional (**«a confirmar»** role técnico separado).

Regra transversal: **nunca** confiar em `entityId` enviado pelo cliente sem checar vínculo com a sessão (`docs/API-SECURITY-AUDIT.md`, decisões em `docs/SECURITY-PRODUCT-DECISIONS.md`).

---

## 7. Fluxo de upload (planejado)

**Esta secção descreve comportamento futuro — não implementado.**

1. Usuário autenticado abre contexto (ex.: detalhe da carga) e escolhe **tipo de documento** permitido.
2. Cliente solicita **intenção de upload** ao backend (`POST` pré-validação ou pedido de URL assinada).
3. Servidor valida: sessão, papel, vínculo com entidade, tipo MIME permitido, tamanho máximo, quota opcional.
4. Upload do arquivo para **storage privado** (fluxo direto para bucket ou via servidor — decisão de implementação futura).
5. Servidor persiste **`Document`** com `status = uploaded` ou `under_review`, `uploadedBy`, `storageKey`, hash/tamanho.
6. UI atualiza lista e checklist; participantes recebem estado coerente.

Variantes MVP mock (sem bytes reais): registrar **`Document`** com `pending` → simulação `uploaded` para QA.

---

## 8. Fluxo de revisão / aprovação

1. Documento em **`uploaded`** ou **`under_review`** entra na fila de revisão (admin/compliance).
2. Revisor consulta **metadados** e obtém **URL assinada** de curta duração para visualização (ou pré-visualização segura server-side).
3. Transições:
   - **`approved`**: registra `reviewedBy`, timestamp; opcionalmente notifica participantes.
   - **`rejected`**: `rejectionReason` obrigatório (código + texto curto); volta para **`pending`** ou novo ciclo de upload conforme regra de produto.
   - **`expired`**: job ou rotina marca licenças vencidas (`expiresAt`).
4. Toda transição gera **entrada de auditoria** (append-only ou log estruturado).

Negócio **«documentação obrigatória por tipo de carga»`**: checklist só fecha quando todos os slots **`required`** tenham pelo menos um `Document` **`approved`** (**«a confirmar»** se permite exceções reguladas).

---

## 9. Storage recomendado

| Opção | Quando faz sentido |
|-------|-------------------|
| **Objeto privado S3-compatível** | Produção flexível (lifecycle, versionamento, políticas IAM). |
| **Supabase Storage** | Se Postgres/Supabase for escolha única de stack. |

Boas práticas:

- Bucket **privado**; downloads apenas por **URL assinada** ou proxy autenticado.
- **Não** usar nome original do arquivo como chave única; prefixar por `tenant/org` quando multi-inquilino existir.
- Políticas de **retenção** e exclusão (LGPD / dados operacionais).
- Pipeline futuro: **antivírus** / content inspection antes de marcar `approved`.

Evitar: URL pública fixa; binários grandes só em JSON no banco.

---

## 10. Riscos de segurança

| Risco | Impacto | Mitigação resumida |
|-------|---------|---------------------|
| Upload malicioso (malware, polyglot) | Alto | Allowlist MIME, limite de tamanho, scan futuro, não executar conteúdo. |
| Path traversal / chaves previsíveis | Alto | `storageKey` só servidor; nomes aleatórios. |
| IDOR (`entityId` de terceiros) | Alto | Validação estrita de ownership/participação em cada operação. |
| Vazamento por URL longa ou cache | Alto | TTL curto; headers adequados; sem CDN público para bucket sensível. |
| LGPD em documentos pessoais | Alto | Minimização; consentimento onde aplicável; retificação/exclusão. |
| Admin excessivo sem auditoria | Médio | Logs `reviewedBy`, motivos de rejeição, não sobrescrever silenciosamente. |
| Baixa conectividade | Médio | Fila offline **«futuro»**; status `pending` explícito na UX. |

---

## 11. Testes necessários

### Unitários (domínio)

- Validação de transição de `status` (máquina de estados).
- Mapa «tipo de documento ↔ entidade permitida».
- Montagem de `storageKey` e normalização de metadados.

### Integração (API futura)

- `401` sem sessão; `403` sem vínculo com entidade.
- `400` payload inválido; `413` / `415` quando aplicável.
- Shipper em **própria** carga: criar/listar permitido conforme tipo.
- Carrier em **própria** embarcação e negociação participante.
- Participante de negociação lê documentos `visibility=participants`.
- Não participante não obtém lista nem URL assinada.
- Admin: revisão **approved/rejected** com auditoria mínima persistida ou logada.

### E2E (depois do backend estável)

- Fluxo feliz upload + aparece na lista (ambiente de teste com storage fake ou sandbox).
- Tentativa de acesso a documento de terceiros falha na UI/API.

---

## 12. Impacto na UI

Áreas prováveis:

- Detalhe de **carga**: checklist obrigatória + lista de anexos + estado por tipo.
- **Nova carga**: sugestão de documentos (pode coexistir com IA assistiva futura — **fora deste escopo**).
- Detalhe de **embarcação**: licenças e validades.
- Detalhe de **negociação**: pacote contratual e pendências.
- **Timeline de rastreio**: link para evidências (`delivery_proof`, fotos).
- **Admin/compliance**: fila de revisão.

Componentes candidatos:

- `RequiredDocumentsChecklist`, `DocumentList`, `DocumentStatusBadge`, `DocumentUploadTrigger` (futuro), `DocumentReviewDrawer`.

Requisitos:

- **next-intl** (`pt-BR`, `en`, `es`) para todos os textos visíveis.
- Não expor link permanente na interface; usar «baixar» que passa pela sessão.

---

## 13. Roadmap incremental

| Fase | Entrega |
|------|---------|
| **D1** | Congelar tipos `Document`, `documentType`, máquina de `status` na documentação + contratos TS compartilhados (**«sem upload»**). |
| **D2** | Repository mock: listagem por `entityType`/`entityId`; seeds em `.mock-data` opcionais. |
| **D3** | APIs somente leitura + autorização por escopo (alinhar com endurecimento `GET` — `docs/API-SECURITY-AUDIT.md`). |
| **D4** | UI somente leitura / checklist derivada de `requiredDocuments` + documentos mock. |
| **D5** | Upload real + storage privado + URLs assinadas. |
| **D6** | Fluxo revisão admin/compliance + auditoria. |
| **D7** | Integração com **`evidenceDocumentId`** em `TrackingEvent` e relatórios. |
| **D8** | Retenção, scan de malware, políticas institucionais. |

---

## Referências internas

- `docs/DATABASE-PLANNING.md` — tabela `documents` proposta  
- `docs/API-SECURITY-AUDIT.md` — exposição de dados e futuras rotas autenticadas  
- `docs/SECURITY-PRODUCT-DECISIONS.md` — ownership e papéis  
- `docs/TRACKING-TIMELINE.md` — vínculo evidência ↔ documento  

---

*Documento vivo: revisar após primeira implementação de API de documentos.*
