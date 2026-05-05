# Onboarding de desenvolvedores e uso seguro de agentes — HydroRivers

Este guia é para **quem está entrando no projeto agora**: não assume que você já conhece o produto, as regras de negócio ou onde mexer no código. Também orienta **como usar IA e agentes** sem quebrar regras acordadas pelo time.

**Escopo:** documentação apenas — não substitui leitura pontual dos arquivos citados quando você for implementar algo específico.

---

## 1. Visão geral do HydroRivers

### Problema que resolve

Na prática, quem opera **logística hidroviária e cabotagem** costuma lidar com informações espalhadas: oferta de carga, frota, proposta, contrato informal, papelada e “onde está o barco”. O HydroRivers é uma **aplicação web** que **centraliza esse fluxo em um só lugar**, em formato demonstrável (MVP), com foco em contextos onde **conectividade e confiança** são sensíveis — não é um ERP completo nem um TMS enterprise no estado atual.

### Público-alvo do produto

- **Embarcadores / cooperativas** que precisam publicar demanda e acompanhar negociação e rastreio.
- **Transportadores / armadores** que buscam cargas compatíveis e participam de negociações.
- **Administração da plataforma** para cenários, QA e governança mock.
- **Governo / operação institucional** como **audiência da página dedicada** — persona de produto; nem todo reflexo existe como um quarto “role” técnico idêntico aos outros em todas as APIs.

*(Detalhes de personas também aparecem em `docs/ARCHITECTURE.md` e `docs/PORTFOLIO-CASE.md`.)*

### Principais fluxos (visão humana)

1. Entrar na plataforma → **cadastro/login** (demo mock).
2. **Shipper** publica ou consulta **cargas**; **carrier** explora mercado e envolve-se em **negociações**.
3. Estados da carga e da negociação evoluem (contrato simulado, reserva, etc.) conforme regras mock.
4. **Rastreio** mostra uma linha do tempo de eventos operacionais (modelo pensado para virar auditoria real mais tarde).
5. **Impacto** e **governo** agregam narrativa e números derivados do mock para visão institucional.
6. **Admin** pode usar **mock-mode** para resetar cenários de dados (somente com papel correto).

### Estado atual em três camadas

| Camada | Significado no HydroRivers |
|--------|----------------------------|
| **Implementado** | Existe no código e você pode rodar localmente: Next.js App Router, páginas por locale, APIs em `src/app/api`, persistência mock em `.mock-data`, auth mock, middleware em rotas privadas, testes Vitest + Playwright conforme scripts do `package.json`. |
| **Em evolução** | Já há decisões ou partial implementations documentadas — exemplo: **repository boundary** para isolar persistência (`docs/REPOSITORY-BOUNDARY.md` — *piloto em `GET /api/cargas`*); endurecimento de segurança nas APIs (`docs/API-SECURITY-AUDIT.md`). Nem tudo que está “decidido” já está refletido linha a linha no handler (vide §3 sobre `mock-mode`). |
| **Futuro / roadmap** | Banco real, autorização forte nas **leituras**, módulo de documentos com upload, KPIs executivos estáveis, IA assistiva **depois** de segurança e testes (`docs/DATABASE-PLANNING.md`, `docs/DOCUMENTS-MODULE.md`, `docs/EXECUTIVE-DASHBOARD.md`, `docs/AI-ROADMAP.md`). |

---

## 2. Domínios do produto

Pense em **domínio** como um “assunto” que o código agrupa: cada um tem telas, tipos e às vezes APIs próprias.

### Auth

**O que é:** fluxo de **identidade mock**: login, logout, cadastro limitado a papéis públicos, sessão por cookie (`hydrorivers_session`). Senhas tratadas no servidor com hashing descrito no `README.md`; respostas não devem vazar hash.

**Por que importa:** quase toda regra sensível depende de “quem é o usuário”.

### Usuários

**O que é:** modelo de usuário com **role** (`shipper`, `carrier`, `admin`), dados de perfil e flag **`approved`** — determinante para algumas mutações (ex.: carrier novo não publica carga até aprovado).

