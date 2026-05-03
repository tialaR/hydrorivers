# HydroRivers Template

Template Next.js 16.2.4 + React 19 para o MVP **HydroRivers**, marketplace de frete fluvial e cabotagem com foco em Amazônia, pequenos produtores, redução de custo logístico, sustentabilidade, BR do Mar e desburocratização.

## Stack

- Next.js 16.2.4 com App Router
- React 19
- Sass Modules / CSS Modules
- next-intl com `pt-BR`, `en`, `es`
- Tema light/dark próprio, sem `next-themes`
- Ícones SVG internos + lucide-react em formulários
- Persistência mock server-side em `.mock-data/*.json`
- Vercel Analytics

## Rodando

```bash
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000/pt-BR
```

## Rotas principais

```txt
/pt-BR
/pt-BR/login
/pt-BR/cadastro
/pt-BR/logout
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
```

Também há suporte para `/en` e `/es`.

## Arquitetura feature-based

```txt
src/app             Rotas, layouts e route handlers
src/core            i18n e navegação localizada
src/features        Domínios do produto
src/shared          UI, layout, providers e config compartilhada
messages            Traduções
.mock-data          Banco mock local em JSON para desenvolvimento
```

## Ajustes visuais desta versão

- Marca alterada de HydroFrete para **HydroRivers**.
- Tipografia do hero suavizada, com menos peso e melhor espaçamento.
- Border radius global reduzido em cards, header, botões, inputs, dropdowns e ícones.
- Dark mode em cinza escuro com acento verde água/river.
- Dropdown e bottom sheet com visual glass mais consistente.
- Timeline de rastreio com ícones SVG e fallback para evitar quebra de ícones desconhecidos.

## Persistência mock server-side

Os dados de produto não usam `localStorage`. Os Route Handlers do Next.js gravam dados mockados em:

```txt
.mock-data/users.json
.mock-data/cargoes.json
.mock-data/vessels.json
.mock-data/negotiations.json
.mock-data/trackingEvents.json
```

Para resetar os mocks:

```bash
rm -f .mock-data/*.json
npm run dev
```

Observação: persistência em arquivo é para desenvolvimento local. Em produção na Vercel, use um banco ou storage persistente como Vercel Postgres, Neon, Supabase, KV ou Blob.


## Versão 0.5.7-consistent

Esta revisão transforma o template em um MVP mais consistente, mantendo a persistência mock em arquivo para desenvolvimento local.

### Principais ajustes

- Autenticação mock com senha hasheada via PBKDF2.
- Usuários públicos não recebem `passwordHash` nas respostas das APIs.
- Cadastro público limitado a `shipper` e `carrier`; `admin` foi removido da UI pública.
- Rotas privadas protegidas por middleware baseado no cookie `hydrorivers_session`.
- Painel admin com guarda server-side por role.
- API de criação de cargas protegida por sessão, role e validação básica.
- Tratamento de JSON inválido nas APIs principais.
- Correção do rastreio para usar os status reais `done | current | pending`.
- Perfil com campos controlados e sem fallback visual enganoso.
- Internacionalização ampliada: componentes que tinham textos fixos foram migrados para `messages/pt-BR.json`, `messages/en.json` e `messages/es.json`.
- Chaves de tradução alinhadas nos três idiomas.
- Listagem de cargas mobile-first com bottom sheet de filtros, accordions, badges de filtros ativos e chips removíveis no topo.
- `package.json` sem dependências em `latest` e com scripts `lint`/`typecheck`.

### Acesso demo

Os usuários seed usam a senha:

```txt
hydro123
```

Contas disponíveis:

```txt
tiala@hydrorivers.com      shipper
joao@naveganorte.com       carrier
admin@hydrorivers.com      admin
```

### Limites intencionais

Esta versão ainda é um MVP. A persistência em `.mock-data` não deve ser usada em produção ou serverless. Para produção, substitua por Auth real, banco Postgres/Supabase/Neon, validação com schema formal, migrations, auditoria e testes automatizados.


