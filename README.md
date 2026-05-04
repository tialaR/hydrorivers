# HydroRivers

Plataforma web para **operações logísticas hidroviárias e cabotagem**, com foco em contextos onde **oferta**, **frota**, **negociação** e **rastreabilidade** precisam conviver na mesma experiência — hoje como **MVP demonstrável**, com dados **mock** e documentação explícita de limites e próximos passos.

---

## Pitch (em poucas linhas)

O HydroRivers reúne em um só lugar o que, na prática, costuma ficar disperso para quem opera em **hidrovias e cabotagem**: marketplace (cargas, embarcações, negociações), **rastreio com linha do tempo**, visão de **impacto** e uma superfície **institucional** (Amazônia, corredores, baixa conectividade).  

O código é uma base **executável**: Next.js App Router, TypeScript, três idiomas e qualidade automatizada — **sem confundir** essa demo com TMS/ERP enterprise ou produção blindada contra todos os cenários regulatórios.

---

## Problema que o produto endereça

- **Coordenação fragmentada** entre demanda de transporte, oferta de frota, propostas e acompanhamento físico.  
- **Assimetria de informação** e custo de alinhamento entre embarcadores e transportadores.  
- Necessidade de **visibilidade agregada** (impacto, narrativa operacional) para políticas e operações — sem misturar, no estágio atual, **dados auditáveis oficiais** com campos apenas **demonstrativos** do mock.

Este repositório ataca isso como **produto validável em engenharia**: fluxos navegáveis, APIs em Route Handlers e persistência local em JSON **apenas para desenvolvimento/demo**. Detalhes de personas e fluxos aparecem em [`docs/DEVELOPER-AI-ONBOARDING.md`](docs/DEVELOPER-AI-ONBOARDING.md).

---

## Legenda: implementado · em evolução · futuro

| Marco | Significado neste projeto |
|--------|---------------------------|
| **Implementado** | Presente no repositório: você pode rodar e inspecionar o código (UI, APIs, mocks, scripts de qualidade conforme configurados). |
| **Em evolução** | Parcialmente no código ou **decisão já documentada** guiando trabalho incremental (nem toda política já está uniforme nos handlers). |
| **Futuro (roadmap)** | Descrito em `docs/` — **não** deve ser comunicado como já entregue em produção. |

Visão estratégica consolidada (incluindo matriz técnica e de segurança em alto nível): [`docs/ENTERPRISE-ROADMAP.md`](docs/ENTERPRISE-ROADMAP.md).

---

## Stack técnica

- **Framework:** Next.js **16.2.4** (App Router), **React 19**, **TypeScript**  
- **Estilo:** Sass Modules; tema claro/escuro próprio (sem `next-themes`)  
- **i18n:** **next-intl** — locales `pt-BR`, `en`, `es`  
- **Dados:** persistência mock **server-side** em `.mock-data/*.json` (não usar como produção nem serverless com escrita concorrente em arquivo)  
- **Qualidade:** ESLint, `tsc --noEmit`, checagem de chaves i18n, **Vitest**; **Playwright** para E2E (vide documentação abaixo)  
- **Observabilidade de produto:** Vercel Analytics  

*Número de versão do pacote conforme [`package.json`](package.json) (pacote interno listado lá; roadmap enterprise referencia **0.8.6** alinhado ao portfólio).*

---

## Funcionalidades **implementadas** (neste MVP)

