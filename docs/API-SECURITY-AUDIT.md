# Auditoria de Segurança das APIs — HydroRivers

## Escopo

Esta auditoria cobre as rotas atuais em `src/app/api`, com foco em autenticação, autorização, validação de payload, exposição de dados e testes necessários.

Rotas analisadas:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/me`
- `/api/auth/profile`
- `/api/auth/logout`
- `/api/cargas`
- `/api/embarcacoes`
- `/api/negociacoes`
- `/api/rastreio`
- `/api/mock-mode`

## Resumo Executivo

- Rotas de escrita críticas já possuem parte importante do hardening: `POST /api/cargas`, `POST/PATCH /api/negociacoes`, `PUT /api/auth/profile` e `POST /api/mock-mode`.
- A autorização por participante está presente em `PATCH /api/negociacoes`.
- `POST /api/mock-mode` exige sessão e role `admin`.
- As rotas públicas de leitura (`GET /api/cargas`, `GET /api/embarcacoes`, `GET /api/negociacoes`, `GET /api/rastreio`) são o maior ponto de atenção, especialmente `negociacoes` e `rastreio`, por exporem dados operacionais sem sessão.
- A validação de payload é manual e localizada; ainda não há schema centralizado.
- O login OTP foi endurecido para não expor `otpCode` por padrão, mas o modo demo/debug precisa permanecer protegido por ambiente.

## Matriz de Regras

### `/api/auth/login`

**Método HTTP:** `POST`

**Regra esperada:** rota pública para autenticação, com validação de credenciais, OTP e sem retorno de dados sensíveis.

**Regra atual:** não exige sessão. Valida JSON, email/senha, senha via hash PBKDF2 e OTP/challenge. Retorna `401` para login inválido e OTP inválido. Retorna `otpCode` somente se `HYDRORIVERS_EXPOSE_OTP_CODE=true`.

**Risco:** médio. Pode sofrer brute force por não ter rate limit. `otpCode` em modo demo pode vazar se a flag for ativada em ambiente indevido. O `challenge` é derivado de dados previsíveis.

**Recomendação:** adicionar rate limit, auditoria de tentativas, garantir `HYDRORIVERS_EXPOSE_OTP_CODE` desativado fora de demo/E2E e substituir challenge mock por mecanismo assinado quando houver auth real.

**Testes necessários:** manter testes para `400 invalid-json`, `400 missing-credentials`, `401 invalid-login`, `otpRequired` sem `otpCode` por padrão, `otpCode` apenas com flag, `401 invalid-otp` e `200` com cookie em login válido.

### `/api/auth/register`

**Método HTTP:** `POST`

**Regra esperada:** rota pública para cadastro controlado, sem permitir criação pública de admin, com validação mínima de campos.

**Regra atual:** não exige sessão. Valida JSON, nome, empresa, email, senha mínima e role. Permite apenas `shipper` e `carrier`. Retorna `403` para role inválida e `409` para email já registrado. Retorna usuário público sem `passwordHash`.

**Risco:** médio. Falta validação formal de email, normalização mais rígida, rate limit e proteção contra spam. IDs baseados em timestamp não são ideais para produção.

**Recomendação:** adicionar schema de payload, rate limit, verificação de email e UUID quando migrar para banco real.

**Testes necessários:** cobrir `400`, `403 invalid-role`, `409 email-already-registered`, criação `shipper`, criação `carrier` com `approved=false` e ausência de `passwordHash` na resposta.

### `/api/auth/me`

**Método HTTP:** `GET`

**Regra esperada:** exige sessão e retorna apenas usuário público.

**Regra atual:** exige sessão via `getSessionUser`. Retorna `401` com `{ user: null }` sem sessão e `200` com `toPublicUser(user)` com sessão.

**Risco:** baixo. A rota não retorna `passwordHash`. O risco principal está na sessão mock não assinada.

**Recomendação:** manter contrato público e migrar sessão para mecanismo assinado/seguro em fase de auth real.

**Testes necessários:** manter `401` sem sessão, `200` com usuário e asserção explícita de que `passwordHash` não é retornado.

### `/api/auth/profile`

**Método HTTP:** `PUT`

**Regra esperada:** exige sessão; usuário só altera o próprio perfil; campos críticos como `id`, `role`, `approved` e `passwordHash` não devem ser controláveis pelo payload.

**Regra atual:** exige sessão e usa `current` como base. Valida JSON, nome, email e empresa. Preserva `id`, `role`, `approved` e `passwordHash` do usuário atual. Retorna usuário público.

**Risco:** médio-baixo. O usuário pode alterar email sem confirmação e sem checagem de duplicidade. `avatarUrl` é aceito como string, sem validação forte.

**Recomendação:** validar email, impedir duplicidade, limitar/tipar `avatarUrl`, e futuramente separar mudança de email em fluxo próprio.

**Testes necessários:** `401` sem sessão, `400 invalid-json`, `400 missing-required-fields`, `200` preservando `id/role/approved`, ausência de `passwordHash`, e teste futuro para email duplicado quando a regra existir.

### `/api/auth/logout`

**Método HTTP:** `POST`

**Regra esperada:** encerra sessão; deve ser seguro chamar mesmo sem sessão.

**Regra atual:** não exige sessão. Deleta cookie `hydrorivers_session` e retorna `{ ok: true }`.

**Risco:** baixo. A operação é idempotente. Em produção real, considerar CSRF dependendo da estratégia de cookies.

**Recomendação:** manter idempotente; revisar CSRF quando auth real for introduzida.

**Testes necessários:** `200` e cookie removido; opcionalmente chamada sem sessão continua `200`.

### `/api/cargas`

**Método HTTP:** `GET`

**Regra esperada:** depende da decisão de produto. Se marketplace público, retornar dados públicos/sanitizados. Se privado, exigir sessão.

**Regra atual:** pública. Retorna todas as cargas de `readMock('cargoes')`, incluindo documentação, riscos operacionais, produtor, readiness e campos operacionais.

**Risco:** médio. Pode expor dados comerciais/operacionais se usado fora do mock/demo.

**Recomendação:** definir contrato público vs privado. Para produção, retornar uma versão pública da carga ou exigir sessão e filtrar por role.

**Testes necessários:** teste de contrato para campos públicos permitidos; se passar a exigir sessão, testes `401` e `200`.

### `/api/cargas`

**Método HTTP:** `POST`

**Regra esperada:** exige sessão; `carrier` não pode criar carga; usuário precisa estar aprovado; payload deve ter campos obrigatórios.

**Regra atual:** exige sessão. Retorna `401` sem sessão, `403` para `carrier`, `403` para usuário não aprovado, `400` para JSON/payload inválido e `201` no sucesso. Normaliza campos e usa `user.company` como produtor.

**Risco:** médio. Validação é manual. Admin também pode criar carga porque apenas `carrier` é bloqueado. A carga criada não define `ownerId`, o que pode afetar autorização futura por dono.

**Recomendação:** decidir explicitamente se admin pode criar carga. Definir `ownerId` na criação. Adicionar schema formal e limites para arrays/documentos.

**Testes necessários:** manter `401`, `403 carrier`, `403 not-approved`, `400`, `201`; adicionar teste para `ownerId` quando a regra for implementada.

### `/api/embarcacoes`

**Método HTTP:** `GET`

**Regra esperada:** depende da decisão de produto. Marketplace público pode expor resumo; detalhes operacionais devem ser controlados.

**Regra atual:** pública. Retorna todas as embarcações de `readMock('vessels')`, incluindo proprietário, status documental, inspeção e certificações.

**Risco:** médio. Pode vazar capacidade, disponibilidade, documentação e dados operacionais de frota.

**Recomendação:** criar DTO público de embarcação ou exigir sessão. Para carrier, futuramente filtrar embarcações próprias em rotas de gestão.

**Testes necessários:** contrato de campos públicos; se exigir sessão, `401` e `200`.

### `/api/negociacoes`

**Método HTTP:** `GET`

**Regra esperada:** exige sessão e deve filtrar por participante, ou permitir admin/ops visualizar tudo.

**Regra atual:** pública. Retorna todas as negociações de `readMock('negotiations')`.

**Risco:** alto. Negociações contêm valores, partes, documentos, termos de pagamento, seguro, histórico e próximos passos.

**Recomendação:** exigir sessão imediatamente em uma fase de hardening. Filtrar por `shipperId`/`carrierId`; permitir visão completa apenas para `admin`/operações.

**Testes necessários:** `401` sem sessão, `200` com participante recebendo apenas suas negociações, `200` admin recebendo tudo, e teste negativo para não participante.

### `/api/negociacoes`

**Método HTTP:** `POST`

**Regra esperada:** exige sessão; apenas transportador pode criar proposta; cargo e embarcação precisam existir; payload obrigatório validado.

**Regra atual:** exige sessão. Retorna `401` sem sessão, `403` para `shipper`, `400` para campos ausentes, `404` para cargo/embarcação inexistente e `201` no sucesso. Define `carrierId` como usuário atual.

**Risco:** médio. Não valida se a embarcação pertence ao transportador (`ownerId`). Validação manual e sem transação real ao escrever negociação e atualizar carga.

**Recomendação:** exigir que `vessel.ownerId === user.id` quando os dados mock/real tiverem ownership consistente. Migrar escrita dupla para transação quando houver banco.

**Testes necessários:** manter `401`, `403 shipper`, `400`, `404 cargo`, `404 vessel`, `201`; adicionar teste futuro para carrier tentando usar embarcação de outro owner.

### `/api/negociacoes`

**Método HTTP:** `PATCH`

**Regra esperada:** exige sessão; payload válido; negociação existente; apenas `shipperId` ou `carrierId` pode alterar status.

**Regra atual:** exige sessão. Retorna `401`, `400`, `404`, `403` para não participante e `200` para participante válido. Ao aceitar, marca carga como `reserved`.

**Risco:** médio-baixo. Regra de participante existe. Falta matriz de permissões por status/role: qualquer participante pode aplicar qualquer status válido.

**Recomendação:** definir transições permitidas por role e estado atual. Exemplo: carrier cria proposta, shipper aceita/rejeita, ambos podem cancelar sob regras específicas.

**Testes necessários:** manter cobertura atual (`401`, `400`, `404`, `403`, `200`) e adicionar testes de transição por role quando a matriz for definida.

### `/api/rastreio`

**Método HTTP:** `GET`

**Regra esperada:** exige sessão e filtra eventos por carga/negociação acessível ao usuário, ou permite admin/ops visualizar tudo.

**Regra atual:** pública. Retorna todos os eventos de rastreio.

**Risco:** alto. Eventos de rastreio expõem localização, horário, evidências e status operacional.

**Recomendação:** exigir sessão e filtrar por acesso à carga/negociação. Evitar expor evidências sensíveis sem autorização explícita.

**Testes necessários:** `401` sem sessão, `200` participante com eventos permitidos, admin com visão completa e bloqueio para não participante.

### `/api/mock-mode`

**Método HTTP:** `GET`

**Regra esperada:** pode ser público em demo, mas em produção deveria ser desabilitado ou restrito.

**Regra atual:** pública. Retorna cenário ativo e lista de cenários mock.

**Risco:** baixo em demo, médio em produção. Revela estado de QA/mock.

**Recomendação:** manter apenas em ambiente mock/demo ou exigir admin também no `GET` quando aproximar de produção.

**Testes necessários:** contrato atual de `GET`; teste futuro para desabilitar/restringir por ambiente.

### `/api/mock-mode`

**Método HTTP:** `POST`

**Regra esperada:** exige sessão e role `admin`.

**Regra atual:** exige sessão. Retorna `401` sem sessão, `403` para não-admin e `200` para admin. Reseta cenário mock.

**Risco:** baixo no comportamento atual. A rota altera estado global mock e por isso deve permanecer restrita.

**Recomendação:** manter admin-only. Em produção real, desabilitar a rota ou proteger por feature flag adicional.

**Testes necessários:** manter `401`, `403`, `200 admin`, e garantir que `resetMockScenario` não é chamado nos casos negados.

## Lacunas Transversais

### Validação de Payload

Hoje a validação é manual (`isNonEmptyText`, casts e checks locais). Isso é suficiente para MVP, mas frágil para produção.

**Recomendação:** introduzir schemas por rota quando o baseline estiver estável. Evitar refatoração ampla; começar por `auth`, `cargas` e `negociacoes`.

### Dados Sensíveis

`passwordHash` é removido nas respostas de usuário por `toPublicUser`, o que é positivo. Os maiores riscos atuais não estão em auth, mas em dados operacionais públicos: negociações, rastreio, embarcações e cargas.

**Recomendação:** criar DTOs públicos e privados por domínio.

### Sessão e Auth

A sessão atual é mock e baseada em cookie com `user.id`. Não é uma sessão de produção.

**Recomendação:** antes de produção, substituir por sessão assinada/provider real, expiração segura, rotação e proteção contra abuso.

### Auditoria e Observabilidade

Não há trilha estruturada de decisões sensíveis como login, reset de mock, criação de carga, proposta e alteração de negociação.

**Recomendação:** adicionar logger estruturado mínimo com eventos sem payload sensível.

## Prioridade Recomendada

1. Restringir `GET /api/negociacoes` e `GET /api/rastreio`.
2. Definir DTO público para `GET /api/cargas` e `GET /api/embarcacoes`.
3. Adicionar ownership de embarcação em `POST /api/negociacoes`.
4. Definir matriz de transições de status em `PATCH /api/negociacoes`.
5. Introduzir schemas formais de payload.
6. Migrar sessão mock para auth real antes de qualquer uso produtivo.