## Versão 0.5.8-i18n-avatar

Esta revisão foca em internacionalização e identidade do usuário.

### Ajustes de i18n

- `LocaleLayout` agora carrega explicitamente `messages` com `getMessages()` e repassa para `NextIntlClientProvider`.
- `LocaleSwitcher` usa a navegação localizada de `next-intl`, preservando path e query string ao trocar idioma.
- Textos que ainda estavam hardcoded em layout, breadcrumb, tema e páginas de detalhe foram movidos para `messages`.
- As chaves de `pt-BR`, `en` e `es` foram novamente alinhadas.

### Avatar do usuário

- A tela de perfil permite carregar uma foto local via input `image/*`.
- A imagem carregada é convertida para data URL e salva no mock do usuário.
- O header exibe a foto do usuário logado.
- Quando não há foto, o header exibe as iniciais do nome.
- O usuário também pode remover a foto e voltar ao fallback de iniciais.


## Versão 0.5.9-mobile-i18n-polish

Esta revisão fecha os problemas reportados no mobile e endurece mais a internacionalização.

### Ajustes entregues

- Header mobile agora mantém o usuário visível: mostra foto do perfil quando existir e iniciais quando não existir.
- Menu mobile redesenhado como bottom sheet mais compacto, com altura máxima, safe area, estado ativo e área de conta.
- Bottom sheets usam bloqueio de scroll do `body` enquanto abertos.
- `NextIntlClientProvider` agora recebe `locale` e `messages` explicitamente.
- Metadata também foi internacionalizada por locale.
- Avatar do perfil ganhou:
  - validação de tipo de arquivo;
  - limite de 1,5 MB;
  - fallback automático para iniciais se a imagem quebrar;
  - mensagem de erro traduzida;
  - remoção da foto.
- Chaves de tradução revalidadas em `pt-BR`, `en` e `es`.

### Próximas melhorias maiores

Ainda ficam como próximos passos de produto real:

- Upload real de imagem em storage persistente, como Vercel Blob ou Supabase Storage.
- Banco real no lugar de `.mock-data`.
- Validação formal com Zod ou biblioteca equivalente.
- Testes automatizados de i18n, autenticação, filtros e guards.
- Tradução dos dados mockados de domínio, como títulos de cargas, nomes de eventos e etapas de negociação.


## Correção v0.6.0

Esta revisão corrige dois pontos observados ao rodar localmente com Next.js 16:

- adiciona `src/app/layout.tsx` e `src/app/page.tsx` para que a rota raiz `/` redirecione explicitamente para `/pt-BR`;
- move `typedRoutes` de `experimental.typedRoutes` para `typedRoutes` no `next.config.ts`, eliminando o aviso do terminal.

Observação: se aparecer `GET /mockServiceWorker.js 404`, não há referência a MSW no projeto. Esse request costuma vir de cache do navegador, extensão/dev tooling ou service worker antigo registrado localmente. Ele não bloqueia o app.


## v0.6.1

- Corrige chaves de tradução ausentes no rodapé (`footer.socialRoutes` e `footer.socialSupport`).
- Mantém `/` redirecionando para `/pt-BR`.
- `npm run check:i18n` validado com 303 chaves alinhadas em `pt-BR`, `en` e `es`.


## v0.6.2 — correções de i18n, filtros mobile e avatar

- Troca de idioma agora usa redirecionamento direto do path atual (`/pt-BR`, `/en`, `/es`), preservando query string e hash.
- Filtros mobile da lista de cargas foram reescritos com botões selecionáveis no bottom sheet para evitar problemas de `select` no mobile.
- Chips de filtros ativos continuam no topo da lista e removem o filtro imediatamente.
- Tipos de carga conhecidos agora aparecem traduzidos nos cards e nos filtros.
- Avatar do usuário agora pode ser trocado por botão explícito de upload, com salvamento imediato no perfil mock.
- Remoção do avatar também salva imediatamente e o header volta para as iniciais.

## v0.6.3 — Mobile-first fixes