- Rotas por locale (`/pt-BR`, `/en`, `/es`); página **`/governo`** para narrativa institucional.  
- **Auth mock** (login, cadastro público **shipper** / **carrier**, logout, perfil), cookie `hydrorivers_session`, **middleware** em rotas privadas; senhas com **PBKDF2** no servidor; cliente sem `passwordHash` nas respostas (detalhes em [`docs/API-SECURITY-AUDIT.md`](docs/API-SECURITY-AUDIT.md)).  
- **Marketplace:** cargas, embarcações, negociações (listagem, detalhe, fluxos de UI e APIs em `/api/*`).  
- **Rastreio** com timeline e modelo de eventos operacionais (ver `docs/TRACKING-TIMELINE.md` para o desenho completo).  
- **Impacto**, **dashboard**, **admin** (área restrita por papel).  
- **Mock mode** para cenários de demo/QA (`GET`/`POST` `/api/mock-mode` — restrições documentadas na auditoria).  
- **Internacionalização** de UI com script de paridade de chaves.  
- Testes automatizados **Vitest** e suíte **Playwright** configurada no projeto.  

O que **não** é produto final neste estado: banco transacional enterprise, módulo completo de **documentos** com storage privado, **autorização forte em todas as leituras GET** das APIs operacionais, **IA em runtime**, etc. — ver matriz em [`docs/API-SECURITY-AUDIT.md`](docs/API-SECURITY-AUDIT.md) e [`docs/PORTFOLIO-CASE.md`](docs/PORTFOLIO-CASE.md).

---

## Funcionalidades **em evolução**

- **Camada de repositório** para isolar persistência (**piloto** em parte das rotas; demais handlers podem ainda acessar mock direto) — [`docs/REPOSITORY-BOUNDARY.md`](docs/REPOSITORY-BOUNDARY.md).  
- **Ownership e escopo** (ex.: `ownerId` em cargas criadas pela API — decisão de produto vs. comportamento atual em todos os caminhos) — [`docs/SECURITY-PRODUCT-DECISIONS.md`](docs/SECURITY-PRODUCT-DECISIONS.md).  
- **Endurecimento de segurança** nas leituras sensíveis (recomendações já escritas; migração incremental esperada).  
- **E2E** com cobertura inicial; expansão quando fluxos críticos estabilizarem — [`docs/E2E-PLAYWRIGHT.md`](docs/E2E-PLAYWRIGHT.md).  

---

## Roadmap **futuro** (alto nível)

Síntese alinhada a [`docs/ENTERPRISE-ROADMAP.md`](docs/ENTERPRISE-ROADMAP.md): persistência relacional (**[`docs/DATABASE-PLANNING.md`](docs/DATABASE-PLANNING.md)**), autorização nas leituras, **documentos/compliance**, **dashboard executivo** formalizado (**[`docs/EXECUTIVE-DASHBOARD.md`](docs/EXECUTIVE-DASHBOARD.md)**), **IA apenas assistiva** após gates de segurança e testes (**[`docs/AI-ROADMAP.md`](docs/AI-ROADMAP.md)**, **`docs/AGENTS-ROADMAP.md`**, **`AGENTS.md`**). Nada disso deve ser assumido como já implementado no app atual.

---

## Como rodar localmente

Requisitos: **Node.js** compatível com o projeto (a pipeline de CI usa **22** — ver [`docs/CI-QUALITY-GATES.md`](docs/CI-QUALITY-GATES.md)).

```bash
npm install
npm run dev
```

Aplicação (exemplo pt-BR):

```txt
http://localhost:3000/pt-BR
```

A raiz `/` redireciona para `/pt-BR`.

### Rotas principais (exemplos)

```txt
/pt-BR
/pt-BR/login
/pt-BR/cadastro
/pt-BR/perfil
/pt-BR/dashboard
/pt-BR/cargas
/pt-BR/cargas/nova
/pt-BR/cargas/[id]
/pt-BR/embarcacoes
/pt-BR/embarcacoes/[id]
/pt-BR/negociacoes
/pt-BR/negociacoes/[id]
/pt-BR/rastreio
/pt-BR/admin
/pt-BR/impacto
/pt-BR/impacto/[id]
/pt-BR/governo
```

Rotas equivalentes existem sob `/en` e `/es`.

### Persistência mock e reset

Dados de produto em desenvolvimento ficam em `.mock-data/*.json` (usuários, cargas, embarcações, negociações, eventos de rastreio). Para **resetar**:

