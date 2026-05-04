# HydroRivers — Case de portfólio (nível sênior)

Este documento descreve o projeto **como produto de software** para uso em portfólio e redes profissionais. O conteúdo baseia-se **no que está implementado no repositório** e **no que está registrado como planejamento/roadmap em `docs/`** — sem atribuir como pronto o que ainda não existe em código.

---

## Estado do projeto em três camadas

### 1. Implementado (hoje no código)

- **Stack:** Next.js **16.2.4** (App Router), **React 19**, **TypeScript**, **next-intl**, **Sass Modules**, ESLint 9 (flat config).
- **Produto:** fluxo demonstrável de marketplace hidroviário/cabotagem: landing, **cargas**, **embarcações**, **negociações**, **rastreio**, **impacto**, **governo**, **admin**, **perfil**.
- **Persistência:** mock **server-side** em `.mock-data/*.json` via Route Handlers e utilitários (`readMock` / `writeMock`), com seeds e cenários (`mock-scenarios`) e reset administrativo (`POST /api/mock-mode` com sessão **admin**).
- **Auth:** fluxo mock (login com OTP, cadastro shipper/carrier, sessão por cookie); endurecimento documentado para não expor OTP em produção sem flag de ambiente (`HYDRORIVERS_EXPOSE_OTP_CODE`).
- **Rotas privadas:** middleware exige sessão em caminhos como `/dashboard`, `/perfil`, `/negociacoes`, `/rastreio`, `/admin`, `/cargas/nova` (lista atual em `middleware.ts`).
- **APIs:** leitura/escrita mock para cargas, embarcações, negociações e rastreio; mutações sensíveis com regras de sessão/perfil conforme evolução do projeto (vide `docs/API-SECURITY-AUDIT.md`).
- **UI:** tema claro/escuro, layout responsivo, componentes compartilhados (`src/shared`) e organização **feature-based** (`src/features`).
- **Rastreio:** modelo de eventos com tipos operacionais auditáveis e compatibilidade com dados legados (`docs/TRACKING-TIMELINE.md` — etapa inicial descrita lá).
- **Qualidade:** **Vitest** (unitário + integração de APIs), **Playwright** (E2E inicial), scripts `lint`, `typecheck`, `check:i18n`.
- **Observabilidade leve:** Vercel Analytics (dependência declarada).

### 2. Em evolução / planejado explicitamente (documentado, não como produto final)

- **Segurança de APIs:** GET públicos de dados operacionais identificados como risco; recomendações de restrição e validação mais formal (`docs/API-SECURITY-AUDIT.md`).
- **Persistência real:** modelo relacional-alvo, ordem de migração, convivência mock + banco (`docs/DATABASE-PLANNING.md`).
- **Camada de dados:** boundary tipo repository entre handlers e persistência — previsto como fases no planejamento de banco (mesmo documento).
- **Timeline operacional:** próximas etapas (API filtrada, escrita de eventos, documentos) descritas em `docs/TRACKING-TIMELINE.md`.
- **Documentos:** modelo e permissões **planejados**, upload **fora de escopo** na doc atual (`docs/DOCUMENTS-MODULE.md`).
- **Dashboard executivo:** KPIs por persona e ordem de implementação (`docs/EXECUTIVE-DASHBOARD.md`).
- **Produto:** nível declarado como **MVP transacional demonstrável**, não produção enterprise (`docs/ARCHITECTURE.md`).

### 3. Visão futura (alinhada ao roadmap explícito, não implementada)

- Auth forte (provider/passkeys), **Postgres** (ou equivalente), migrations, validação de payload com schemas (ex.: Zod mencionado em arquitetura).
- Autorização por **owner/participante** de ponta a ponta nas **leituras** sensíveis, não só em mutações.
- Armazenamento real de avatar/documentos; mapas, ETA operacional e eventos **tempo real**.
- Módulo de **documentos** com upload, storage e políticas de visibilidade (`docs/DOCUMENTS-MODULE.md`).
- Indicadores executivos estáveis e séries temporais quando existirem timestamps confiáveis no domínio (`docs/EXECUTIVE-DASHBOARD.md`).

---

## Problema

Operações logísticas em **hidrovias e cabotagem** — especialmente em contextos amazônicos e territoriais — sofrem com:

- **Fragmentação:** cotações, documentação, reservas e acompanhamento físico costumam estar dispersos.
- **Assimetria de informação:** pequenos produtores e cooperativas disputam visibilidade e previsibilidade frente a capacidade flutuante e janelas portuárias.
- **Confiança e compliance:** documentação, cadeia fria e provas operacionais precisam ser **rastreáveis**, sem tornar o fluxo inutilizável em **baixa conectividade**.
- **Valor público:** corredores e políticas públicas precisam enxergar impacto socioambiental e gargalos — sem misturar narrativa institucional com dados não auditados.

