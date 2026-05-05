# HydroRivers — Case de portfólio (nível sênior)

Material para **portfólio**, **GitHub** e **LinkedIn**. O texto separa com clareza **implementado**, **em evolução** e **visão futura**, conforme `README.md`, `docs/DEVELOPER-AI-ONBOARDING.md`, auditorias de segurança, planejamentos em `docs/` e políticas do repositório (`AGENTS.md`). **Não atribui como entregue o que está apenas especificado em documentação.**

**Referência de versão:** `package.json` — pacote interno `hydrorivers-v056-template`, **0.8.6**; Next.js **16.2.4**, React **19**.

---

### Como ler este documento

| Marco | Significado |
|-------|-------------|
| **Implementado** | Comportamento ou artefato **presente no código** executável/repositório (rotas, handlers, mocks, testes, scripts). |
| **Em evolução** | **Parcialmente** no código **ou** decisão/documentação já guiando trabalho incremental (ex.: boundary de repositório piloto). |
| **Visão futura** | Planejado em `docs/` — **sem** compromisso de já estar em produção neste MVP. |

---

## 1. Pitch de 30 segundos

O **HydroRivers** é um **MVP web** para **gestão e visibilidade de operações hidroviárias e cabotagem**, reunindo **marketplace** (cargas, frota, negociações), **rastreio por timeline de eventos**, camadas de **impacto** e uma **superfície institucional** voltada a contexto amazônico e baixa conectividade. Está implementado em **Next.js (App Router)**, **React 19** e **TypeScript**, com **next-intl** em três idiomas, **persistência mock server-side** em JSON e **auth mock** com **middleware** em rotas privadas. O repositório inclui **testes automatizados** (Vitest unitário + integração de APIs, Playwright para E2E inicial), **documentação de segurança das APIs**, **decisões explícitas de produto** e **roadmaps** para banco real, documentos, dashboard executivo e **IA apenas assistiva** — esta última **fora do produto em runtime**, até segurança e testes estarem consolidados, conforme política do projeto.

---

## 2. Problema real

Operações em **hidrovias e cabotagem** — sobretudo com **pequenos produtores, cooperativas e corredores com conectividade irregular** — fragmentam:

- **demanda de transporte**, **oferta de frota**, **negociação**, **acompanhamento físico** e **compliance documental** em canais díspares;
- há **assimetria de informação** e custo de coordenação entre embarcadores e transportadores;
- instituições e políticas públicas precisam de **visibilidade agregada** (impacto regional, gargalos) sem confundir **narrativa** com **dados auditáveis**.

O projeto endereça isso como **uma superfície única demonstrável**: fluxos transacionais e operacionais **simulados** com dados mock — útil para **validação de produto e engenharia**, não equivalente hoje a um TMS/ERP enterprise em produção (`docs/DEVELOPER-AI-ONBOARDING.md`, `README.md`).

---

## 3. Público-alvo

| Audiência | Relação com o produto |
|-----------|------------------------|
| **Embarcadores / cooperativas** | Publicam e acompanham **cargas** e **negociações** no fluxo shipper (**implementado** em nível MVP mock). |
| **Transportadores / armadores** | Participam do marketplace e negociações como carrier; política de **`approved`** diferenciada em cadastro (**implementado** + decisão documentada). |
| **Operações / compliance** | Persona transversal — checklist e exceções **parcialmente** refletidos em dados/telas; **módulo documental completo não implementado** (`docs/DOCUMENTS-MODULE.md`). |
| **Administração da plataforma** | Área **admin** com guarda por papel; cenários via **`POST /api/mock-mode`** (**implementado**, restrito a admin). |
| **Governo / instituições** | Audiência da rota **`/[locale]/governo`** — **implementado** como página dedicada; persona **institucional** nem sempre espelha um quarto `role` técnico idêntico aos demais em todas as APIs (`docs/DEVELOPER-AI-ONBOARDING.md`). |

---

## 4. Solução proposta

**Implementado:** plataforma **Next.js** com rotas localizadas, domínios em **`src/features`** (auth, marketplace, rastreio, impacto, governo, dashboard, admin), **Route Handlers** para APIs sobre **`.mock-data/*.json`**, **sessão mock** por cookie e **UI responsiva** (Sass Modules, tema claro/escuro próprio).