```bash
rm -f .mock-data/*.json
npm run dev
```

Cenários globais de mock (use cases) estão documentados em [`docs/MOCK-MODE-USE-CASES.md`](docs/MOCK-MODE-USE-CASES.md).

### Arquitetura (pastas)

```txt
src/app             Rotas, layouts e Route Handlers
src/core            i18n e navegação localizada
src/features        Domínios do produto
src/shared          UI, layout, providers e utilitários compartilhados
messages            Traduções (pt-BR, en, es)
.mock-data          JSON local para demo/dev
```

---

## Comandos principais

| Comando | Função |
|---------|--------|
| `npm run dev` | Servidor de desenvolvimento Next.js |
| `npm run check:onboarding` | Valida artefatos e scripts esperados no onboarding do repositório |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run check:i18n` | Paridade de chaves entre `pt-BR`, `en`, `es` |
| `npm run test` | Vitest (suíte padrão do projeto) |

Outros scripts úteis (vide `package.json`): `npm run test:unit`, `npm run test:integration`, `npm run build`, `npm start`.

---

## E2E (Playwright)

O projeto inclui **`@playwright/test`** e o script **`npm run test:e2e`**.

- **Quando usar:** fluxos que o usuário percorre na UI (login, rotas privadas, i18n, papéis, etc.). Estratégia e checklist em [`docs/E2E-PLAYWRIGHT.md`](docs/E2E-PLAYWRIGHT.md).  
- **Ambiente típico:** com o app acessível na URL esperada pela configuração do Playwright; na primeira vez ou em CI, pode ser necessário instalar browsers do Playwright (ex.: `npx playwright install`), conforme a [documentação oficial](https://playwright.dev/docs/intro) — o workflow atual de CI em [`docs/CI-QUALITY-GATES.md`](docs/CI-QUALITY-GATES.md) **não** inclui E2E ainda (próximo passo opcional documentado lá).

Antes de commitar mudanças que tocam fluxos críticos de UI, o próprio [`docs/E2E-PLAYWRIGHT.md`](docs/E2E-PLAYWRIGHT.md) recomenda rodar também `npm run lint`, `typecheck`, `check:i18n`, `test` e `npm run test:e2e`.

---

## Mapa da documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/ENTERPRISE-ROADMAP.md`](docs/ENTERPRISE-ROADMAP.md) | Visão consolidada: implementado, em evolução, fases futuras e critérios para produção |
| [`docs/DEVELOPER-AI-ONBOARDING.md`](docs/DEVELOPER-AI-ONBOARDING.md) | Onboarding de devs, domínios, uso de IA/agentes dentro das regras do repo |
| [`docs/PORTFOLIO-CASE.md`](docs/PORTFOLIO-CASE.md) | Case de portfólio para recrutadores e avaliadores (pitch, problema, honestidade MVP vs enterprise) |
| [`docs/API-SECURITY-AUDIT.md`](docs/API-SECURITY-AUDIT.md) | Matriz estática das APIs: sessão, riscos e recomendações |
| [`docs/SECURITY-PRODUCT-DECISIONS.md`](docs/SECURITY-PRODUCT-DECISIONS.md) | Decisões explícitas (ex.: `approved`, admin em negociações, `ownerId`) |
| [`docs/CI-QUALITY-GATES.md`](docs/CI-QUALITY-GATES.md) | Workflow GitHub Actions e como reproduzir checks localmente |
| [`docs/E2E-PLAYWRIGHT.md`](docs/E2E-PLAYWRIGHT.md) | Quando criar E2E, relação com integração e boas práticas |

Complementares citados neste README: **`AGENTS.md`** (política de contribuição e IA), **`docs/MOCK-MODE-USE-CASES.md`**, **`docs/REPOSITORY-BOUNDARY.md`**, **`docs/DATABASE-PLANNING.md`**, **`docs/TRACKING-TIMELINE.md`**.

---

## Como contribuir