### Cargas

**O que é:** demandas no marketplace (origem, destino, tipo de produto, status da carga, documentação sugerida, risco operacional narrativo no mock).

**Termo importante:** **`ownerId`** — na decisão de produto, é quem “publicou” a carga; hoje o handler pode não preencher em todos os caminhos — veja §3 e `docs/SECURITY-PRODUCT-DECISIONS.md`.

### Embarcações

**O que é:** frota disponível ou em uso (capacidade, rota, status simplificado). Liga-se às negociações quando uma proposta usa uma embarcação.

### Negociações

**O que é:** “deal” entre partes (`shipperId`, `carrierId`, valores, estágio, status). Mutações como **PATCH** exigem que o usuário seja **participante** — vide auditoria de API.

### Rastreio

**O que é:** sequência de **eventos** com status visual (`done` / `current` / `pending`) e, quando presente, **`kind`** operacional (`OperationalTrackingEventKind`) para timeline auditável — ver `docs/TRACKING-TIMELINE.md`.

### Impacto

**O que é:** camadas de narrativa socioambiental e páginas dedicadas; números costumam derivar de campos das cargas (ex.: pegada narrativa) — tratar como **demonstrativo** até haver série oficial.

### Governo / operação

**O que é:** visão institucional (`/[locale]/governo`), útil para políticas públicas e storytelling — não confundir com permissões técnicas automáticas em todas as APIs.

### Admin

**O que é:** área restrita no app + papel **`admin`** na sessão. **Mock-mode** e cenários são ferramentas de **QA/demo**, não substituto de negócio real.

### Mock-mode

**O que é:** `POST /api/mock-mode` (e `GET` para metadados do cenário). **Só administrador autenticado** deve resetar dados — ver §3 sobre decisão de JSON inválido.

### i18n

**O que é:** três locales **`pt-BR`**, **`en`**, **`es`**. Mensagens em `messages/*.json`; script **`npm run check:i18n`** garante paridade de chaves. Conteúdo de demo pode usar helpers de tradução de strings mock (`translateMock`).

### Testes

**O que é:** camadas combinadas — **unitário** (lógica isolada), **integração** (Route Handlers e mocks de módulo), **E2E** (Playwright, fluxos na UI). Política mínima antes de merge está em `AGENTS.md` e §§10–11 deste guia.

---

## 3. Regras de negócio críticas

### Shipper vs carrier vs admin

| Papel | Ideia simples | Ângulo técnico típico |
|-------|----------------|------------------------|
| **Shipper** | Quem tem **demanda** de transporte | Publicação de carga (sujeito a `approved`), lado comprador na negociação |
| **Carrier** | Quem **transporta** | Proposta em negociação (bloqueios se não `approved`), não publica carga pela mesma rota que shipper |
| **Admin** | **Operação da plataforma** | Mock-mode, área admin; **não** é o modelo-alvo para “criar negócio comercial fingindo ser carrier” |

### `approved` por role

- No **cadastro**: **shipper** tende a nascer **aprovado**; **carrier** tende a nascer **não aprovado** — política documentada em `docs/SECURITY-PRODUCT-DECISIONS.md`.
- **Efeito:** usuário não aprovado pode receber **`403`** ao tentar certas mutações (ex.: criar carga).

### `ownerId` em cargas

**Decisão:** toda carga criada pela API autenticada deve carregar **`ownerId = user.id`** do criador — para filtros futuros e consistência com banco planejado.  
**Gap possível:** handler antigo pode não setar — tratar como dívida técnica até PR alinhado (`docs/SECURITY-PRODUCT-DECISIONS.md`).

### Participante em negociação

Para **PATCH** (atualização), o servidor verifica se `user.id` é **`shipperId`** ou **`carrierId`** da negociação — caso contrário **`403`**. Quem não participa não altera o deal.

### Mock-mode somente admin

`POST /api/mock-mode`: **`401`** sem sessão; **`403`** se não for **`role === 'admin'`**.

### Admin não cria negociação no fluxo alvo de produção

