# Decisões de segurança e produto — HydroRivers

**Tipo:** documentação apenas — sem alterações em código de produção ou em testes.  
**Fonte principal:** `docs/API-SECURITY-AUDIT.md` e comportamento atual dos handlers em `src/app/api`.  
**Objetivo:** registrar decisões de produto e segurança para orientar PRs futuros.

---

## 1. `approved` por role

### Comportamento atual (código)

No cadastro (`POST /api/auth/register`), o campo booleano `approved` do usuário é definido assim:

- **`carrier`:** `approved: false`
- **`shipper`:** `approved: true` (derivado de `approved: role !== 'carrier'`)

Consequência direta em `POST /api/cargas`: usuários **não aprovados** recebem `403` com razão `user-not-approved` (`forbidden`). Ou seja, **carriers recém-registrados não publicam cargas** até que `approved` vire `true` por fluxo externo ao handler atual (**«a confirmar»** onde esse fluxo existir — hoje típico mock/admin manual).

### Comportamento esperado (decisão de produto)

| Role | `approved` no registro | Motivação |
|------|-------------------------|-----------|
| **shipper** | `true` | Publicação de carga é o núcleo do embarcador no MVP; moderação pode ser postposta para canal institucional ou verificação documental futura. |
| **carrier** | `false` | Transportador exige checagem operacional/compliance antes de propor fretes em nome da frota (alinha ao texto de onboarding em produtos logísticos). |

**Decisão:** manter o modelo **shipper liberado / carrier sob moderação** como **comportamento esperado oficial** no HydroRivers até haver fluxo explícito de aprovação de carrier na UI e API dedicada.

### Risco

| Risco | Gravidade | Nota |
|-------|-----------|------|
| Shipper fraudulento publica sem KYC | Média (demo baixa; prod alta) | Mitigar com verificação futura e rate limit — ver auditoria R4. |
| Carrier bloqueado sem feedback na UX | Baixa/média | Exige cópia clara na UI quando `403 user-not-approved`. |
| Estado `approved` só alterável por caminhos não documentados no MVP | Média | Documentar como admins/mock alteram usuários **«fora deste escopo se não existir API»**. |

---

## 2. Admin em `POST /api/negociacoes`

### Situação atual (auditoria)

A rota exige sessão e **bloqueia apenas `shipper`** (`user.role === 'shipper'` → `403`). **`admin`** não é bloqueado e pode criar negociações como qualquer «não-shipper».

### Decisão

**Administradores não devem criar negociações via `POST /api/negociacoes` no modelo de produção.**

**Justificativa:**

1. **Trilha de auditoria:** proposta comercial deve estar associada a um **transportador** (`carrierId`) real; admin criando registro mistura papéis e dificulta «quem propôs» em disputas.
2. **Separação de funções:** QA e cenários devem usar **`POST /api/mock-mode`** (já restrito a admin), não mutações operacionais falsas.
3. **Superfície de abuso:** admin com sessão comprometida não deve poder injectar negócios arbitrários sem fluxo explícito «suporte/act as».

**Comportamento esperado após implementação futura:**

- `POST /api/negociacoes`: permitido apenas para **`role === 'carrier'`** (e opcionalmente **`approved === true`** quando política carrier existir para propostas).
- **`admin`:** `403` com razão explícita (ex.: `role-not-allowed` ou código dedicado `admin-cannot-create-negotiation`).
- **Exceção futura «a confirmar»:** apenas se existir feature formal **impersonação auditada** com logs próprios — fora do escopo desta decisão.

---

## 3. `ownerId` e `shipperId` na publicação de carga

### Situação atual (código)

As mutações **`POST /api/cargas`** e a **Server Action** de publicar carga (`publishCargoAction` → `commitPublishCargo` em `src/features/cargos/server/commit-publish-cargo.ts`) **persistem** a carga com:

- **`ownerId: user.id`**
- **`shipperId: user.id`**

no fluxo atual de criador autenticado (regras de papel/`approved` aplicadas antes de persistir). **`producer`** continua derivado de `user.company`.

Cargas antigas vindas só de **seed** ou cenários mock podem ainda não ter esses campos — tratar como legado até normalização; não confundir com o fluxo de publicação pela API/ação.

### Decisão

