# Auditoria de segurança e regras de negócio — APIs HydroRivers

**Tipo:** documentação apenas (sem alterações em código de produção ou em testes).  
**Base:** análise estática dos arquivos em `src/app/api/**/route.ts` e helpers em `src/shared/server/api-errors.ts`.  
**Incerteza:** onde a regra de produto não está explícita no código, consta **«a confirmar»**.

---

## 1. Objetivo

Registrar, por rota HTTP:

- requisitos de **sessão**, **papel (role)** e **owner/participante**;
- **status** esperados relevantes (`400`, `401`, `403`, `200`, `201`, e outros observados no código);
- **comportamento atual** inferido do código;
- **risco**, **recomendação** e **testes que deveriam existir**.

Servir de base para endurecimento futuro sem misturar com implementação nesta fase.

---

## 2. Escopo analisado

| Inclusão | Caminho / artefato |
|----------|-------------------|
| Rotas App Router | `src/app/api/auth/login/route.ts` |
| | `src/app/api/auth/register/route.ts` |
| | `src/app/api/auth/me/route.ts` |
| | `src/app/api/auth/profile/route.ts` |
| | `src/app/api/auth/logout/route.ts` |
| | `src/app/api/cargas/route.ts` |
| | `src/app/api/negociacoes/route.ts` |
| | `src/app/api/embarcacoes/route.ts` |
| | `src/app/api/rastreio/route.ts` |
| | `src/app/api/mock-mode/route.ts` |
| Helpers de erro | `src/shared/server/api-errors.ts` (`unauthenticated`, `forbidden`, `invalidPayload`) |

**Fora do escopo desta revisão:** middleware de páginas (`middleware.ts`), chamadas fetch do cliente, validação duplicada na UI.

---

## 3. Matriz de rotas

Legenda:

- **Sessão:** cookie `hydrorivers_session` resolvido por `getSessionUser()` onde aplicável.
- **403 padronizado:** corpo típico `{ error: 'forbidden', reason? }` quando usa `forbidden()`; exceções indicadas.

### Auth

| Rota | Método | Sessão | Role | Owner / participante | Status (esperados / observados) | Comportamento atual identificado | Risco | Recomendação | Testes que deveriam existir |
|------|--------|--------|------|----------------------|---------------------------------|----------------------------------|-------|--------------|---------------------------|
| `/api/auth/login` | POST | Não | — | — | `400` JSON inválido/campos via `invalid-payload`; `401` credencial ou OTP inválidos; `200` OTP pendente ou login OK | Corpo JSON; exige email+senha; OTP opcional na segunda chamada; cookie httpOnly em sucesso; `otpCode` só se `HYDRORIVERS_EXPOSE_OTP_CODE=true` | Brute force sem rate limit; challenge previsível em ambiente mock | Rate limit; revisar challenge em auth real; garantir flag OTP só em demo/E2E | `400` razões; `401`; OTP obrigatório; opcionalmente flag OTP |
| `/api/auth/register` | POST | Não (mas define cookie ao registrar) | Implícito: só `shipper`/`carrier` no body | — | `400` payload inválido/faltante; `403` role inválida; `409` email duplicado; `201` criado | Validação textual mínima; senha ≥ 6; `approved`: carrier `false`, shipper **«a confirmar»** no código (`approved: role !== 'carrier'` → shipper `true`) | Spam/registro em massa; IDs baseados em tempo | Schema estrito (email); rate limit; UUID em migração DB | `400`, `403`, `409`, `201`; ausência de `passwordHash` na resposta |
| `/api/auth/me` | GET | Sim | — | — | `401` sem usuário; `200` usuário público | Retorna `toPublicUser` | Baixo para leak de hash se `toPublicUser` correto **«a confirmar»** contrato | Manter ausência de campos sensíveis | `401`, `200`; formato estável |
| `/api/auth/profile` | PUT | Sim | — | Só «si mesmo»: atualiza sessão atual | `401`; `400`; `200` | Preserva `id`, `role`, `approved`, `passwordHash`; permite mudar nome/email/empresa/contatos | Mudança de email sem verificação **«a confirmar»** produto | Fluxo de confirmação de email em produção | `401`, `400`, `200`; campos imutáveis preservados |
| `/api/auth/logout` | POST | Não obrigatória | — | — | `200` | Remove cookie `hydrorivers_session` sempre | CSRF **«a confirmar»** se política SameSite mudar | Aceitável para MVP mock | Opcional: sessão válida irrelevante |

