# Módulo de Documentos — HydroRivers

## Objetivo

Modelar o futuro módulo de documentos do HydroRivers sem implementar upload nesta fase.

Documentos podem estar associados a:

- cargas
- embarcações
- negociações
- eventos de rastreio

## 1. Entidade `Document`

Modelo recomendado:

```ts
type DocumentEntityType = 'cargo' | 'vessel' | 'negotiation' | 'tracking_event';

type DocumentStatus =
  | 'required'
  | 'pending'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

type DocumentVisibility = 'private' | 'participants' | 'admin';

type Document = {
  id: string;
  entityType: DocumentEntityType;
  entityId: string;
  name: string;
  documentType: string;
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

- `storageKey` nunca deve ser URL pública permanente.
- `entityType + entityId` conecta o documento ao domínio.
- Dados sensíveis ficam no storage; banco guarda metadados e permissões.
- `status` representa ciclo de validação, não apenas existência do arquivo.

## 2. Tipos de Documento

Tipos iniciais sugeridos:

### Cargas

- `nfe` — Nota Fiscal Eletrônica
- `cte` — Conhecimento de Transporte Eletrônico
- `romaneio` — Lista de volumes/lotes
- `origin_declaration` — Declaração de origem
- `sanitary_certificate` — Laudo/documento sanitário
- `temperature_control` — Controle de temperatura
- `dof` — Documento de Origem Florestal
- `integrity_checklist` — Checklist de integridade
- `manifest` — Manifesto

### Embarcações

- `antaq_registration`
- `insurance_policy`
- `inspection_report`
- `vessel_certificate`
- `crew_document`
- `safety_checklist`
- `maintenance_report`

### Negociações

- `commercial_proposal`
- `contract_draft`
- `accepted_terms`
- `insurance_terms`
- `payment_terms`
- `boarding_authorization`

### Eventos de Rastreio

- `photo_evidence`
- `delivery_proof`
- `seal_evidence`
- `temperature_evidence`
- `incident_report`
- `signature_proof`

## 3. Permissões por Role

### `shipper`

Pode:

- anexar documentos nas próprias cargas
- visualizar documentos das próprias cargas
- visualizar documentos de negociações em que é `shipperId`
- anexar documentos solicitados em negociação/carga própria

Não pode:

- visualizar documentos de cargas/negociações de terceiros
- aprovar documentos de embarcação
- alterar status de documento como `approved/rejected`

### `carrier`

Pode:

- anexar documentos das próprias embarcações
- visualizar documentos de negociações em que é `carrierId`
- anexar proposta comercial, seguro, comprovantes operacionais e evidências permitidas

Não pode:

- editar documentos de carga de outro owner
- aprovar documentos próprios como se fosse compliance/admin
- acessar negociações em que não participa

### `admin`

Pode:

- visualizar documentos de todos os domínios
- revisar documentos
- aprovar/rejeitar documentos
- auditar histórico e metadados

Não deve:

- substituir upload do usuário sem trilha de auditoria
- acessar URL permanente sem expiração

### Futuro `ops/compliance`

Pode:

- revisar documentos
- marcar pendências
- solicitar reenvio
- validar exceções operacionais

## 4. Fluxo de Upload

Fluxo recomendado:

1. UI solicita upload em contexto específico (`cargo`, `vessel`, `negotiation`, `tracking_event`).
2. Backend valida:
   - sessão
   - permissão sobre a entidade
   - tipo de documento permitido
   - tamanho máximo
   - MIME type permitido
3. Backend gera URL pré-assinada ou recebe arquivo via endpoint controlado.
4. Arquivo é salvo no storage privado.
5. Backend cria registro `Document` com:
   - `status='uploaded'` ou `under_review`
   - `uploadedBy`
   - `storageKey`
   - metadados do arquivo
6. Admin/ops revisa.
7. Documento passa para:
   - `approved`
   - `rejected`
   - `expired`

Fluxo simplificado para MVP:

```txt
Usuário autorizado
  -> escolhe arquivo
  -> backend valida contexto/permissão
  -> upload para storage privado
  -> cria Document
  -> UI mostra status
