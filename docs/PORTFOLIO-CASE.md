# HydroRivers — Case de portfólio (nível sênior)

Documento para **portfólio e redes profissionais**. Todo o texto distingue explicitamente o que está **implementado no repositório**, o que está **em evolução ou apenas planejado em `docs/`** e o que é **visão futura** alinhada ao roadmap documentado — sem atribuir como pronto o que não existe em código.

**Versão de referência:** `package.json` nome interno `hydrorivers-v056-template`, versão **0.8.6**; Next.js **16.2.4**.

---

## 1. Pitch de 30 segundos

O **HydroRivers** é um MVP web de marketplace para frete **hidroviário e cabotagem**, com foco em contexto amazônico: **cargas**, **embarcações**, **negociações**, **rastreio por eventos**, **impacto** e uma camada **governo/institucional**. Está construído em **Next.js (App Router)**, **React 19** e **TypeScript**, com **next-intl** em três idiomas e persistência **mock server-side** em JSON para desenvolvimento e demo. Há **middleware de rotas privadas**, **auth mock** endurecida em parte das APIs, **testes Vitest** (unitário + integração de Route Handlers), **E2E inicial com Playwright** e **auditoria de segurança interna documentada**. O salto enterprise está descrito em roadmap explícito: banco real, autorização ponta a ponta nas leituras, documentos com storage seguro e KPIs executivos — **sem IA em produto até segurança, validação e testes consolidados**, conforme política do repositório.

---

## 2. Problema real

Operações logísticas em **hidrovias e cabotagem** — em especial onde há **pequenos produtores, cooperativas e corredores com conectividade irregular** — tendem a fragmentar:

- **Cotação, documentação, reserva e acompanhamento físico** em canais diferentes.
- **Assimetria de informação** entre quem precisa mover carga e quem tem capacidade flutuante.
- **Confiança e compliance** que exigem **rastreabilidade** sem tornar o fluxo inviável em **baixa conectividade**.
- **Valor público**: políticas e instituições precisam enxergar **impacto regional e gargalos** sem confundir narrativa com dados não auditados.

O projeto posiciona-se como **uma única superfície web demonstrável** para esse problema — hoje em nível **MVP transacional mockado**, não produção enterprise (`docs/ARCHITECTURE.md`).

---

## 3. Público-alvo

| Audiência | Relação com o produto |
|-----------|------------------------|
| **Embarcadores / cooperativas** | Publicam demandas, acompanham negociação e rastreio (fluxo shipper no código mock). |
| **Transportadores / armadores** | Buscam cargas compatíveis e participam de negociações (fluxo carrier; **carrier novo bloqueado para certas mutações** até `approved`, vide decisão documentada). |
| **Operações / compliance** | Persona de produto para checklist e exceções — **parcialmente refletida em telas**, sem produto enterprise completo. |
| **Administração da plataforma** | Área **admin** com guarda server-side; cenários via **`POST /api/mock-mode`** (sessão admin). |
| **Governo / instituições** | Página **`/[locale]/governo`** com indicadores derivados do mock — **audiência institucional**, não equivalente a um `role` técnico isolado como shipper/carrier/admin em todos os pontos. |

---

## 4. Solução proposta

Uma **plataforma Next.js unificada** que:

- **Implementado:** centraliza experiências de **marketplace** (listagens, filtros, fluxos de negociação simulados), **rastreio com timeline de eventos**, **impacto** narrativo/indicadores mock e **painel governo**, com **sessão mock**, **rotas privadas** e **APIs Route Handlers** sobre `.mock-data/*.json`.
- **Em evolução (documentado):** endurecer **GETs públicos amplos** de dados operacionais, timestamps para KPIs temporais, agregações executivas (`docs/EXECUTIVE-DASHBOARD.md`), boundary de repositório e migração de dados (`docs/DATABASE-PLANNING.md`, `docs/REPOSITORY-BOUNDARY.md`).
- **Visão futura (documentada):** auth forte, Postgres/migrations, validação por schema (ex.: Zod citado na arquitetura), storage real de avatar/documentos, mapas e **eventos em tempo real** (`docs/ARCHITECTURE.md`).

---

## 5. Funcionalidades implementadas

*Escopo estrito ao que existe no código e no README/`docs` como já entregue.*

