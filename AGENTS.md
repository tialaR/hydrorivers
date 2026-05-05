# Instruções de Agentes — HydroRivers

## Contexto do projeto

HydroRivers é uma plataforma em Next.js/React para operações logísticas hidroviárias.

Domínios principais:
- cargas
- embarcações
- negociações
- rastreamento
- impacto
- governo
- admin
- perfil de usuário

## Stack do projeto

- Next.js App Router
- React 19
- TypeScript
- next-intl
- Sass Modules
- dados mock em `.mock-data`
- rotas protegidas
- i18n: `pt-BR`, `en`, `es`

## Regras globais

1. Fazer mudanças pequenas e incrementais.
2. Preservar a arquitetura existente.
3. Manter acessibilidade e responsividade.
4. Não adicionar dependências sem justificativa.
5. Sempre explicar o plano antes de editar.
6. Rodar validações após mudanças.

## Política de testes

Antes de concluir qualquer tarefa, validar no mínimo:

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Quando a mudança tocar regras de negócio, fluxos de usuário ou integrações, também executar:

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Política de PR

- PRs devem ser pequenos e focados.
- Descrever objetivo, escopo e riscos.
- Incluir evidências de validação (lint, typecheck e testes relevantes).
- Destacar impacto em i18n, segurança, permissões e acessibilidade.
- Evitar misturar refatoração ampla com correção funcional no mesmo PR.

## Comandos recomendados

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run check:i18n:hardcoded
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Proibições importantes

- Não reescrever o projeto do zero.
- Não remover i18n.
- Não remover mocks sem fase própria.
- Não adicionar IA antes de segurança, validação e testes.
- Sempre explicar plano antes de editar.