**Em evolução:** isolamento gradual do acesso a dados (**repository boundary** piloto em `GET /api/cargas`) (`docs/REPOSITORY-BOUNDARY.md`); endurecimento pontual de mutações e políticas registradas em **`docs/SECURITY-PRODUCT-DECISIONS.md`**.

**Visão futura:** persistência relacional, autorização nas **leituras**, módulo de documentos com storage seguro, agregações de **dashboard executivo** por persona (**especificação** em `docs/EXECUTIVE-DASHBOARD.md` — **produto nomeado “dashboard executivo” completo não está implementado end-to-end**), e **IA assistiva** apenas após barreira de segurança/testes (`docs/AI-ROADMAP.md`, `AGENTS.md`).

---

## 5. Funcionalidades implementadas

*Lista estrita ao que o repositório efetivamente entrega hoje.*

| Área | Entrega |
|------|---------|
| **Framework** | Next.js **16.2.4** (App Router), React **19**, TypeScript, ESLint (`README.md`, `package.json`). |
| **Arquitetura de mutação (React 19)** | Publicação de carga via **Server Action** (`publishCargoAction`) com **`useActionState`** no formulário e commit central em **`commitPublishCargo`** (persistência + revalidation). |
| **Estilo / UI** | Sass Modules; tema claro/escuro sem `next-themes`; ícones SVG internos + **lucide-react** em formulários (`README.md`). |
| **i18n** | Locales **`pt-BR`**, **`en`**, **`es`**; script **`npm run check:i18n`** para paridade de chaves. |
| **Contratos transversais** | Contratos de **routing** (`app-routes`, `api-routes`, `route-search-params`), **cache/revalidation** por tags/paths e constants de domínio/HTTP/cookies/env usados como base de consistência entre features. |
| **Persistência mock** | Leitura/escrita server-side em **`.mock-data/*.json`** (usuários, cargas, embarcações, negociações, eventos de rastreio); reset documentado (`README.md`). |
| **Auth mock** | Login (fluxo com **OTP opcional** conforme handlers auditados), cadastro público **shipper/carrier**, logout, perfil; senhas com **PBKDF2**; cookie **`hydrorivers_session`**; respostas sem **`passwordHash`** ao cliente (`README.md`, `docs/API-SECURITY-AUDIT.md`). |
| **Rotas privadas** | **Middleware** protege conjunto documentado no README (`/dashboard`, `/cargas/nova`, `/perfil`, `/negociacoes`, `/rastreio`, `/admin`, etc.). |
| **Marketplace** | Páginas e fluxos de **cargas**, **embarcações**, **negociações**; APIs **`/api/cargas`**, **`/api/embarcacoes`**, **`/api/negociacoes`**; rota **`/minhas-cargas`** (lista filtrada por dono/shipper no mock); publicação de carga com **`ownerId`/`shipperId`** via **`commitPublishCargo`** (POST API + Server Action + **`useActionState`** no formulário). |
| **Proposta no detalhe da carga (demo)** | Mensagens i18n e exibição do formulário conforme **papel** e **`approved`** (`cargo-proposal-visibility` / `CargoDetail`) — não substitui regras de API. |
| **Toasts e A11y** | Camada de toasts humanizados por **status HTTP + contexto** (`cargo.publish`, `cargo.proposal`, `auth.login`, `generic`) e fechamento com `aria-label` internacionalizado. |
| **Rastreio** | Página **`/rastreio`** com timeline; modelo **`OperationalTrackingEventKind`**, inferência quando `kind` ausente, compatibilidade com dados legados documentada (`docs/TRACKING-TIMELINE.md`); **`GET /api/rastreio`**. |
| **Impacto / governo / admin** | **`/impacto`**, **`/impacto/[id]`**, **`/[locale]/governo`**, **`/admin`** (`README.md`, estrutura do app). |
| **Cenários / QA** | **`POST /api/mock-mode`** com restrição **admin** (`docs/API-SECURITY-AUDIT.md`). |
| **Observabilidade produto** | **Vercel Analytics** (`README.md`). |
| **Qualidade** | Scripts **`lint`**, **`typecheck`**, **`check:i18n`**, **`test`** (Vitest); **`test:e2e`** (Playwright) (`package.json`, `docs/E2E-PLAYWRIGHT.md`). |