**Situação atual:** código pode permitir admin como “não-shipper” em **POST** negociações.  
**Decisão de produto:** em produção, **somente carrier** (com políticas futuras) deveria criar proposta; admin deve usar **mock-mode** para cenários — `docs/SECURITY-PRODUCT-DECISIONS.md`.

### JSON inválido em mock-mode → `400` e **sem** reset

**Decisão documentada:** corpo não JSON ou parse inválido → **`400`** com payload de erro padronizado e **não** chamar reset — `docs/SECURITY-PRODUCT-DECISIONS.md` §4.

**⚠️ Estado atual do código pode divergir:** o handler pode ainda aceitar falha de parse e prosseguir — isso é **bug/regressão em relação à decisão**, não comportamento desejado. Novos PRs devem alinhar código à decisão **e** acrescentar teste de integração.

### Erros HTTP esperados (linguagem comum)

| Código | Quando aparece (typical) |
|--------|---------------------------|
| **400** | JSON inválido, campos faltando, regra de validação no handler (`invalid-payload`) |
| **401** | Sem sessão onde ela é obrigatória |
| **403** | Autenticado mas sem papel ou permissão (`forbidden`, `user-not-approved`, não participante, não admin no mock-mode) |
| **404** | Recurso referenciado não existe (ex.: cargo/embarcação inexistentes na criação de negociação) |
| **409** | Conflito de domínio (ex.: email já cadastrado no registro) |
| **500** | Falha não tratada no servidor — não é “contrato estável”; investigar logs; idealmente handlers passem a retornar erros padronizados onde possível |

Matriz detalhada por rota: **`docs/API-SECURITY-AUDIT.md`**.

---

## 4. Decisões já tomadas

| Decisão | Motivo | Impacto técnico | Impacto em testes | Documento |
|---------|--------|-----------------|-------------------|-----------|
| Shipper nasce `approved`, carrier não | Liberar núcleo do embarcador; moderar carrier antes de fretes | `403` em mutações para não aprovados | Integração em auth/cargas deve cobrir carrier bloqueado | `SECURITY-PRODUCT-DECISIONS.md` |
| Admin não deve criar negociação em prod | Auditoria e separação papéis | Mudança futura em `POST /api/negociacoes` | Novos casos `403` para admin | Idem |
| `ownerId` obrigatório em cargas criadas via API | Ownership e modelo relacional futuro | Ajuste em `POST /api/cargas` + dados mock | Atualizar fixtures e asserts | Idem |
| JSON inválido em mock-mode → `400`, sem reset | Evitar reset acidental/disguised | Guard clause antes de `resetMockScenario` | Teste integração obrigatório ao implementar | Idem |
| GET públicos amplos são risco | Vazamento de dados operacionais | Endurecer escopo futuro | Novos testes `401/403` em listagens | `API-SECURITY-AUDIT.md` |
| Repository boundary para persistência | Trocar mock por DB sem espalhar `readMock` | `GET /api/cargas` via `getRepositories()` (piloto) | Integração `cargas.get` mantém contrato | `REPOSITORY-BOUNDARY.md` |
| IA só depois de segurança/testes | Reduz risco | Nenhuma feature IA obrigatória agora | N/A | `AGENTS.md`, `AI-ROADMAP.md` |

---

## 5. Arquitetura atual

### Stack principal

- **Next.js (App Router):** define rotas em `src/app`, layouts e páginas por `[locale]`.
- **React 19 + TypeScript:** componentes tipados; separação entre Server e Client Components onde necessário.
- **next-intl:** mensagens e roteamento por idioma (`src/core`).
- **Sass Modules:** estilos por componente (`.module.scss`).

### Pastas que você vai usar sempre

| Pasta | Função didática |
|-------|------------------|
| **`src/app`** | Rotas web e **`src/app/api`** = APIs REST do Next (Route Handlers). |
| **`src/features`** | Domínio do produto (auth, marketplace, tracking, governo…): componentes + lógica próxima do negócio. |
| **`src/shared`** | Design system leve, layout, helpers de servidor (`mock-db`, auth), erros de API compartilhados. |
| **`.mock-data`** | JSON gerido em dev — espelho da persistência mock (ver `README.md`). |