1. Leia **`AGENTS.md`** (mudanças pequenas e focadas, validações antes do merge, política explícita: **sem IA em produto** antes de segurança, validação e testes consolidados).  
2. Prefira PRs curtos com escopo único e descrição objetiva (objetivo, riscos, impacto em i18n e acessibilidade quando aplicável).  
3. Antes de abrir ou atualizar um PR relevante, rode pelo menos os checks alinhados ao CI: **`npm run check:onboarding`**, **`lint`**, **`typecheck`**, **`check:i18n`**, **`test`**; para fluxos críticos ou E2E, siga **`AGENTS.md`** e [`docs/E2E-PLAYWRIGHT.md`](docs/E2E-PLAYWRIGHT.md).  
4. Commits seguindo **Conventional Commits** quando o time assim convencionar (orientação também em `.cursor/rules` onde existir).

---

## Convenção de branches

- Use prefixos por tipo de trabalho: `feature/`, `fix/`, `docs/`, `chore/`, `ci/`, `test/`, `refactor/`, `security/`, `tooling/`, etc.  
- Para **várias rodadas no mesmo tema**, o histórico do repositório costuma usar sufixos **`v2`, `v3`, `v4`** em branches paralelas (`docs/algo`, `docs/algo-v2`, …): trata-se de **iteração nomeada**, não automação de semver. Orientação sobre limpeza de branches antigas merged: [`docs/REPO-CLEANUP.md`](docs/REPO-CLEANUP.md).  
- Mantenha a branch atualizada com a linha principal acordada pelo time (`main` e/ou `dev`) antes do merge.

---

## Qualidade e CI

- **Workflow:** [`.github/workflows/quality-gates.yml`](.github/workflows/quality-gates.yml), descrito em [`docs/CI-QUALITY-GATES.md`](docs/CI-QUALITY-GATES.md).  
- **Em cada push e pull request:** `npm ci`, `check:onboarding`, `lint`, `typecheck`, `check:i18n`, `test`.  
- **Fora do CI por ora (opcional no futuro):** `npm run test:e2e`, `npm run build`, jobs dedicados de integração — ver seção “Próximos passos” em [`docs/CI-QUALITY-GATES.md`](docs/CI-QUALITY-GATES.md).

---

## Status atual do projeto

- **MVP web demonstrável** com persistência **mock** em arquivo, **auth mock** e **limitações conscientes** para ambiente real (GETs amplos, ausência de DB transacional, etc.) — ver [`docs/API-SECURITY-AUDIT.md`](docs/API-SECURITY-AUDIT.md).  
- **Documentação de segurança e produto** e **roadmap enterprise** são parte intencional do trabalho, não “só UI”.  
- O produto **não substitui** sistemas oficiais de fiscalização, documentos fiscais ou compliance; campos de impacto e narrativas são **demonstrativos** até haver fontes auditáveis.

---

## Nota para portfólio e avaliação técnica

Para **recrutadores, mentores e revisores de código**, o material principal é [`docs/PORTFOLIO-CASE.md`](docs/PORTFOLIO-CASE.md): resume pitch, problema, o que está **implementado** vs **em evolução** vs **visão futura**, e aponta para auditoria e decisões sem inflar o escopo do código. Use este README para **rodar e navegar**; use o case + [`docs/ENTERPRISE-ROADMAP.md`](docs/ENTERPRISE-ROADMAP.md) para **julgar maturidade de engenharia e honestidade de produto**.

---

## Acesso demo (contas seed)

Senha padrão das contas de demonstração:

```txt
hydro123
```

Contas (exemplos):

```txt
tiala@hydrorivers.com      shipper
joao@naveganorte.com       carrier
admin@hydrorivers.com      admin
```

---

## Observação sobre `mockServiceWorker.js` (404)

Se aparecer `GET /mockServiceWorker.js 404`, o projeto **não** usa MSW; o pedido costuma vir de cache do navegador, extensão ou service worker antigo. Não bloqueia o app.