**Explicitamente não implementado como produto final:** banco transacional enterprise, uploads de documentos com pipeline seguro (vide **`docs/DOCUMENTS-MODULE.md`**), IA generativa em runtime, cobertura completa de **autorização nas leituras GET** de dados operacionais — gap nomeado na **`docs/API-SECURITY-AUDIT.md`**.

---

## 6. Funcionalidades em evolução

| Item | Estado |
|------|--------|
| **Repository boundary** | **Piloto:** `GET /api/cargas` via `getRepositories()`; `POST /api/cargas` delega a **`commitPublishCargo`** (persistência compartilhada com a Server Action, ainda fora do objeto `CargoesRepository`) (`docs/REPOSITORY-BOUNDARY.md`). |
| **Ownership / escopo de dados** | **Escrita:** `ownerId`/`shipperId` definidos em **`commitPublishCargo`**. **Leitura:** GETs amplos sem sessão continuam sendo o principal gap para produção real; seeds legados podem não ter ownership preenchido (`docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`). |
| **Contratos em call sites** | Limpeza parcial/final de rotas hardcoded para contratos compartilhados já aplicada em pontos centrais de navegação e QA; manutenção incremental segue em PRs pequenos. |
| **Segurança de leitura** | Auditoria lista **GETs amplos sem sessão** como **alto risco** para cenário real; recomendações escritas, **migração incremental esperada** (`docs/API-SECURITY-AUDIT.md`). |
| **Timeline auditável** | Tipos de evento e inferência **implementados**; filtros por participante na API e escrita auditável **planejados** (`docs/TRACKING-TIMELINE.md`). |
| **Dashboard executivo** | **Cards/overview existem** como tijolos de UI; **KPIs por persona + API agregadora escopada** são **especificação** (`docs/EXECUTIVE-DASHBOARD.md`). |
| **E2E** | **Inicial** — expandir quando fluxos críticos estabilizarem (`docs/E2E-PLAYWRIGHT.md`). |

---

## 7. Visão futura

Síntese alinhada a **`docs/DATABASE-PLANNING.md`**, **`docs/DOCUMENTS-MODULE.md`**, **`docs/EXECUTIVE-DASHBOARD.md`**, **`docs/AI-ROADMAP.md`**:

- **Persistência:** Postgres (ou equivalente), migrations, timestamps normalizados para KPIs temporais e auditoria.
- **Segurança:** autorização por **owner/participante/papel** também nas **leituras**; rate limiting e políticas de sessão/Cookies conforme produto real.
- **Documentos:** entidade `Document`, storage privado, visibilidade por vínculo de negócio — **roadmap**, não MVP atual.
- **Inteligência operacional:** dashboard executivo com definições formais de métricas e disclaimers onde dados forem demonstrativos.
- **IA:** apenas **assistiva**, servidor único, fallback determinístico, auditoria por invocação — **sem decisões automáticas sobre estado crítico** (`docs/AI-ROADMAP.md`).

---

## 8. Arquitetura técnica

```txt
src/app              App Router: páginas, layouts, Route Handlers (/api/*)
src/core             i18n e roteamento por locale
src/features         Domínios do produto (auth, marketplace, tracking, governo, …)
src/shared           UI compartilhada, layout, servidor (mock-db, auth, repositórios piloto)
messages             Traduções pt-BR, en, es
.mock-data           Persistência JSON local (desenvolvimento / demo)
docs/                Planejamento: segurança, dados, timeline, dashboard, IA, decisões de produto
```

- **Renderização:** Server Components onde aplicável; Client Components para interatividade (ex.: timeline de rastreio).
- **Dados:** concentrados hoje em utilitários de mock; direção documentada é **substituir adapter mantendo contratos HTTP/domínio** (`docs/DATABASE-PLANNING.md`, `docs/REPOSITORY-BOUNDARY.md`).

