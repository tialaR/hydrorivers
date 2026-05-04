# CI — Quality gates (GitHub Actions)

## 1. Objetivo

Garantir que cada alteração enviada ao repositório e cada pull request passe por um conjunto mínimo e reproduzível de verificações de qualidade (onboarding do projeto, estilo/análise estática, TypeScript, chaves i18n e testes automatizados) antes da revisão ou do merge.

## 2. Quando o workflow roda

O arquivo [`.github/workflows/quality-gates.yml`](../.github/workflows/quality-gates.yml) executa nos eventos:

- **push**: em qualquer branch, após cada push.
- **pull_request**: quando um PR é aberto ou atualizado.

Há também **cancelamento entre execuções** do mesmo fluxo (`concurrency`) para não acumular jobs duplicados quando há vários pushes seguidos no mesmo branch ou PR.

## 3. Quais checks executam

Ordem na pipeline:

| Etapa                     | Comando                    |
|---------------------------|----------------------------|
| Instalação                | `npm ci`                   |
| Progresso onboarding      | `npm run check:onboarding` |
| ESLint                    | `npm run lint`             |
| TypeScript                | `npm run typecheck`        |
| Consistência i18n         | `npm run check:i18n`       |
| Testes (Vitest)           | `npm run test`             |

Ambiente: **Node.js 22** (compatível com o stack do projeto, por exemplo `@types/node` na faixa 22).

## 4. Por que cada check existe

- **`npm ci`**: instala dependências a partir do `package-lock.json` de forma determinística, reproduzindo o ambiente local e de CI.
- **`check:onboarding`**: valida requisitos ou progresso definidos pelo projeto (script em `scripts/check-onboarding-progress.mjs`) para manter alinhamento com o processo de onboarding.
- **`lint`**: mantém padrões de código e captura problemas comuns sem executar a aplicação.
- **`typecheck`**: garante que o TypeScript compila semanticamente (`tsc --noEmit`), reduzindo erros em tempo de build.
- **`check:i18n`**: verifica consistência das traduções entre locales (`pt-BR`, `en`, `es`), evitando chaves faltando ou divergentes.
- **`test`**: executa a suíte Vitest configurada no repositório, protegendo regressões em lógica coberta por testes.

## 5. Como rodar localmente

Na raiz do repositório, com Node.js 22 (ou versão compatível com o projeto):

```bash
npm ci
npm run check:onboarding
npm run lint
npm run typecheck
npm run check:i18n
npm run test
```

Para desenvolvimento iterativo, `npm install` costuma ser suficiente; para espelhar o CI, prefira `npm ci`.

## 6. Como investigar falhas

1. Abra a aba **Actions** no GitHub e selecione o run **Quality gates** que falhou.
2. Expanda o job **Lint, types, i18n, onboarding & tests** e o step que está em vermelho.
3. Leia a saída do comando: mensagens do ESLint, erros do `tsc`, relatório do script i18n, stack traces do Vitest ou saída do check de onboarding.
4. Reproduza localmente (seção 5) no mesmo commit para corrigir com feedback rápido.
5. Se o cache do `setup-node` parecer suspeito (raro), os re-runs do workflow ou um commit vazio costumam bastar; a causa mais comum continua sendo o próprio código ou traduções.

## 7. Próximos passos futuros

Ideias fora do escopo atual deste workflow, úteis quando o time quiser ampliar a pipeline:

- **E2E no CI**: adicionar job com `npm run test:e2e` (Playwright), incluindo instalação de browsers (`npx playwright install --with-deps` no Ubuntu) e possivelmente artefatos de relatório em caso de falha.
- **Testes de integração dedicados**: job separado com `npm run test:integration` para isolamento e paralelismo.
- **Build de produção**: `npm run build` para validar o bundle Next.js no CI.
- **Proteção de branch**: exigir status “Quality gates” verde antes do merge.

Mudanças futuras devem preservar os scripts existentes no `package.json` e alinhar novos jobs à mesma versão de Node usada aqui, salvo decisão explícita de atualizar o projeto.