**Toda carga criada por um usuário autenticado pelos fluxos oficiais de publicação deve ter `ownerId` (e, no modelo atual, `shipperId` alinhado ao embarcador responsável) definidos a partir da sessão**, salvo política futura explícita para «carga em nome de terceiro» (institucional), que exigiria endpoint e permissões próprios.

**Campos:**

- **`ownerId`:** obrigatório na persistência do fluxo de criação — igual a `user.id` do criador no modelo atual (**admin** que publica pela mesma rota fica como dono técnico no mock — aceitável para demo; produto futuro pode restringir quem publica).
- **`shipperId`:** no mesmo fluxo, **igual a `user.id`** para alinhar filtros e cenários «minhas cargas» ao domínio de negociação.

**Justificativa:**

1. Consistência com modelo relacional planejado (`docs/DATABASE-PLANNING.md`).
2. Base para **`/minhas-cargas`**, filtros por dono e regras de UI (ex.: proposta no detalhe da carga por papel/`approved`).
3. Evita cargas «sem dono» em dados **criados** pela API ou pela ação de publicação.

**Nota:** evolução futura (institucional, multi-tenant) pode separar semanticamente `ownerId` e `shipperId`; hoje ambos refletem o **criador da publicação** no mock.

---

## 4. JSON inválido em `POST /api/mock-mode`

### Situação atual (auditoria)

Com body não JSON ou parse falho, `payload` pode ser `null`; **`resetMockScenario` ainda pode ser invocado**, efetivamente resetando dados mesmo com entrada inválida.

### Decisão

**Comportamento esperado:**

1. Se o corpo não for JSON válido **ou** não puder ser interpretado como objeto esperado → **`400`** com `{ error: 'invalid-payload', reason: 'invalid-json' }` (ou razão equivalente padronizada).
2. **Não executar reset** da base mock nestes casos.
3. Cenário ausente ou string desconhecida pode seguir política já existente (reset para default/base **«a confirmar»** em PR dedicado); o mínimo aqui é **falha de parse ≠ reset silencioso**.

### Risco mitigado

Reset acidental ou comportamento não idempotente em ferramentas que enviam body vazio/errado.

---

## 5. Padrão de erros de API

### Formato esperado (contrato alvo)

Todas as respostas de erro devem ser JSON com pelo menos:

```json
{
  "error": "<codigo-estavel-em-inglês-kebab-ou-snake>",
  "reason": "<opcional-string-código-machine-readable>"
}
```

**HTTP status × uso:**

| Status | Campo `error` (exemplos) | Campo `reason` |
|--------|--------------------------|----------------|
| **400** | `invalid-payload` | Detalhe curto (`invalid-json`, `missing-required-fields`, …) |
| **401** | `unauthenticated` \| `invalid-login` \| `invalid-otp` | Opcional; compatível com login legado |
| **403** | `forbidden` | Razão (`role-not-allowed`, `user-not-approved`, …) quando aplicável |
| **404** | `not-found` **«a confirmar»** unificação vs `negotiation-not-found` atual | Identificador do recurso ausente |
| **500** | `internal-error` | Omitir detalhes internos ao cliente; log servidor |

### Compatibilidade

- Rotas que hoje retornam **`{ error: 'invalid-login' }`** ou **`email-already-registered`** sem `reason` podem permanecer **uma versão**, desde que documentadas como «legado» até PR de padronização.
- Objetivo de migração: adicionar `reason` sem quebrar clientes que só leem `error`.
- **`409`** em registro pode manter `{ error: 'email-already-registered' }` com opcional `reason` duplicado para alinhamento.

**Decisão:** adotar o formato acima como **north star**; PRs incrementais migram handlers para helpers centralizados (`api-errors.ts`) sem mudar semântica HTTP.

---

## 6. CSRF e logout futuro

### Risco

- **`POST /api/auth/logout`** aceita chamadas sem validação anti-CSRF explícita; cookie `SameSite=Lax` reduz envio cross-site em muitos cenários de navegação **GET-driven**, mas **não cobre todos** (ex.: alguns fluxos POST cross-site, clientes não-browser **«a confirmar»**).
- **`POST /api/mock-mode`** com sessão admin: um site malicioso poderia induzir browser da vítima a resetar dados se cookies forem enviados — mitigação depende de SameSite + origem.

