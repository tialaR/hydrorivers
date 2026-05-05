# Next.js 16 App Router — auditoria leve e backlog de limpeza

Este documento registra uma **auditoria leve** do App Router (Next.js 16) no HydroRivers e um **backlog sugerido**. Objetivo: convenções modernas (`loading`, `error`, `not-found`, SC sem `use client` desnecessário) **sem** refatoração ampla nem mudança de URLs.

## Já aplicado (referência)

| Item | Descrição |
|------|-----------|
| `[locale]/not-found.tsx` | UI 404 localizada (`errors.notFound` + `Link` do next-intl). |
| Publicação de carga (UI) | Formulário em **`/cargas/nova`** com **`publishCargoAction`** + React 19 **`useActionState`** (`src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`). |
| **`[locale]/minhas-cargas`** | Lista “minhas cargas” (mock) com filtro por dono/shipper — ver rotas em `src/app`. |
| `[locale]/cargas/loading.tsx` | Fallback de Suspense ao carregar marketplace de cargas (`pages.cargoes.loadingList`). |
| `[locale]/cargas/[id]/page.tsx` | `notFound()` quando `getCargoById` não encontra recurso (alinhado a `negociacoes/[id]`). |

## Por que não houve refatoração ampla

- **URLs e grupos de rotas** estáveis são requisito de produto e de testes E2E.
- **next-intl** exige que boundaries como `not-found` vivam sob `[locale]` com mensagens consistentes (`pt-BR`, `en`, `es`).
- **Risco/regressão**: introduzir `error.tsx`, `loading.tsx` ou SC/`client` em massa aumenta superfície de teste sem ganho proporcional num único PR.

## Oportunidades futuras (prioridade sugerida)

### 1. `error.tsx` (boundary de erro)

- **Onde**: `[locale]/layout.tsx` (fallback global por locale) ou rotas operacionais (`cargas`, `dashboard`, `negociacoes`).
- **Por quê**: captura exceções em Server Components e oferece “Tentar novamente” sem quebrar shell (header/footer já estão no layout pai — validar hierarquia de error boundaries na doc do Next 16).
- **Cuidado**: não duplicar providers; manter texto via i18n.

### 2. `loading.tsx` adicionais

- **`minhas-cargas`**, **`dashboard`**, **`negociacoes`**: páginas com `Promise.all` / várias leituras mock podem beneficiar de fallback semelhante ao de `cargas/loading.tsx`.
- **`cargas/[id]`**: opcional se o shell pesar; hoje o trabalho é pequeno.

### 3. `not-found` granular

- **`cargas/[id]/not-found.tsx`**: opcional para mensagem específica (“carga inexistente”) em vez do 404 genérico — exigiria chaves i18n dedicadas e decisão de UX (genérico vs específico).

### 4. `forbidden.tsx` / `unauthorized.tsx` (Next 15+)

- Avaliar quando políticas de autorização no servidor passarem a lançar `forbidden()` / `unauthorized()` do `next/navigation` em vez de só redirect no middleware.
- Hoje o app usa **middleware + APIs** para sessão; alinhar convenções antes de criar ficheiros.

### 5. Route groups `(marketing)` / `(app)`

- Possível reorganização **sem** mudar URLs (`( grupo )` não aparece na URL).
- **Só** vale a pena se separar layouts (ex.: landing sem header pesado vs app logado).

### 6. Dynamic segments e metadata

- `generateStaticParams` / `generateMetadata` nas páginas de detalhe se no futuro houver CMS ou slugs estáveis — hoje mocks são dinâmicos.

### 7. Componentes client grandes

- **`cargo-list.tsx`**, formulários extensos: candidatos a divisão em subcomponentes client + wrappers server **por PR pequeno** (só sugestão neste doc).

### 8. Streaming e `Suspense`

- Onde houver fetch independentes, usar `<Suspense fallback={...}>` em volta de ilhas em vez de uma única página bloqueante.

## Checklist rápido em novos PRs

- Preferir **`page.tsx` como Server Component**; `use client` só em folhas interativas.
- Para recurso ausente em SC: **`notFound()`** no servidor quando o utilizador espera 404 semântico.
- Novas rotas com dados lentos: considerar **`loading.tsx`** no mesmo segmento.
- Textos de boundary (`error`, `not-found`): sempre **next-intl**, chaves nos três locales.

Para **React 19** (`useActionState`, Server Actions usadas na UI), ver **`docs/REACT19-CLEANUP.md`** (registro factual, não checklist de refatoração global).