- Corrigido fluxo de troca de idioma usando a navegação localizada do `next-intl`.
- Layout localizado agora carrega mensagens explicitamente pelo locale ativo.
- Filtros mobile agora têm uma ação fixa inferior, estilo app nativo, além do bottom sheet.
- Bottom sheet de filtros fica sempre acima da UI, com altura `dvh` e safe-area.
- Avatar aceita JPEG/JPG e otimiza a imagem no navegador antes de salvar no mock, sem bloquear por limite pequeno de arquivo.



## v0.6.4 — Contexto Amazônico e valor governamental

Esta versão reposiciona o HydroRivers como um **porto digital amazônico** para MVP transacional demonstrável, incorporando o contexto do documento enviado:

- cargas com família produtiva: sociobiodiversidade, alimentos regionais, abastecimento territorial e cabotagem industrial;
- rotas com corredor, rio principal, tipo de serviço, previsibilidade e conectividade;
- cards de carga com ETA por faixa de confiança, risco operacional e prontidão documental;
- detalhe da carga com bloco de exigências: NF-e, CT-e, Romaneio, DOF, GTA/Documento sanitário quando aplicável;
- catálogo de embarcações com compatibilidade operacional: calado, corredor, documentação e operação offline;
- página `/governo` com painel de valor público para demonstrar uso por governo, fiscalização, cooperativas e operadores;
- filtros mobile-first com busca nativa, chips, quick filters por família produtiva e bottom sheet de documentos/rotas;
- troca de idioma forçada por navegação real entre `/pt-BR`, `/en` e `/es` para evitar estado preso no locale anterior.

A camada ainda é mockada e não substitui sistemas oficiais de regulação, fiscalização, documentos fiscais ou bancos transacionais. O objetivo é demonstrar valor de negócio e política pública antes da integração com Auth real, banco, storage e serviços governamentais.


## v0.6.5 — mobile-first operacional e polimento de produto

Esta versão aplica uma rodada focada nos insights de produto:

- Header com blur mais forte, composição mais leve, rota ativa em formato pill e barra contextual nas subpáginas.
- Menu mobile com conta do usuário, avatar/iniciais, idioma, tema e rotas sem duplicação visual.
- Correção do fluxo de i18n no seletor de idioma com persistência em `localStorage` e cookie `NEXT_LOCALE`.
- Prevenção de flicker de dark/light mode com script inline antes da hidratação.
- Filtros mobile-first na página de cargas:
  - busca fixa no topo;
  - botão de filtros sempre visível;
  - bottom sheet com accordions;
  - filtros por corredor, origem, destino, família produtiva, tipo de carga e documento;
  - chips removíveis;
  - contagem de resultados no sheet.
- Cards de carga com clique no card inteiro, ícone por família produtiva, rota visual origem/destino, ícones de volume/janela/alvo e status com faixa visual.
- Detalhe da carga enriquecido com contexto de origem, propostas fake, mais campos de proposta e toast de sucesso.
- Embarcações com mais informações operacionais: calado, documentação, checklist e baixa conectividade.
- Negociações com ícone contextual por produto, progresso por etapa e faixa de risco.
- Rastreio com ícone variável por evento.
- Impacto com novos cards: confiança documental, baixa conectividade e valor governamental.
- Footer com redes sociais fake clicáveis que disparam toast informativo.
- Componentes novos: Toast e Tooltip.


## v0.7.3

- Corrige dropdown `Mais` no header em desktop, removendo clipping por `overflow` e elevando o `z-index` do painel.


## Mock Mode por Use Cases

A versão atualizada inclui cenários globais de mock para simular fluxos completos do produto: `empty-state`, `market-active`, `negotiation-flow`, `in-transit`, `completed` e `error-scenarios`.

Use `GET /api/mock-mode` para listar cenários e `POST /api/mock-mode` com `{ "scenario": "in-transit" }` para trocar o estado dos dados em `.mock-data`.

Detalhes em [`docs/MOCK-MODE-USE-CASES.md`](docs/MOCK-MODE-USE-CASES.md).
# hydrorivers