### Testes

- **Unitário:** `tests/unit/**` — rápidos, sem subir servidor real.
- **Integração:** `tests/integration/**` — importam handlers e mockam `readMock`/sessão quando preciso.
- **E2E:** Playwright — navegador real; seguir `docs/E2E-PLAYWRIGHT.md` (seletores acessíveis).

---

## 6. Como trabalhar com branches

Política recomendada neste onboarding (alinhar com o líder técnico se o remoto usar outro nome):

1. **`dev`** como branch base de integração contínua do time (ou equivalente acordado).
2. **Uma branch por etapa/tarefa:** nome claro (`feature/cargas-filtro-owner`, `fix/mock-mode-invalid-json`).
3. **Se o nome já existir no remoto:** acrescente sufixo **`v2`**, **`v3`**, etc. (`feature/foo-v2`).
4. **Fluxo sugerido:**
   - `git fetch` / `git pull` em `dev`.
   - `git checkout -b sua-branch` a partir de `dev`.
   - Implementação **pequena** e commits legíveis (Conventional Commits ajuda — ver `docs/` de commit se existir).
   - Rode validações locais (§11).
   - `git push` e abra **PR focado** para `dev`.
   - Após revisão e CI verde, **merge** (estrategy definida pelo time: squash ou merge commit).

Evite branches long-lived gigantes — o projeto valoriza PRs pequenos (`AGENTS.md`).

---

## 7. Como usar agentes e modelos

Esta seção é **orientação de trabalho**, não dependência de código.

| Ferramenta / modelo | Bom para |
|---------------------|----------|
| **Composer / modo rápido** | Explorações curtas, docs, ajustes pequenos já bem especificados. |
| **Codex / modo implementação** | Patches controlados quando você já listou arquivos e critérios de aceite. |
| **GPT‑5.5 (ou modelo forte de raciocínio)** | Planejamento, desenho de API, leitura cruzada de vários docs — sempre com referências de arquivo. |
| **Opus / modelo “pesado”** | Trade-offs sensíveis (segurança, dados pessoais, contratos públicos). |

### Fluxo mental: Ask primeiro, Agent depois

1. **Ask (somente leitura):** “Onde está X? Qual regra vale?” — reduz alucinação e não altera arquivos à toa.
2. **Agent (edição):** só quando você já sabe **domínio**, **arquivos** e **validações**.

### Quando **não** usar IA automática

- Você não leu a decisão de segurança nem a auditoria da rota afetada.
- A mudança pode **alterar contrato HTTP** sem plano de teste.
- O pedido é vago (“melhora tudo”).
- Você está cansado e aceitaria refactor massivo sem revisar diff linha a linha.

---

## 8. Prompts padrão por tipo de mudança

Copie e adapte — sempre inclua **paths**, **regras do AGENTS.md** e **“não inventar features”**.

### Auditoria sem alterar código

```text
Audite [ÁREA] no HydroRivers sem alterar código. Liste rotas/handlers envolvidos, sessão/roles, status HTTP possíveis e riscos. Baseie-se em docs/API-SECURITY-AUDIT.md e código em src/app/api/.... Saída em tabela + recomendações priorizadas.
```

### Documentação

```text
Crie/atualize docs/NOME.md sobre [TEMA]. Não altere código. Use apenas fatos do repositório; marque roadmap como futuro. Tom didático para novo dev. Referências a README.md e docs/... existentes.
```

### Implementação pequena

```text
Implemente [OBJETIVO MÍNIMO] em [DOMÍNIO]. Não adicione dependências. Preserve i18n e mocks. Liste arquivos afetados antes de editar. Depois rode npm run lint, typecheck, check:i18n, test.
```

### Criação de teste

```text
Adicione teste [unitário|integração] para [COMPORTAMENTO] em [ARQUIVO_DE_TESTE]. Mock apenas fronteiras necessárias. Não loosen assertions existentes. Alinhar com docs/API-SECURITY-AUDIT.md se for API.
```

