# Auditoria de textos hardcoded (i18n)

## Objetivo

Apoiar a migração para **next-intl** (`pt-BR`, `en`, `es`) listando **candidatos** a textos visíveis ainda fixos em código, sem substituir nada automaticamente nesta fase.

O script `scripts/check-hardcoded-i18n.mjs` é a **primeira versão conservadora**: prioriza poucos falsos positivos em troca de não capturar todos os casos.

## Como rodar

```bash
npm run check:i18n:hardcoded
```

O comando **sempre termina com código 0** (não quebra CI). Use a saída no terminal como checklist manual ou em PR.

Para alinhar chaves entre locales (já existente):

```bash
npm run check:i18n
```

## O que deve ser internacionalizado

- Copy de **interface**: títulos, descrições, botões, labels de formulário, placeholders explicativos, `aria-label` / `title` voltados ao usuário.
- **Empty states**, toasts, mensagens de erro de validação, breadcrumbs narrativos.
- Texto **entre tags JSX** que o usuário lê (quando não for marca técnica ou dado de domínio já centralizado em `translateMock` / mocks).

## O que não precisa (ou não precisa agora)

- **Chaves** e namespaces (`pages.foo`, `common.bar`).
- **Imports**, paths (`@/…`), `className`, `data-testid`, IDs técnicos (`cargo-001`, `u-shipper-1`).
- **Dados de mock** em arquivos dedicados (ex.: `messages/`, conteúdo massivo em `mock-content` — outra estratégia).
- **Logs técnicos** (`console.*`), variáveis de ambiente, tipos TypeScript.
- **Marca** “HydroRivers” e siglas muito curtas (allowlist reduz ruído nesta v1).
- **Testes** (`*.test.tsx`, `__tests__/`) — excluídos nesta primeira versão.

## Limitações da primeira versão

| Limitação | Detalhe |
|-----------|---------|
| Só `src/**/*.tsx` | Inclui `src/app/**` (App Router). Não há pasta `app/` na raiz deste repositório; não há scan de `middleware.ts` na raiz nesta v1. |
| `.ts` fora de TSX | Arquivos `.ts` puros (APIs, utilitários) não são varridos — costumam gerar muitos falsos positivos. |
| Uma linha | Padrões como texto JSX em várias linhas podem escapar. |
| Linha com `t(` | Se houver **literal** e **tradução** na mesma linha, a linha inteira é ignorada (conservador). |
| `title` / `alt` | Podem incluir metadados legítimos; revisão humana necessária. |
| Falsos negativos | Strings em template literals ou composição complexa podem não aparecer. |

## Exemplos de achados (baseline atual)

Na última execução com as regras atuais, o relatório tende a ser **muito pequeno** (regras conservadoras + uso amplo de `t()` / `page()`):

| Arquivo | Tipo | Texto | Nota |
|---------|------|--------|------|
| `src/shared/ui/toast/toast-provider.tsx` | `aria-label` | `Fechar` | Candidato claro a `useTranslations` ou chave compartilhada. |

Placeholders só com `•` (máscara de senha) são **ignorados** como ruído técnico. Nomes de marca na allowlist (ex.: `HydroRivers`) não aparecem como achado.

## Próximos passos (fora deste PR)

- Ampliar escopo (multilinha, alguns `.ts` de UI) com parser AST.
- Modo `--fail-on-findings` opcional quando a base estiver limpa.
- Integração opcional em CI após baseline.