---

## 9. Decisões técnicas importantes

| Decisão | Motivação |
|---------|-----------|
| **App Router + Route Handlers** | Colocalização de UI e APIs; bom encaixe com sessão server-side e i18n. |
| **next-intl** | Produto regional com ambição multi-idioma desde o MVP. |
| **Sass Modules** | Estilos encapsulados; evolução incremental de design system. |
| **Mock em arquivo (`server-only`)** | Velocidade de iteração e demo sem infraestrutura paga; limites conscientemente documentados. |
| **Cookie de sessão mock** | Adequado ao estágio atual; substituível por modelo de sessão/JWT/OAuth **futuro**. |
| **Organização feature-based** | Domínios de negócio separados sem prematurely distribuir serviços. |
| **Vitest + Playwright** | Pirâmide: regras/API rápidas na base; E2E para fluxos que o usuário percorre (`docs/E2E-PLAYWRIGHT.md`). |
| **Documentação de segurança antes do “polimento final”** | Auditoria estática das rotas como artefato de engenharia — reduz débito de decisões implícitas (`docs/API-SECURITY-AUDIT.md`). |

---

## 10. Modelagem de domínio

Conceitos principais **implementados** nos tipos e mocks (nomes podem variar em camelCase na API):

| Entidade | Papel |
|----------|--------|
| **User** | `role`: shipper \| carrier \| admin; **`approved`** com política diferenciada no cadastro (`docs/SECURITY-PRODUCT-DECISIONS.md`). |
| **Cargo** | Demanda no marketplace: origem, destino, tipo, status, metadados narrativos (impacto, risco, documentação sugerida). |
| **Vessel** | Frota: capacidade, status operacional simplificado, vínculo típico a transportador. |
| **Negotiation** | Deal entre partes com estágio/status; relaciona carga e embarcação conforme modelo atual. |
| **TrackingEvent** | Marcos operacionais com `kind` opcional (**nine kinds** canônicos — ver `docs/TRACKING-TIMELINE.md`), texto demo traduzível, timestamps ISO opcionais para auditoria futura. |

**Visão futura (schema):** tabelas `cargoes`, `vessels`, `negotiations`, `tracking_events`, usuários e **`documents`** — **`docs/DATABASE-PLANNING.md`**.

---

## 11. Segurança e autorização

### Implementado (com maturidade MVP)

- Middleware em rotas privadas do aplicativo.
- Sessão mock; política de não expor hash de senha ao cliente.
- Endurecimento documentado em **mutações** exemplares: **`POST /api/cargas`** (carrier não publica; usuário não aprovado bloqueado; resposta com **`ownerId`/`shipperId`** via `commitPublishCargo`), **`PATCH /api/negociacoes`** (participante), **`POST /api/mock-mode`** (admin).
- OTP condicional para demo/E2E quando **`HYDRORIVERS_EXPOSE_OTP_CODE=true`** (`docs/API-SECURITY-AUDIT.md`).

### Em evolução / gap transparente

- **GET sem sessão** em listagens de cargas, negociações, embarcações e rastreio — inadequado como modelo de produção para dados sensíveis; recomendações na auditoria.
- Pontos **«a confirmar»**: rate limiting, máquina de estados formal de negociação, endurecimento de parse JSON em **`mock-mode`**.

### Visão futura

- Queries e APIs **escopadas** por sessão; decisões de LGPD/GDPR quando backend real; separação clara entre **métricas demo** e **métricas operacionais**.

---

## 12. Testes e qualidade

| Camada | Implementação |
|--------|----------------|
| **Estático / tipos** | `npm run lint`, `npm run typecheck` |
| **i18n** | `npm run check:i18n` |
| **Unitário** | Vitest — helpers de domínio (ex.: inferência de rastreio), utilitários |
| **Integração** | Vitest — Route Handlers sob `tests/integration/api/*` |
| **E2E** | Playwright — **`npm run test:e2e`**; criar/atualizar conforme matriz em `docs/E2E-PLAYWRIGHT.md` |