### Marketplace / operações

| Rota | Método | Sessão | Role | Owner / participante | Status | Comportamento atual identificado | Risco | Recomendação | Testes que deveriam existir |
|------|--------|--------|------|----------------------|--------|----------------------------------|-------|--------------|---------------------------|
| `/api/cargas` | GET | **Não** | — | — | `200` | Lista **todas** as cargas em mock | Alto: dados operacionais expostos | Exigir sessão e escopo (owner/participante ou público limitado) em produto | `200` contrato; futuro `401`/`403` por escopo |
| `/api/cargas` | POST | Sim | **Not carrier**; `approved` obrigatório | Persistência via **`commitPublishCargo`**: define **`ownerId`** e **`shipperId`** como `user.id`, **`producer`** como `user.company` | `401`; `403` carrier ou não aprovado; `400`; `201` | Mesmo núcleo usado pela Server Action de publicar carga na UI (`useActionState`) | Carrier ainda bloqueado; **GET** continua sem escopo — ver R1 | Endurecer listagens GET conforme produto | Cobrir `401`, `403`, `400`, `201`; assert `ownerId`/`shipperId` na resposta |
| `/api/negociacoes` | GET | **Não** | — | — | `200` | Lista **todas** as negociações | Alto | Restringir leitura por participante ou papel | Futuro `401` + lista filtrada |
| `/api/negociacoes` | POST | Sim | **Not shipper** (implicitamente carrier/admin **«a confirmar»** se admin deve propor) | Não verifica se carrier «possui» embarcação **«a confirmar»** | `401`; `403` shipper; `400`; `404` cargo/embarcação; `201` | Cria negociação; atualiza carga para `bidding` | Admin poder criar proposta como qualquer «não shipper» | Restringir role `carrier` apenas ou validar vínculo vessel→user | `401`, `403`, `400`, `404`, `201` |
| `/api/negociacoes` | PATCH | Sim | — | Sim: `shipperId` ou `carrierId` === `user.id` | `401`; `400` payload/id/status inválidos; `403` não participante; `404`; `200` | Atualiza `status`; `accepted` → estágio `contract` e carga `reserved` | Transições de estado sem máquina explícita **«a confirmar»** (ex.: rejected → accepted) | State machine documentada + validação | Já parcialmente coberto por testes existentes **«não alterar testes nesta fase»** — documentar lacunas |
| `/api/embarcacoes` | GET | **Não** | — | — | `200` | Lista todas embarcações | Alto escopo dados sensíveis operacionais | Autenticação/filtro por owner em produto | Contrato lista; futuro escopo |
| `/api/rastreio` | GET | **Não** | — | — | `200` | Lista todos eventos de rastreio | Alto localização/evidências | Sessão + filtro por carga/negociação autorizada | Contrato; futuro auth |

### Admin / QA

| Rota | Método | Sessão | Role | Owner / participante | Status | Comportamento atual identificado | Risco | Recomendação | Testes que deveriam existir |
|------|--------|--------|------|----------------------|--------|----------------------------------|-------|--------------|---------------------------|
| `/api/mock-mode` | GET | **Não** | — | — | `200` | Expõe cenário ativo + lista `mockScenarioIds` | Baixo/médio: enumera cenários internos | Opcional: só admin ou remover em prod | Smoke contrato |
| `/api/mock-mode` | POST | Sim | **`admin`** | — | `401`; `403`; `200` | Reseta datasets; body JSON opcional (`scenario`) — JSON inválido ainda pode chamar reset **«a confirmar»** se aceitável | Reset acidental / bypass CSRF **«a confirmar»** | Validar JSON estrito; CSRF/token em prod | `401`, `403`, `200`; cenário inválido **«a confirmar»** comportamento esperado |

---

## 4. Regras esperadas por domínio

### Autenticação

- Login/registro são **públicos** por natureza; demais operações sensíveis devem convergir para modelo **autenticado + autorizado**.
- Respostas de erro: uso misto de `invalidPayload` (`400`, `{ error: 'invalid-payload', reason }`) vs `{ error: 'invalid-login' }` sem campo `reason` — **«a confirmar»** padronização global desejada.

### Cargas