```

## 5. Storage Recomendado

Opções recomendadas:

### Supabase Storage

Boa opção se o projeto usar Supabase Postgres.

Vantagens:

- integração com Postgres/Auth
- políticas por bucket
- URLs assinadas
- bom para MVP

### S3 compatível

Boa opção para produção mais flexível.

Vantagens:

- padrão de mercado
- lifecycle policies
- versionamento
- integração com antivirus/scan

### Recomendação inicial

Usar storage privado com URLs assinadas de curta duração.

Nunca usar:

- URL pública permanente para documentos sensíveis
- base64 persistido no banco para arquivos reais
- nome original do arquivo como chave de storage

## 6. Riscos de Segurança

Riscos principais:

- upload de arquivo malicioso
- MIME type falsificado
- vazamento por URL pública
- acesso a documento de negociação alheia
- escalonamento por alteração de `entityId`
- sobrescrita de documento de terceiro
- armazenamento de dados sensíveis sem expiração
- ausência de auditoria de revisão/aprovação
- arquivo muito grande causando abuso de storage

Mitigações:

- validar sessão e autorização por entidade
- usar allowlist de MIME types
- limitar tamanho do arquivo
- gerar `storageKey` server-side
- usar URLs assinadas
- registrar `uploadedBy`, `reviewedBy` e timestamps
- nunca confiar em `entityType/entityId` sem checar ownership/participant
- futuramente adicionar scan de malware

## 7. Testes Necessários

### Unitários

- validação de MIME type permitido
- validação de tamanho máximo
- validação de tipo de documento por entidade
- função de montagem de `storageKey`
- mapeamento de status

### Integração

- `401` sem sessão
- `403` sem permissão sobre a entidade
- `400` para payload inválido
- `400/415` para MIME inválido
- `413` para arquivo grande demais
- sucesso para shipper em carga própria
- sucesso para carrier em embarcação própria
- sucesso para participante em negociação
- admin consegue revisar/aprovar/rejeitar
- usuário não participante não acessa documento

### E2E

Somente depois do backend estar estável:

- upload de documento em carga própria
- visualização de status
- rejeição/aprovação por admin
- bloqueio visual para usuário não autorizado

## 8. Impacto na UI

Áreas impactadas no futuro:

- detalhe de carga
- formulário de nova carga
- detalhe de embarcação
- detalhe de negociação
- timeline/rastreio
- painel admin/compliance
- mock-mode/QA se precisar simular estados documentais

Componentes prováveis:

- `DocumentList`
- `DocumentUploadButton`
- `DocumentStatusBadge`
- `DocumentReviewPanel`
- `RequiredDocumentsChecklist`

Cuidados:

- manter textos em `pt-BR`, `en`, `es`
- não hardcodar labels visíveis
- exibir status claro (`pendente`, `em revisão`, `aprovado`, `rejeitado`)
- não expor links diretos permanentes
- lidar com baixa conectividade em fase futura

## 9. Ordem de Implementação

### Fase 1 — Modelo e contratos

- criar tipos `Document`
- criar repository interface
- criar mock repository de documentos
- criar testes unitários de validação

### Fase 2 — API mock sem upload real

- criar endpoints para listar documentos por entidade
- criar endpoint para registrar documento mock
- manter `.mock-data`
- sem storage real ainda

### Fase 3 — UI de leitura

- exibir documentos e status em carga/negociação
- checklist de documentos obrigatórios
- sem upload real

### Fase 4 — Upload controlado

- integrar storage privado
- validar MIME/tamanho
- criar metadados no banco/mock
- gerar URLs assinadas

### Fase 5 — Revisão/admin

- painel de revisão
- aprovar/rejeitar
- motivo de rejeição
- auditoria mínima

### Fase 6 — Produção

- malware scan
- lifecycle/retention policy
- versionamento
- logs/auditoria
- permissões refinadas por entidade