O HydroRivers endereça isso como **plataforma web unificada** (fluxo ponta a ponta **demonstrável**), com foco em UX multilíngue e bases para segurança e testes antes de escalar para dados reais.

---

## Solução

Um **marketplace transacional orientado a rios/cabotagem** que, no estado atual:

- Permite **cadastro e perfis** (embarcador, transportador, admin em fluxo mock).
- Centraliza **cargas**, **embarcações** e **negociações** com estágios de negócio reconhecíveis.
- Oferece **rastreio por eventos** com modelo pensado para evoluir para timeline auditável.
- Apresenta **impacto** e **painel governo** como camadas de narrativa e indicadores derivados do mock.
- Usa **admin + mock-mode** para cenários de QA e demonstrações controladas.

A solução é conscientemente um **MVP evolutivo**: funcional para demo e para disciplina de engenharia (tipagem, i18n, testes), com documentação clara do salto para produção.

---

## Arquitetura

```txt
src/app              App Router: páginas, layouts, Route Handlers (/api/*)
src/core             i18n (routing), configuração de locales
src/features         Domínios: auth, cargas, negociações, tracking, governo, dashboard, etc.
src/shared           UI, layout, providers, servidor compartilhado (mock-db, auth helpers)
messages             pt-BR, en, es — chaves alinhadas por script de verificação
.mock-data           Persistência JSON local (desenvolvimento / demo)
docs/                Planejamento: banco, documentos, segurança API, timeline, dashboard executivo
```

- **.Renderização:** páginas server components onde faz sentido; trechos interativos em client components.
- **Dados:** leitura/escrita centralizada no servidor mock; evolução planejada para repositório/banco sem quebrar contratos de domínio de forma abrupta (`docs/DATABASE-PLANNING.md`).

---

## Decisões técnicas

| Decisão | Motivo (resumo) |
|---------|------------------|
| **App Router + Route Handlers** | API colocalizada ao app, bom encaixe com sessão mock e SSR/i18n. |
| **next-intl** | Produto regional/global desde o MVP; navegação e cópias por locale. |
| **Sass Modules** | Estilo encapsulado por componente, alinhado ao design system incremental. |
| **Mock em arquivo (`server-only`)** | Iteração rápida sem custo de infra; troca gradual por DB documentada. |
| **Vitest + Playwright** | Pirâmide de testes: domínio/API rápidas em CI local; E2E para fluxos críticos (doc `docs/E2E-PLAYWRIGHT.md`). |
| **Cookie de sessão mock** | Adequado ao estágio atual; substituível por JWT/sessão servidor com DB. |
| **Feature folders** | Escalabilidade por domínio (cargas vs negociações vs tracking) sem microsserviços prematuros. |

---

## Regras de negócio (como modeladas hoje)

Derivadas dos tipos e fluxos mock (detalhes nos domínios em `src/features/**/domain` e dados em `marketplace.mock` / auth mock):

- **Cargas:** estados como `open`, `bidding`, `contracting`, `reserved`, `boarded`, `delivered`; metadados de corredor, conectividade, documentação sugerida.
- **Embarcações:** disponibilidade, rota, capacidade, status operacional simplificado.
- **Negociações:** estágios tipo cotação → contrato → embarque → entrega (`DealStage`), partes (`shipper`/`carrier`), valores e histórico resumido em mock.
- **Rastreio:** eventos com status de timeline (`done` / `current` / `pending`) e **tipos operacionais** opcionais para evolução auditável (`docs/TRACKING-TIMELINE.md`).
- **Perfis:** `shipper`, `carrier`, `admin` no modelo de usuário; cadastro público restrito a shipper/carrier (admin não via registro espontâneo — conforme política atual do projeto).

*Interpretação dos números no dashboard/governo:* parte das tendências é **ilustrativa** no mock; o roadmap executivo alerta para não confundir demo com série temporal real (`docs/EXECUTIVE-DASHBOARD.md`).

---

## Segurança

Estado **honesto** conforme auditoria interna:

- **Pontos fortes:** endurecimento em rotas que alteram dados sensíveis ou cenários (`mock-mode` admin; participação em negociações nas mutações cobertas por testes); padronização parcial de erros (`401`/`403`/`400`) onde aplicável; OTP não exposto por padrão.
- **Pontos em aberto:** GET amplos em dados operacionais sem sessão; validação de payload ainda não centralizada em schema; ausência de rate limit/brute-force mitigation em auth mock (recomendações em `docs/API-SECURITY-AUDIT.md`).
- **Política de produto:** não promover IA generativa antes de **segurança, validação e testes** consolidados (`AGENTS.md`).

Para portfólio: destacar **mentalidade de threat modeling documentado** e **evolução incremental**, não “caixa preta segura”.

