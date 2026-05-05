# Mock Mode QA Hub — HydroRivers

## Objetivo

Dar aos QA e stakeholders uma **superfície visual** para testar o produto em dados mock, reduzindo dependência de logs no terminal e de memorizar credenciais. O hub vive no painel **Mock mode** (botão flutuante **M**) visível apenas em ambientes não production (ou quando flags de force para CI/E2E estão ativas).

## Contas demo disponíveis

| Persona | E-mail | Senha mock | Papel | Aprovado |
|---------|--------|------------|-------|----------|
| Tiala Rocha | tiala@hydrorivers.com | hydro123 | Embarcador | sim |
| João Navegante | joao@naveganorte.com | hydro123 | Transportador | sim |
| Carlos Hidrovias Madeira | carlos@hidroviasmadeira.com | hydro123 | Transportador | sim |
| Ana RiosLog | ana@rioslog.com | hydro123 | Transportador | não |
| Admin HydroRivers | admin@hydrorivers.com | hydro123 | Admin | sim |

Fonte de verdade dos dados: `.mock-data/users.json` e `src/features/auth/data/auth.mock.ts`. Os cartões espelham essa massa.

## Diferença entre os dois botões

1. **Usar no login**  
   Grava e-mail e senha demo em `sessionStorage` e recarrega a rota de login do locale atual para o formulário ler os valores. **Não** chama a API de login nem cria sessão. Serve para validar o fluxo normal com OTP.

2. **Entrar como este usuário**  
   Chama `POST /api/mock-mode/login-as` com `userId` do perfil demo. Em ambientes não production (ou com `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` no CI/E2E), o servidor define o cookie `hydrorivers_session` como no login após OTP — **sem OTP**. A resposta inclui `redirectTo`; a UI mostra feedback (~1,4 s) e redireciona para esse caminho.

   _(Existe também `POST /api/auth/qa-direct-login` por e-mail, na lista branca QA; o hub usa `login-as`.)_

## Cargo Status Assistant — como testar por persona

- **Tiala:** Abra uma carga da qual ela é owner; espere card do assistente com resumo, próximos passos, riscos e origem `mock-ai` quando houver pacote i18n para o status.
- **João / Carlos:** Com negociação vinculada à carga e ao `carrierId` correto, assistente autorizado; sem vínculo, bloqueio (403 no endpoint).
- **Ana:** Conta não aprovada — esperar bloqueio do assistente por moderação antes do escopo da carga.
- **Admin:** Pode usar qualquer carga existente no mock para smoke do assistente.

## Bloqueios e validações

- **Embarcador sem owner da carga:** assistente negado por escopo.
- **Transportador sem negociação:** mensagens de bloqueio alinhadas a `explainCargoStatusAssistDenial` (testes unitários).
- **Transportador em moderação (Ana):** fluxos privados devem refletir `approved=false`.

## Logs no terminal

**O terminal não é a interface principal de QA.** Prefira este hub, a UI e o DevTools (rede).

Por padrão o projeto **não** imprime:

- `logUseCaseEvent` — só onde o código chamar o utilitário **e** `HYDRORIVERS_USE_CASE_LOGS=true`. A rota `POST /api/ai/cargo-status` **não** invoca `logUseCaseEvent` (menos ruído ao navegar).
- `reportDevScenario` — só se `HYDRORIVERS_DEV_SCENARIO_LOGS=true` (função mantida para opt-in).

Os fluxos de auth e Cargo Status Assistant **não** chamam `reportDevScenario`; use as flags acima só para depuração pontual após instrumentar ou em outros handlers que decidirem usar o reporter.

## Variáveis de ambiente

| Variável | Função |
|----------|--------|
| `HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN` | Em não production: `false` desativa login direto do hub (default permitido). Ignorado se force estiver ligado. |
| `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN` | **Somente pipelines controlados.** Permite `qa-direct-login` e **`/api/mock-mode/login-as`** com `NODE_ENV=production` (Playwright). **Nunca** em produção real. |
| `HYDRORIVERS_FORCE_MOCK_QA_UI` | **Somente pipelines controlados.** Mostra o painel Mock mode em build production-like (Playwright). **Nunca** em produção real. |
| `HYDRORIVERS_USE_CASE_LOGS` | `true` só onde `logUseCaseEvent` é chamado (Cargo Status Assistant não usa). |
| `HYDRORIVERS_DEV_SCENARIO_LOGS` / `HYDRORIVERS_DEV_SCENARIO_VERBOSE` | Reporter de cenário no terminal (verbose opcional). |

Ver também `.env.example` e [`docs/ENVIRONMENT.md`](ENVIRONMENT.md).

## Garantias de segurança

- Login direto por **`/api/mock-mode/login-as`** não existe em `NODE_ENV=production` salvo `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` (uso restrito a CI).
- Lista branca de e-mails limitada a `MOCK_QA_PERSONAS` (`src/shared/qa/mock-qa-personas.ts`).
- Fluxo real com OTP permanece em `POST /api/auth/login`; nenhuma regra de negócio foi alterada no MVP mock.

## Documentação relacionada

- [`docs/QA-TEST-MATRIX.md`](QA-TEST-MATRIX.md)
- [`docs/AI-CARGO-STATUS-ASSISTANT.md`](AI-CARGO-STATUS-ASSISTANT.md)
- [`docs/MOCK-MODE-USE-CASES.md`](MOCK-MODE-USE-CASES.md)