### Refactor seguro

```text
Refatore internamente [MÓDULO] para [META]. Sem mudança de comportamento observável nas APIs públicas / props públicos. Diff pequeno. Se comportamento mudar, pare e liste breaking changes + testes necessários.
```

### Revisão de segurança

```text
Revise PR focado em segurança: auth, escopo por role, leakage em GET, cookies, mock-mode. Compare com docs/API-SECURITY-AUDIT.md e SECURITY-PRODUCT-DECISIONS.md. Liste findings por severidade.
```

### Atualização de i18n

```text
Adicione chaves em pt-BR/en/es para [FEATURE]. Rode check:i18n após edição. Não hardcodar strings visíveis nas páginas tocadas.
```

### Criação de roadmap

```text
Proponha roadmap incremental para [ÉPICO]. Separe implementado vs futuro. Referências a DATABASE-PLANNING.md / DOCUMENTS-MODULE.md conforme aplicável. Sem código.
```

### Revisão antes de commit

```text
Revise o diff atual: escopo excessivo? i18n quebrado? testes faltando para mudança de API? Alinhamento com AGENTS.md? Liste checklist §§10–11 deste guia.
```

---

## 9. Por que usar prompts padronizados

- **Reduz escopo aberto:** IA tende a “fazer demais” sem limites explícitos.
- **Evita reescrita desnecessária:** você pede incrementalidade explícita.
- **Preserva regras de negócio:** ao citar docs de segurança e domínio no prompt.
- **Protege contra regressão:** ao exigir testes e comandos de validação na mesma tarefa.
- **Melhora rastreabilidade:** prompts salvos em tickets/PR descrevem intenção para humanos posteriores.

---

## 10. Checklist antes de qualquer mudança

- [ ] Ler **README.md** + doc específico do domínio (`TRACKING-TIMELINE`, `DOCUMENTS-MODULE`, etc.).
- [ ] Identificar **domínio** e **superfície** (API vs UI vs mock apenas).
- [ ] Listar **arquivos afetados** antes de codar (ou pedir ao agente que liste primeiro).
- [ ] Confirmar **regras de negócio** em `SECURITY-PRODUCT-DECISIONS.md` / `API-SECURITY-AUDIT.md` quando tocar sessão ou dados.
- [ ] Criar **branch** a partir da base acordada (§6).
- [ ] Preferir implementação **pequena** e PR único focado.
- [ ] Ao terminar edições relevantes: rodar validações do §11.

---

## 11. Checklist antes de commit