---

## Testes

| Camada | Ferramenta / escopo |
|--------|----------------------|
| Estático | ESLint (`eslint.config.mjs`), TypeScript (`tsc --noEmit`) |
| Contrato i18n | `npm run check:i18n` — paridade `pt-BR` / `en` / `es` |
| Unitário | Vitest — helpers de servidor, domínio, auth mock, inferência de tracking, etc. |
| Integração | Vitest — Route Handlers (`tests/integration/api/*`) incluindo auth, cargas, negociações, mock-mode, rastreio |
| E2E | Playwright — fluxos críticos iniciais (login demo, locale, rotas privadas); ambiente documentado em `docs/E2E-PLAYWRIGHT.md` |

Política do repositório: mudanças que tocam fluxo ou APIs devem incluir validações correspondentes (`AGENTS.md`).

---

## i18n

- Locales: **`pt-BR`**, **`en`**, **`es`**.
- Mensagens em `messages/*.json`; conteúdo de demo/marketplace traduzível via helpers de mock onde aplicável (`translateMock`).
- Navegação e shells de página respeitam o routing por locale (`src/core/i18n`).

---

## Roadmap (síntese documentada)

| Fase | Foco |
|------|------|
| Curto prazo | Endurecer leituras sensíveis; consolidar agregações para dashboards; timestamps normalizados onde precisarem virar KPI.reais (`EXECUTIVE-DASHBOARD`, `DATABASE-PLANNING`). |
| Médio prazo | Boundary repository + primeira migração Postgres; auth real; schemas de validação. |
| Longo prazo | Documentos com storage seguro; tracking tempo real e integrações oficiais; indicadores institucionais auditáveis (`ARCHITECTURE`, `DOCUMENTS-MODULE`, `TRACKING-TIMELINE`). |

---

## Visão de IA (alinhada à governança do projeto)

**Hoje:** não há IA de produto integrada; as regras do repositório explicícitas são **não adicionar IA antes de segurança, validação e testes** (`AGENTS.md`).

**Futuro responsável (visão compatível com o tipo de problema):**

- Assistência para **resumo estruturado de negociação** e **checagem de checklist documental**, sempre com **trilha de auditoria humana** e sem substituir decisões regulatórias.
- Uso apenas sobre dados **já autorizados** ao usuário e com **políticas de retenção** coerentes com documentos e LGPD/GDPR quando houver backend real.

Ou seja: IA como **acelerador de leitura e consistência**, não como motor oculto de contratos ou fretes.

---

## Pitch de 30 segundos

*"O HydroRivers é um MVP web que une marketplace hidroviário, negociação e rastreio por eventos — pensado para Amazônia e cabotagem, com foco em cooperativas e compliance sem abandonar baixa conectividade. Está em Next.js e React 19, multilíngue desde o primeiro dia, com mocks server-side e uma pirâmide de testes que já cobre APIs críticas. O próximo passo documentado é levar isso a banco real e políticas de autorização de ponta a ponta, mantendo o que já funciona como produto demonstrável."*

---

## Descrição para LinkedIn (parágrafo único — pode colar em “Projeto” ou post)

**HydroRivers** — plataforma Next.js 16 (App Router) e React 19 para operações logísticas em hidrovias e cabotagem: cargas, embarcações, negociações, rastreio orientado a eventos, impacto socioambiental e visão institucional/governo. Stack TypeScript, Sass Modules e **next-intl** (`pt-BR`, `en`, `es`); persistência **mock server-side** com cenários administráveis; **middleware** para rotas privadas e APIs com endurecimento progressivo documentado em auditoria interna. Qualidade com **Vitest** (unitário + integração de Route Handlers), **Playwright** (E2E inicial), ESLint 9 e verificação automática de paridade i18n. Roadmap explícito para Postgres, repository boundary, documentos com storage seguro e KPIs executivos por persona — mantendo incrementos pequenos e segurança antes de camadas de IA.

---

## Referências rápidas no repositório

- Visão de produto e próximo salto: `docs/ARCHITECTURE.md`
- Banco e migração: `docs/DATABASE-PLANNING.md`
- Segurança de APIs: `docs/API-SECURITY-AUDIT.md`
- Timeline de rastreio: `docs/TRACKING-TIMELINE.md`
- Documentos (planejado): `docs/DOCUMENTS-MODULE.md`
- Dashboard executivo (planejado): `docs/EXECUTIVE-DASHBOARD.md`
- Política de agentes/testes (inclui regra sobre IA): `AGENTS.md`
- Execução local e rotas: `README.md`

---

*Última atualização conceitual alinhada à versão package `0.8.6` e stack declarada em `package.json`. Para números exatos de cobertura ou linhas de código, gere métricas locais (`npm test`, relatórios de CI) no momento da candidatura.*