**Política:** mudanças em fluxos sensíveis devem acompanhar validações pertinentes (`AGENTS.md`).  
**Em evolução:** ampliar integração quando GETs forem escopados e novos códigos de erro estabilizarem.

---

## 13. Internacionalização

- **Locales:** `pt-BR`, `en`, `es`.
- **Mensagens:** `messages/*.json`; verificação automatizada de chaves (`npm run check:i18n`).
- **Conteúdo mock:** padrões tipo **`translateMock`** onde o demo mantém texto traduzível.
- **URLs:** prefixo **`/[locale]/...`** (`src/core`).

---

## 14. Onboarding e uso de IA no desenvolvimento

**Onboarding de desenvolvedores**

- Guia principal: **`docs/DEVELOPER-AI-ONBOARDING.md`** — produto, domínios, estado implementado vs roadmap, uso seguro de agentes.
- **Verificação automatizada de progresso:** **`npm run check:onboarding`** valida presença de documentos-chave e scripts esperados; saída binária (**OK/FAIL**) e mensagem **Onboarding ready ✅ / incomplete ❌** (`docs/ONBOARDING-PROGRESS-CHECK.md`). Trata-se de um **gate leve tipo checklist**, não um produto de gamificação completo no sentido de níveis ou recompensas in-app — mas reduz atrito de primeiro dia.

**IA no desenvolvimento**

- Uso de agentes e IA auxiliar é **orientado pela documentação** e pelas regras do repositório — não há produto de IA embutido na aplicação (**implementado:** política explícita **não adicionar IA em produto antes de segurança, validação e testes**, `AGENTS.md`).
- **`docs/AI-ROADMAP.md`** disciplina **IA futura no produto** (assistiva), não obrigatoriedade de ferramentas no fluxo do desenvolvedor.

---

## 15. Roadmap enterprise

Ordem orientadora (ajustável por squad), sintetizada de **`docs/DATABASE-PLANNING.md`**, **`docs/API-SECURITY-AUDIT.md`**, **`docs/EXECUTIVE-DASHBOARD.md`**, **`docs/DOCUMENTS-MODULE.md`**:

| Fase | Foco |
|------|------|
| **Fundamentos de dados e segurança** | Escopo nas leituras; consistência `ownerId`/participação; timestamps para métricas reais. |
| **Persistência** | Postgres + migrations; repositórios como porta única atrás das APIs. |
| **Produto dados** | Dashboard executivo conforme especificação; timeline com filtros e escrita auditável. |
| **Compliance documental** | Módulo de documentos com storage e políticas de visibilidade. |
| **Superfícies institucionais** | Manter paridade numérica entre governo/impacto e agregações autorizadas. |
| **IA assistiva** | Depois das barreiras de segurança e contratos de dados (`docs/AI-ROADMAP.md`). |

---

## 16. Visão de IA aplicada

**Implementado em produto:** **nenhuma** capacidade de modelo generativo em runtime — por política do repositório.

**Planejado (`docs/AI-ROADMAP.md`):** IA **assistiva** — não decisória; dados estruturados e autorizados; **fallback obrigatório** sem modelo; **auditoria** por chamada; execução **server-side** única (sem expor chaves no browser). Casos de uso priorizados incluem explicação de status, resumo de negociação, apoio a checklist e suporte contextual — sempre **posterior** a validação humana para mudanças de estado.

**Visão futura:** IA como **acelerador de leitura e consistência**, nunca substituto de decisão regulatória ou contratual sem trilha humana explícita.

Roadmap complementar de agentes de produto: **`docs/AGENTS-ROADMAP.md`**.

---

## 17. Aprendizados técnicos

- **Mock server-side bem documentado** viabiliza demo e contratos de API **desde que os limites sejam comunicados** (ex.: GETs amplos não são modelo de produção).
- **Auditar segurança cedo em Markdown** (`API-SECURITY-AUDIT.md`) separa **risco técnico** de **decisão de produto** (`SECURITY-PRODUCT-DECISIONS.md`) — sinal de maturidade em engenharia aplicada a produto.
- **i18n com verificação automatizada** reduz regressões em produtos LATAM-first com alcance global.
- **Feature folders** escalam melhor que um único diretório misto quando domínios divergem (carga × negociação × rastreio × institucional).
- **Roadmaps como “planejamento apenas”** evitam que stakeholders confundam especificação com código — útil para comunicação com stakeholders e em processos seletivos (“sei diferenciar discovery de delivery”).