Execute na ordem (ajuste se o CI do time for diferente):

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run test
```

Quando a mudança afeta **fluxo de usuário**, **telas críticas** ou **permissões na UI**, também:

```bash
npm run test:e2e
```

*(Política detalhada em `AGENTS.md` e `docs/E2E-PLAYWRIGHT.md`.)*

---

## 12. O que nunca fazer

- **Não** “re-arquitetar tudo” sem plano escrito e PRs fatiados.
- **Não** remover ou ignorar **`.mock-data` / mocks** sem estratégia de **boundary + persistência real** (`docs/REPOSITORY-BOUNDARY.md`, `docs/DATABASE-PLANNING.md`).
- **Não** colocar **IA em produto** antes de segurança, validação e testes estáveis (`AGENTS.md`, `docs/AI-ROADMAP.md`).
- **Não** mudar **contratos de API** (formato JSON, status) **sem** atualizar ou criar **testes de integração**.
- **Não** misturar várias features grandes no **mesmo PR** — aumenta risco e revisão superficial.
- **Não** usar **classes CSS como seletor E2E** quando existir **`getByRole` / `getByLabel`** (`docs/E2E-PLAYWRIGHT.md`).
- **Não** ignorar **i18n** — strings novas nas três línguas ou justificativa explícita técnica.

---

## 13. Como decidir se precisa de teste

| Situação | Tipo recomendado |
|----------|-------------------|
| Nova **regra de negócio** ou mudança em **handler** | **Integração** em `tests/integration/api/...` |
| Fluxo que o **usuário vê** (login, navegação bloqueada, formulário) | **E2E** Playwright |
| Função pura pequena (helper de domínio, parsing) | **Unitário** |
| **Segurança/autorização** (401/403/404 em API) | **Integração obrigatória** antes de confiar na UI |

---

## 14. Mapa de documentos

| Documento | Quando ler |
|-----------|------------|
| `README.md` | Primeiro dia — rodar projeto e rotas |
| `AGENTS.md` | Política de PR e comandos obrigatórios |
| `docs/API-SECURITY-AUDIT.md` | Antes de mexer em **qualquer** rota em `src/app/api` |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Auth, roles, ownerId, mock-mode, admin × negociação |
| `docs/E2E-PLAYWRIGHT.md` | Antes de criar/alterar testes E2E |
| `docs/REPOSITORY-BOUNDARY.md` | Antes de mudar persistência ou listagens |
| `docs/DATABASE-PLANNING.md` | Planejamento de banco real |
| `docs/DOCUMENTS-MODULE.md` | Futuro módulo de documentos |
| `docs/TRACKING-TIMELINE.md` | Eventos de rastreio e `kind` |
| `docs/EXECUTIVE-DASHBOARD.md` | KPIs executivos planejados |
| `docs/PORTFOLIO-CASE.md` | Narrativa externa semântica do projeto |
| `docs/AI-ROADMAP.md` | IA assistiva futura e limites |
| `docs/AI-CARGO-STATUS-ASSISTANT.md` | Assistente de status de carga (mock determinístico, `POST /api/ai/cargo-status`) |

---

## 15. Fluxo recomendado para novo dev no primeiro dia

1. **Instalar dependências:** `npm install`.
2. **Subir o app:** `npm run dev` — abrir `http://localhost:3000/pt-BR` (ver `README.md`).
3. **Rodar testes:** `npm run test` — familiariza com tempo de suite local.
4. **Ler docs nesta ordem sugerida:** `README.md` → `AGENTS.md` → `docs/API-SECURITY-AUDIT.md` (pelo menos resumo) → domínio que você vai tocar (§14).
5. **Explorar código:** `src/app/[locale]/layout` + uma feature (`src/features/marketplace`) + uma API (`src/app/api/cargas/route.ts`).
6. **Primeira mudança segura:** typo em doc, mensagem i18n pequena com `check:i18n`, ou teste cobrindo comportamento já documentado — sempre em branch própria e PR pequeno.

---

## 16. Próximas etapas do roadmap (ainda pendentes ou parciais)

Consolidado a partir dos docs — **não** assume que está no código até você verificar:

- **Segurança de leitura:** restringir `GET` amplos de cargas, negociações, embarcações e rastreio conforme sessão e escopo (`API-SECURITY-AUDIT.md`).
- **Alinhar handlers às decisões:** `ownerId` em `POST /api/cargas`; bloquear admin em `POST /api/negociacoes`; **`400` sem reset** em `mock-mode` com JSON inválido (`SECURITY-PRODUCT-DECISIONS.md`).
- **Repository boundary:** estender repositórios e migrar mais handlers (`REPOSITORY-BOUNDARY.md`).
- **Persistência real:** Postgres (ou equivalente), migrations (`DATABASE-PLANNING.md`).
- **Timeline / rastreio:** filtros autorizados, escrita auditável de eventos (`TRACKING-TIMELINE.md`).
- **Documentos:** upload, storage, permissões (`DOCUMENTS-MODULE.md`).
- **Dashboard executivo:** KPIs por persona (`EXECUTIVE-DASHBOARD.md`).
- **IA assistiva:** somente após baseline de segurança/testes (`AI-ROADMAP.md`, `AGENTS-ROADMAP.md`).

---

*Boa contribuição no HydroRivers: quando em dúvida, pare, leia a auditoria ou as decisões de produto, e prefira um PR pequeno com testes do tipo certo (§13) do que uma refatoração heróica.*