| Área | O que há hoje |
|------|----------------|
| **Stack** | Next.js **16.2.4** App Router, React **19**, TypeScript, Sass Modules, **next-intl**, ESLint 9, Vercel Analytics (`package.json`, `README.md`). |
| **i18n** | Locales **`pt-BR`**, **`en`**, **`es`**; script **`npm run check:i18n`** para paridade de chaves. |
| **Persistência mock** | Leitura/escrita server-side em **`.mock-data/*.json`** via utilitários tipo `readMock`/`writeMock`; seeds em código + merge com arquivo (`README.md`, `mock-db`). |
| **Cenários / QA** | **`POST /api/mock-mode`** para reset com cenários administráveis — **restrição admin** documentada na auditoria de APIs. |
| **Auth mock** | Login (fluxo com **OTP opcional** conforme handlers auditados), cadastro (**shipper/carrier**; admin não via registro público na política descrita no README), logout, perfil; senha com **PBKDF2** no README; cookie **`hydrorivers_session`**; respostas sem **`passwordHash`** ao cliente. |
| **Rotas privadas** | **Middleware** (`middleware.ts`): exige cookie de sessão para **`/dashboard`**, **`/cargas/nova`**, **`/perfil`**, **`/negociacoes`** (e subcaminhos), **`/rastreio`**, **`/admin`** (e subcaminhos); redireciona para login com `next`. |
| **Produto — cargas** | Rotas **`/cargas`**, **`/cargas/nova`**, **`/cargas/[id]`**; API **`/api/cargas`**. |
| **Produto — embarcações** | **`/embarcacoes`**, **`/embarcacoes/[id]`**; API **`/api/embarcacoes`**. |
| **Produto — negociações** | **`/negociacoes`**, **`/negociacoes/[id]`**; API **`/api/negociacoes`** (GET/POST/PATCH conforme projeto). |
| **Rastreio** | Página **`/rastreio`** com timeline; modelo **`OperationalTrackingEventKind`**, inferência quando `kind` ausente, seed com cobertura dos tipos operacionais; API **`GET /api/rastreio`** (`docs/TRACKING-TIMELINE.md`). |
| **Impacto** | **`/impacto`**, **`/impacto/[id]`**. |
| **Governo** | **`/[locale]/governo`** (`src/app/[locale]/governo/page.tsx`). |
| **Admin** | **`/admin`** com guarda server-side por papel (`README.md`). |
| **Dashboard / perfil** | **`/dashboard`**, **`/perfil`**; landing e fluxos login/cadastro conforme README. |
| **UI/UX** | Tema **claro/escuro** próprio; layout responsivo; ícones SVG internos + **lucide-react** em formulários (`README.md`). |
| **Qualidade** | **Vitest**: testes unitários e de integração em **`tests/integration/api/*`**; **Playwright** para E2E inicial (`docs/E2E-PLAYWRIGHT.md`); política em **`AGENTS.md`**. |

**Não listado aqui como implementado:** banco relacional transacional, uploads de documentos com storage seguro, IA em produto, cobertura completa de autorização nas **leituras** GET de marketplace (hoje explicitamente um **gap** na auditoria).

---

## 6. Decisões técnicas

| Decisão | Motivação |
|---------|-----------|
| **App Router + Route Handlers** | APIs colocalizadas ao app; bom encaixe com SSR, i18n e sessão mock server-side. |
| **next-intl** | Produto regional/global desde o MVP; rotas por `[locale]`. |
| **Sass Modules** | Estilos encapsulados por componente; design system incremental. |
| **Mock em arquivo (`server-only`)** | Iteração rápida sem infraestrutura paga; caminho de migração descrito em **`docs/DATABASE-PLANNING.md`**. |
| **Cookie de sessão mock** | Adequado ao estágio atual; substituível por sessão/JWT com backend real. |
| **Organização feature-based** | Domínios (`auth`, marketplace, tracking, governo, dashboard, …) em `src/features` sem premature microservicing. |
| **Vitest + Playwright** | Pirâmide: domínio/API rápidos; E2E para fluxos que o usuário vê (`docs/E2E-PLAYWRIGHT.md`). |

---

## 7. Arquitetura

```txt
src/app              App Router: páginas, layouts, Route Handlers (/api/*)
src/core             i18n e routing por locale
src/features         Domínios do produto (auth, cargas, negociações, tracking, governo, …)
src/shared           UI, layout, providers, servidor compartilhado (mock-db, helpers de API/auth)
messages             Traduções pt-BR, en, es
.mock-data           Persistência JSON local (desenvolvimento / demo)
docs/                Planejamento: segurança, banco, documentos, timeline, dashboard executivo, IA roadmap, decisões de produto
```

- **Renderização:** Server Components onde faz sentido; **Client Components** para interatividade (ex.: timeline de rastreio).
- **Dados:** hoje concentrados em **`readMock`** / escritas nos handlers; evolução planejada para **repositório + banco** sem romper domínio de uma só vez (`docs/DATABASE-PLANNING.md`, `docs/REPOSITORY-BOUNDARY.md`).

---

## 8. Segurança e autorização