- **Regra de produto esperável:** embarcadores publicam; transportadores não publicam diretamente — **implementado** para POST (`carrier` bloqueado).
- **Owner / shipper na criação:** **`commitPublishCargo`** atribui **`ownerId` e `shipperId`** ao persistir (POST API e fluxo de formulário com Server Action). Cargas **só de seed** podem ainda não refletir isso — não confundir com o fluxo de publicação.
- **UI detalhe carga:** visibilidade do formulário de proposta por **role** e **`approved`** (mock) — ver código em `cargo-proposal-visibility` / `CargoDetail`; não substitui autorização forte nas APIs.

### Negociações

- **POST:** apenas papel não-shipper — adequado para «carrier propõe»; papel **admin** não foi excluído explicitamente.
- **PATCH:** participação shipper/carrier — **implementado**.
- **GET:** sem escopo — **diverge** de modelo forte por participante.

### Rastreio / embarcações

- Leitura aberta — útil para demo; **inadequado** para dados operacionais reais sem anonimização ou auth.

### Mock-mode

- **POST:** apenas **admin** — **implementado**.
- **GET:** público — aceitável em demo; revisar em deploy público.

---

## 5. Riscos encontrados

| ID | Risco | Severidade (demo → produto) |
|----|--------|-----------------------------|
| R1 | **GET** em cargas, negociações, embarcações, rastreio **sem sessão** expõe dados operacionais completos | Alta em produção |
| R2 | Negociação **POST** não valida vínculo carrier ↔ vessel **«a confirmar»** | Média |
| R3 | Cargas **criadas por POST/publicação** gravam **`ownerId`/`shipperId`**; **GET** ainda lista tudo — risco de vazamento em produto real permanece (R1) | Média em produção |
| R4 | Auth mock sem rate limiting | Média |
| R5 | OTP/challenge previsíveis em demo | Esperado em mock; crítico se transportados para prod |
| R6 | Transições de `Negotiation.status` sem máquina de estados documentada no código | Baixa/média |
| R7 | **mock-mode GET** lista cenários para não autenticados | Baixa |

---

## 6. Recomendações prioritárias

1. **P0 (produção real):** exigir autenticação e **filtro por escopo** em GET de negociações, rastreio e, conforme política, cargas/embarcações.
2. **P1:** endurecer **GETs** e listagens por escopo (R1); **P1 concluído para escrita:** `ownerId`/`shipperId` em mutação de publicação via `commitPublishCargo`.
3. **P1:** validar **POST /api/negociacoes** com regra carrier ↔ vessel (ou documentar exceção admin).
4. **P2:** padronizar corpo JSON de todos os erros (`401`/`403`/`400`) onde ainda divergir.
5. **P2:** rate limiting e política de **logout**/login em ambientes públicos.
6. **P3:** **mock-mode** desabilitado ou protegido por ambiente em deploy público.

---

## 7. Testes recomendados

(Não criados nem alterados nesta fase — apenas recomendação.)

| Área | Sugestão |
|------|-----------|
| Auth | Matriz completa de `400`/`401`/`403`/`409`/`201`; regressão OTP + flag |
| Cargas GET | Testes futuros: usuário só vê subset — quando implementado |
| Cargas POST | Resposta com `ownerId` / `shipperId` coerentes com sessão (fluxo `commitPublishCargo`) |
| Negociações GET | Filtragem por participante — quando implementado |
| Negociações POST | `403` shipper; vínculo vessel; opcional admin |
| Negociações PATCH | Matriz `403` terceiros; edge cases de status |
| Embarcações / Rastreio | Auth + escopo quando implementado |
| mock-mode | JSON inválido; cenário desconhecido; não-admin |

Manter integração **Vitest** + mocks estáveis conforme política do repositório (`AGENTS.md`).

---

## 8. Próximos passos

1. **Produto/legal:** confirmar (**«a confirmar»**) quais GET podem permanecer públicos em MVP público vs demo fechado.
2. **Engenharia:** especificar máquina de estados de negociação e cargas para PATCH/POST.
3. **Implementação futura:** aplicar recomendações P0–P3 em PRs pequenos com testes de integração novos.
4. **Revisão:** repetir esta auditoria após introdução de **repository**/DB (`docs/DATABASE-PLANNING.md`).

---

*Documento gerado por revisão estática dos handlers; comportamento em runtime pode depender de cookies, `.mock-data` e variáveis de ambiente.*