---

## 18. Impacto de produto

- **Para usuários-alvo (demo):** redução cognitiva ao reunir **oferta**, **frota**, **negociação** e **rastreio** num fluxo navegável — mesmo com dados não empresariais.
- **Para instituições (demo):** página dedicada (**governo**) como **protótipo narrativo** de visibilidade regional — números devem ser tratados como **ilustrativos** até série oficial e metodologia publicadas (`docs/EXECUTIVE-DASHBOARD.md`, campos tipo impacto nas cargas).
- **Para o time:** base de código e documentação permitem **evolução incremental** rumo a enterprise sem “big bang” desde que contracts HTTP e domínio permaneçam estáveis.

---

## 19. Descrição curta para GitHub

**HydroRivers** — MVP Next.js 16 (App Router) + React 19 + TypeScript para operações **hidroviárias e cabotagem**: cargas, embarcações, negociações, rastreio por eventos, impacto e visão institucional (`/governo`). **next-intl** (`pt-BR`, `en`, `es`), Sass Modules, persistência **mock server-side** em `.mock-data`, **auth mock**, middleware em rotas privadas. Qualidade: **ESLint**, **TypeScript**, **Vitest** (unit + integração de APIs), **Playwright** (E2E inicial). Documentação interna sobre segurança de APIs, decisões de produto, dados futuros, timeline operacional, dashboard executivo (especificação) e IA assistiva (planejamento). *Demonstrativo — não substitui stack enterprise completa.*

---

## 20. Descrição para LinkedIn

Conduzi/evoluí **HydroRivers**, MVP web focado em **inteligência operacional e gestão de fluxos hidroviários**: marketplace de **cargas**, **frota** e **negociações**, **timeline de rastreio** com eventos tipados, camadas de **impacto** e **superfície para audiência institucional**. Stack **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **next-intl** em três idiomas e **Sass Modules**. Backend demonstrativo com **persistência mock em JSON**, **sessão mock** e **middleware** em rotas privadas; APIs cobertas por **testes de integração** e base complementada por **E2E inicial (Playwright)**. O trabalho inclui **documentação explícita de segurança** das rotas, **decisões de produto/authorization** e **roadmaps** para persistência real, documentos, KPIs executivos e **IA apenas assistiva** após endurecimento — postura disciplinada de **product engineering** e evolução incremental.

---

## 21. Frase final do case

**O HydroRivers é um MVP bem instrumentado — código, testes e documentação — para um problema logístico difícil; o mérito sênior está em nomear limites com honestidade, separar demo de produção e desenhar o caminho enterprise antes de vendê-lo como entregue.**

---

## Referências no repositório

| Documento | Uso |
|-----------|-----|
| `README.md` | Stack, rotas, persistência mock, notas de versão |
| `AGENTS.md` | Política de testes e IA |
| `docs/DEVELOPER-AI-ONBOARDING.md` | Produto, camadas implementadas vs roadmap |
| `docs/API-SECURITY-AUDIT.md` | Matriz de rotas e riscos |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Decisões shipper/carrier/admin/ownerId |
| `docs/DATABASE-PLANNING.md` | Modelo relacional futuro |
| `docs/DOCUMENTS-MODULE.md` | Documentos — especificação |
| `docs/TRACKING-TIMELINE.md` | Eventos operacionais |
| `docs/EXECUTIVE-DASHBOARD.md` | Dashboard executivo — especificação |
| `docs/E2E-PLAYWRIGHT.md` | Estratégia E2E |
| `docs/AI-ROADMAP.md` | IA assistiva futura |
| `docs/REPOSITORY-BOUNDARY.md` | Piloto de repositório |
| `docs/ONBOARDING-PROGRESS-CHECK.md` | Script `check:onboarding` |

*Para métricas pontuais (contagem de testes, cobertura), gere evidências no momento da candidatura (`npm test`, CI). Este arquivo não substitui a leitura do código.*