### Implementado (com ressalvas honestas)

- **Middleware** em rotas privadas do app.
- **Sessão mock** via cookie; **`toPublicUser`** e política de não expor hash de senha nas respostas (README + auditoria).
- **OTP:** código só exposto se **`HYDRORIVERS_EXPOSE_OTP_CODE=true`** (adequado a demo/E2E, não padrão de produção).
- **Mutações** parcialmente endurecidas: exemplos documentados incluem **`POST /api/cargas`** (carrier não publica; usuário não aprovado bloqueado), **`PATCH /api/negociacoes`** (participante), **`POST /api/mock-mode`** (**admin**).
- **Auditoria estática** das rotas em **`docs/API-SECURITY-AUDIT.md`**.
- **Decisões de produto/registro** registradas em **`docs/SECURITY-PRODUCT-DECISIONS.md`** (ex.: **`approved`** shipper vs carrier; intenção de restringir **`POST /api/negociacoes`** a carrier em produção; **`ownerId`** obrigatório em cargas criadas — decisão documentada; implementação pode estar pendente conforme mesma doc).

### Em evolução / gap documentado (não vendido como “pronto”)

- **GET sem sessão** em **`/api/cargas`**, **`/api/negociacoes`**, **`/api/embarcacoes`**, **`/api/rastreio`** listando coleções completas — **risco alto** para dados operacionais reais; recomendações na auditoria.
- Rate limiting, máquina de estados formal para negociação, CSRF em logout/mock-mode — pontos **«a confirmar»** ou recomendados na auditoria.
- **`GET /api/mock-mode`** sem sessão expõe metadados de cenário — risco menor mas anotado.

### Visão futura

- Autorização por **owner/participante** também nas **leituras**; auth com provider/passkeys; políticas alinhadas a LGPD/GDPR quando houver backend real (`docs/ARCHITECTURE.md`, `docs/API-SECURITY-AUDIT.md`, `docs/DATABASE-PLANNING.md`).

---

## 9. Testes e qualidade

| Camada | Implementação |
|--------|----------------|
| **Lint / tipos** | `npm run lint`, `npm run typecheck` |
| **i18n** | `npm run check:i18n` — paridade de chaves entre locales |
| **Unitário** | Vitest — helpers de domínio, auth mock, inferência de rastreio, etc. |
| **Integração** | Vitest — Route Handlers (`tests/integration/api/*`): auth, cargas, negociações, mock-mode, rastreio, etc. |
| **E2E** | Playwright — fluxos críticos iniciais; quando criar/atualizar, seguir **`docs/E2E-PLAYWRIGHT.md`** |

**Política do repositório:** mudanças em fluxos/APIs devem acompanhar validações pertinentes (`AGENTS.md`).  
**Em evolução:** expandir testes conforme endurecimento da matriz da auditoria (GETs escopados, novos códigos de erro).

---

## 10. Internacionalização

- **Locales:** `pt-BR`, `en`, `es`.
- **Mensagens:** arquivos em `messages/*.json`; verificação automatizada de alinhamento de chaves.
- **Conteúdo mock:** helpers tipo **`translateMock`** para títulos/descrições de demo onde aplicável.
- **Rotas:** prefixo **`/[locale]/...`** (`src/core`).

---

## 11. Roadmap enterprise

Síntese do que já está **documentado** como direção enterprise (ordem pode ser ajustada por squad):

| Fase | Foco |
|------|------|
| **Curto** | Endurecer **leituras** sensíveis nas APIs; definir **`ownerId`/escopo** consistente nas cargas; timestamps normalizados para KPIs reais (`docs/SECURITY-PRODUCT-DECISIONS.md`, `docs/API-SECURITY-AUDIT.md`, `docs/EXECUTIVE-DASHBOARD.md`). |
| **Médio** | **Postgres** (ou equivalente) + migrations; boundary tipo **repository**; schemas de validação (ex.: Zod); auth real (`docs/DATABASE-PLANNING.md`, `docs/REPOSITORY-BOUNDARY.md`, `docs/ARCHITECTURE.md`). |
| **Produto dados** | **Dashboard executivo** por persona (`docs/EXECUTIVE-DASHBOARD.md`); timeline de rastreio com filtros/autorização (`docs/TRACKING-TIMELINE.md`). |
| **Documentos** | Módulo com upload, storage e visibilidade (`docs/DOCUMENTS-MODULE.md`) — **planejado**, não confundir com MVP atual. |
| **Agentes assistivos (opcional)** | Roadmap separado **`docs/AGENTS-ROADMAP.md`** — dependente de governança **`docs/AI-ROADMAP.md`** e de segurança/testes consolidados. |

---