### Recomendação futura (sem implementação nesta etapa)

1. Manter **`SameSite=Lax`** ou **`Strict`** onde UX permitir para cookie de sessão.
2. Introduzir **token CSRF double-submit** ou **header customizado** validado pelo servidor para operações mutáveis sensíveis (`logout`, `mock-mode`, futuros PATCH críticos).
3. Para SPA/fetch: **`Authorization`** ou header **`X-Requested-With`** + validação de origem (`Origin`/`Referer`) onde aplicável Next.js.
4. Em produção real: avaliar **BFF** único domínio e políticas CSP.

---

## Tabela de decisões (resumo)

| ID | Tema | Decisão |
|----|------|---------|
| D1 | `approved` por role | Shipper `true` e carrier `false` ao registrar — comportamento esperado oficial alinhado ao código atual. |
| D2 | Admin em POST negociações | **Proibido:** apenas `carrier` (futuro); admin usa mock-mode para cenários. |
| D3 | `ownerId` / `shipperId` na publicação de carga | **Implementado** em `commitPublishCargo` (API POST + Server Action); seeds legadas podem divergir. |
| D4 | JSON inválido mock-mode | **400 + não resetar** base mock. |
| D5 | Erro API | Contrato `{ error, reason? }` com migração gradual a partir do legado. |
| D6 | CSRF/logout | Documentar risco; recomendar tokens/Headers em fase posterior. |

---

## Impacto técnico

| Decisão | Impacto |
|---------|---------|
| D1 | Possível trabalho de UX/copy para carriers não aprovados; eventual API de aprovação. |
| D2 | Alteração condicional em `negociacoes/route.ts` POST + mensagens `403`. |
| D3 | Manter paridade em novos fluxos de escrita; opcionalmente **backfill** ou documentar seeds sem `ownerId`. |
| D4 | Guard clause antes de `resetMockScenario` em `mock-mode/route.ts`. |
| D5 | Expansão de `api-errors.ts` ou helpers 404; alinhar login/register gradualmente. |
| D6 | Middleware ou helper CSRF; possível mudança em cliente fetch. |

---

## Impacto em testes

| Decisão | Impacto em testes (quando implementado) |
|---------|------------------------------------------|
| D2 | Integração: admin → `403` em POST negociações; carrier mantém `201`. |
| D3 | Integração POST cargas / publicação: resposta deve incluir `ownerId` e `shipperId` esperados. |
| D4 | Integração mock-mode: body inválido → `400`, mock não alterado (assert pré/pós arquivo ou spy em `resetMockScenario`). |
| D5 | Snapshots/assert em formato JSON de erro; regressão login legível. |
| D6 | Testes E2E ou integração para logout com token quando existir. |

*Nesta etapa não se alteram testes existentes; apenas planeja-se cobertura.*

---

## Prioridade sugerida

| Prioridade | Item |
|------------|------|
| **P0** | D4 (mock-mode + JSON inválido) — evita efeito colateral destructivo |
| **P1** | D2 (admin POST negociações) — integridade de auditoria |
| **P1** | D5 (padronização erros) — observabilidade e clientes estáveis |
| **P2** | D1 (documentação UX + fluxo aprovação carrier se ausente) |
| **P2** | D6 (CSRF) — antes ou junto com exposição pública ampla |

---

## PRs recomendados (somente planejamento)

1. **`fix(api): mock-mode não reseta com JSON inválido`** — D4 + testes integração.
2. ~~**`feat(api): definir ownerId em POST /api/cargas`**~~ — **feito:** `commitPublishCargo` + Server Action; opcional: PR de higiene em seeds legados.
3. **`fix(api): restringir POST /api/negociacoes a carrier`** — D2 + testes (admin regression).
4. **`refactor(api): padronizar erros 404 e helpers`** — D5 incremental.
5. **`docs + chore:`** política CSRF e checklist deploy — D6 preparatório.

---

## Referências

- `docs/API-SECURITY-AUDIT.md`
- `docs/DATABASE-PLANNING.md` (ownership)
- `AGENTS.md` (incrementos pequenos, testes após mudanças sensíveis)

---

*Documento vivo: revisar após cada mudança relevante nas APIs.*
