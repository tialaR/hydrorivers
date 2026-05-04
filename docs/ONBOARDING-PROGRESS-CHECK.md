# Check de progresso de onboarding

## O que é esse check

Um script Node (`scripts/check-onboarding-progress.mjs`) que confere, de forma **rápida e sem dependências novas**, se os **documentos** e os **scripts npm** que o onboarding oficial espera ainda existem no repositório.

## Por que ele existe

- Dar ao novo desenvolvedor (ou ao CI) um **sinal binário**: “os artefatos mínimos do guia estão aqui”.
- Detectar cedo renomeações em `docs/` ou remoção acidental de scripts como `check:i18n` ou `test`.

Ele **não** valida se o código compila nem se os testes passam — apenas presença dos arquivos e entradas no `package.json`.

## Como rodar

Na raiz do projeto:

```bash
npm run check:onboarding
```

## O que ele valida

| Tipo | Itens |
|------|--------|
| Arquivos | `docs/DEVELOPER-AI-ONBOARDING.md`, `docs/API-SECURITY-AUDIT.md`, `docs/SECURITY-PRODUCT-DECISIONS.md`, `docs/E2E-PLAYWRIGHT.md` |
| Scripts | `lint`, `typecheck`, `check:i18n`, `test` definidos como strings não vazias em `package.json` |

Saída no terminal: cada linha com **OK** ou **FAIL**, depois **Onboarding ready ✅** ou **Onboarding incomplete ❌**. Código de saída **0** ou **1**.

## Quando usar

- Durante **onboarding** (primeiro dia após o clone).
- Antes de abrir um PR que mexa em `docs/` ou em `package.json`.
- Opcionalmente em **CI futuro** como job leve antes de lint/typecheck/testes completos.

Para o fluxo completo de qualidade, continue rodando `npm run lint`, `npm run typecheck`, `npm run check:i18n` e `npm run test` conforme `AGENTS.md`.