## 12. Visão de IA

### Implementado

- **Nenhuma** capacidade de IA generativa integrada ao produto em runtime — por política explícita do repositório (**não adicionar IA antes de segurança, validação e testes**, `AGENTS.md`).

### Planejado (documentação apenas)

- **`docs/AI-ROADMAP.md`:** IA **assistiva** apenas — não decide sozinha; não altera dados críticos sem confirmação humana; entradas/saídas **estruturadas**; **fallback determinístico** obrigatório; **auditoria** por invocação; API/server-side único (sem keys no browser).
- **`docs/AGENTS-ROADMAP.md`:** agentes de produto exemplares (ex.: sugestão documental, consolidação de risco) com limites claros de dados e ações — todos **posteriors** ao módulo de documentos e regras regulatórias.

### Visão futura

- IA como **acelerador de leitura e consistência** (resumos, checklists sugeridos), nunca como substituto de decisão regulatória ou contrato sem trilha humana.

---

## 13. Aprendizados

- **Mock server-side primeiro** permite demo e testes de API sem infraestrutura — desde que o portfólio **declare honestamente** os limites (GETs amplos, ausência de DB).
- **Documentar segurança antes de “fechar” o MVP** (`API-SECURITY-AUDIT.md`, `SECURITY-PRODUCT-DECISIONS.md`) mostra maturidade sênior: risco nomeado, decisão de produto separada de bug técnico, testes como contrato futuro.
- **i18n e check automatizado desde cedo** reduzem débito em produtos LATAM-first com ambição global.
- **Separation of concerns por feature** escala melhor que um único diretório genérico quando o domínio (carga × negociação × rastreio) diverge.
- **Roadmaps explicitamente “planejamento apenas”** evitam que stakeholders confundam Markdown com código em produção — útil também em entrevistas (“sei separar discovery de delivery”).

---

## 14. Descrição curta para GitHub

**HydroRivers** — MVP Next.js 16 (App Router) + React 19 + TypeScript: marketplace hidroviário/cabotagem com cargas, embarcações, negociações, rastreio por eventos, impacto e página governo. **next-intl** (`pt-BR`, `en`, `es`), Sass Modules, persistência **mock em `.mock-data`**, auth mock com cookie + middleware em rotas privadas. Testes: **Vitest** (unit + integração de APIs), **Playwright** (E2E inicial). Documentação de segurança, decisões de produto e roadmap enterprise/IA em **`docs/`**. *Demonstrativo — não é stack de produção completa.*

---

## 15. Descrição para LinkedIn

**HydroRivers** é um MVP web para operações logísticas em **hidrovias e cabotagem**, pensado para cenários amazônicos e cooperativas: **marketplace de cargas**, **frota**, **negociações**, **rastreio com timeline operacional**, camadas de **impacto** e **visão institucional/governo**. A stack é **Next.js 16 (App Router)**, **React 19** e **TypeScript**, com **next-intl** em três idiomas e **Sass Modules**. Os dados são **mock server-side** em JSON para desenvolvimento e demo; há **middleware de rotas privadas**, **auth mock** com políticas documentadas e APIs cobertas por **testes de integração**. A qualidade inclui **Vitest**, **Playwright** (E2E inicial), ESLint e verificação automática de **paridade i18n**. O repositório mantém **auditoria de segurança das APIs**, **decisões explícitas de produto/segurança** e **roadmaps** para banco real, dashboard executivo, módulo de documentos e **IA apenas assistiva** após endurecimento de segurança e testes — alinhado a uma postura disciplinada de evolução incremental.

---

## Referências rápidas no repositório

| Documento | Uso |
|-----------|-----|
| `README.md` | Rotas, stack, persistência mock, notas de versão |
| `AGENTS.md` | Política de testes e proibição de IA prematura |
| `docs/ARCHITECTURE.md` | Nível MVP e próximo salto |
| `docs/API-SECURITY-AUDIT.md` | Matriz de rotas e riscos |
| `docs/SECURITY-PRODUCT-DECISIONS.md` | Decisões shipper/carrier/admin/ownerId |
| `docs/DATABASE-PLANNING.md` | Persistência futura |
| `docs/TRACKING-TIMELINE.md` | Modelo de eventos de rastreio |
| `docs/EXECUTIVE-DASHBOARD.md` | KPIs por persona |
| `docs/E2E-PLAYWRIGHT.md` | Estratégia E2E |
| `docs/AI-ROADMAP.md` / `docs/AGENTS-ROADMAP.md` | IA assistiva futura |

---

*Para métricas exatas de cobertura ou contagens de testes no momento de uma candidatura, gerar evidências locais (`npm test`, CI). Este arquivo não substitui leitura do código.*
