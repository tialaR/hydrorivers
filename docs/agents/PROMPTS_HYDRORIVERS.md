# Prompts prontos — HydroRivers

Este arquivo centraliza prompts em portugues para uso no Cursor e no Codex.

## 1) Diagnostico no Cursor Ask

```text
Leia AGENTS.md, docs/agents/PROMPTS_HYDRORIVERS.md e todos os arquivos em .cursor/rules.
Nao altere arquivos.
Mapeie riscos, lacunas e inconsistencias no contexto HydroRivers (arquitetura, i18n, testes, seguranca e permissao).
Entregue:
1) diagnostico por severidade,
2) hipoteses de causa,
3) plano seguro por fases pequenas.
```

## 2) Implementacao no Cursor Agent

```text
Atue como agente de implementacao HydroRivers.
Antes de editar, explique plano curto.
Aplique mudancas pequenas e focadas, preservando arquitetura, i18n e mocks.
Nao adicionar dependencias sem justificativa.
Ao final, liste arquivos alterados, riscos e validacoes recomendadas.
```

## 3) Testes unitarios

```text
Atue como agente de testes unitarios HydroRivers.
Crie/atualize testes para funcoes puras, validacoes, formatadores, mapeadores, adapters, regras de negocio, permissoes e helpers de i18n.
Priorize cobertura de casos limite e de erro.
Nao altere codigo de aplicacao fora do necessario para testabilidade.
```

## 4) Testes de integracao

```text
Atue como agente de testes de integracao HydroRivers.
Cubra APIs, auth/session, role/owner, fluxo de cargas, negociacoes, rastreio, i18n e adapters com mock data.
Valide contratos, autorizacao e cenarios de falha.
```

## 5) E2E

```text
Atue como agente E2E HydroRivers.
Foque apenas em fluxos criticos: login/logout, dashboard, cargas, negociacoes, rastreamento, troca de idioma e governo/admin.
Mantenha cenarios curtos, estaveis e independentes.
```

## 6) Seguranca

```text
Atue como agente de seguranca HydroRivers.
Revise autenticacao, autorizacao, validacao, APIs, uploads, dados sensiveis e env vars.
Aponte riscos futuros de IA sem implementar IA nesta fase.
Classifique achados por severidade e impacto.
```

## 7) i18n

```text
Atue como agente de i18n HydroRivers.
Nao permita textos visiveis hardcoded.
Garanta consistencia entre pt-BR, en e es.
Revise navegacao, forms, erros, empty states e dashboards.
Indique execucao de npm run check:i18n.
```

## 8) Revisao de PR

```text
Atue como revisor de PR HydroRivers.
Priorize bugs, regressao, tipagem, i18n, acessibilidade, seguranca, permissoes, testes ausentes e complexidade desnecessaria.
Liste achados por severidade e proponha correcoes objetivas.
```

## 9) Commit

```text
Atue como agente de commit HydroRivers.
Sugira mensagem usando Conventional Commits (feat, fix, refactor, test, docs, chore, perf, ci).
Explique em 1-2 linhas o motivo da mudanca.
```

## 10) Revisao no Codex

```text
Leia AGENTS.md, docs/agents/PROMPTS_HYDRORIVERS.md e todos os arquivos em .cursor/rules.
Nao altere arquivos.
Confirme entendimento de:
1. contexto do projeto
2. regras globais
3. agentes disponiveis
4. ordem segura de trabalho
5. proxima fase recomendada
```
