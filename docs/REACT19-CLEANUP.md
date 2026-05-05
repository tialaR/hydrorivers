# React 19 — estado no HydroRivers (registro)

**Tipo:** documentação apenas — descreve o que o código **já** usa com React 19 neste repositório, sem prometer um “cleanup” amplo.

## Versão e dependências

- **`package.json`:** React **19** em conjunto com Next.js **16** (App Router). Conferir versões exatas no arquivo de lock local.

## Padrões já adotados

| Área | Uso |
|------|-----|
| **Formulário de nova carga** | Client Component com **`useActionState`** (`publishCargoAction`, `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`). |
| **Server Actions** | Publicação de carga: `src/features/cargo-market/actions/publish-cargo-action.ts` chama **`commitPublishCargo`** (persistência + **`revalidateTag`** / **`revalidatePath`** — ver `src/features/cargos/server/commit-publish-cargo.ts`). |
| **Demais UI** | Componentes cliente continuam em React 19; não há migração forçada de hooks legados documentada aqui. |

## O que **não** entra neste documento

- Refatoração generalizada de todos os formulários para `useActionState` / `useFormStatus`.
- Mudança de contratos de API ou de i18n.

## Referências

- `docs/NEXT16-APP-ROUTER-CLEANUP.md` — backlog App Router.
- `docs/PORTFOLIO-CASE.md` / `docs/ENTERPRISE-ROADMAP.md` — contexto de produto e mock.

*Atualizar este ficheiro quando novos fluxos adotarem explicitamente APIs novas do React 19 de forma transversal.*
