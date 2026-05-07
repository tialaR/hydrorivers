# Cargo Status Assistant (mock-first)

## Objetivo

Explicar, em linguagem operacional, o **status atual de uma carga** na tela de detalhe: resumo, próximos passos sugeridos, bloqueadores, riscos ou alertas, **nível de confiança** da resposta e **origem** (`mock-ai` ou `fallback-rule`). A primeira automação “AI” do HydroRivers nesta fase é **100% server-side**, **determinística** e **sem provedor externo**.

## Escopo

- Endpoint: `POST /api/ai/cargo-status` com corpo JSON `{ "cargoId": string, "locale"?: "pt-BR" | "en-US" | "es" }`.
- Resposta: `{ "data": AiAssistResponse }` onde `AiAssistResponse` inclui `summary`, `nextSteps[]`, `blockers[]`, `risks[]`, `confidence`, `source`.
- UI: card na página `[locale]/cargas/[id]` (`CargoStatusAssistantCard`), com aviso claro de que é **assistência / sugestão**, não decisão automática.

## Limitações

- Não há chamada a OpenAI, Supabase AI ou outro serviço de modelo generativo.
- O assistente **não altera** status, negociação, documentos ou permissões.
- Textos são compostos a partir de **mensagens i18n** + dados públicos da carga já visíveis ao usuário autorizado (ex.: riscos operacionais mockados passam por `translateMock` no servidor).

## Segurança

- **401** se não houver sessão.
- **403** se o usuário não estiver aprovado (`approved`), ou se não tiver escopo na carga:
  - **Admin:** qualquer carga existente no mock.
  - **Embarcador:** apenas cargas com `ownerId === user.id` (cargas sem `ownerId` não recebem assistência nesta fase).
  - **Transportador:** apenas se existir negociação com `cargoId` e `carrierId === user.id`.
- **404** se o `cargoId` não existir no mock **após** autenticação (evita vazar conteúdo a anônimos; usuários autenticados ainda podem inferir existência por 403 vs 404 — trade-off explícito para mensagens claras).
- **400** se o JSON não trouxer `cargoId` string não vazia (`missing-cargo-id`).

## Observabilidade e QA

A rota **`POST /api/ai/cargo-status` não chama `logUseCaseEvent`** — evita ruído no terminal durante navegação normal em dev/mock. O feedback operacional para QA deve vir da [**Mock Mode QA Hub**](MOCK-MODE-QA-HUB.md), da própria UI do assistente e, quando necessário, da aba **Rede** do DevTools (`POST /api/ai/cargo-status`).

Para depuração pontual no terminal em outros pontos do código (ou após instrumentação local), use **`HYDRORIVERS_USE_CASE_LOGS=true`** com `logUseCaseEvent` em `src/shared/observability/use-case-logger.ts` (opt-in estrito em qualquer `NODE_ENV`). O utilitário só imprime quando a flag é `=== 'true'`; `actor`/`context` seguem as regras de sanitização do módulo.

A função `reportDevScenario` permanece no mesmo pacote para cenários dev quando **`HYDRORIVERS_DEV_SCENARIO_LOGS=true`** (e **`HYDRORIVERS_DEV_SCENARIO_VERBOSE=true`** para hints sanitizados); rotas de auth e esta rota **não** a invocam.

## Mock-first e evolução

- Leitura de cargas e negociações via `readMock` / repositório mock, alinhado ao restante da plataforma.
- Serviço isolado em `src/features/ai-assist/services/cargo-status-assistant.ts` para substituir depois por chamada a provedor real mantendo o mesmo contrato `AiAssistResponse` e checagens de acesso na rota.
- `source: mock-ai` indica o pacote i18n por `status` da carga; `source: fallback-rule` indica texto genérico quando o status não tem pacote (compatibilidade / dados legados).

## Validação manual

1. Abrir o detalhe de uma carga com usuário **embarcador** dono da carga ou **transportador** em negociação vinculada (ou **admin**).
2. Confirmar que o card carrega resumo e listas em **pt-BR**, **en-US** ou **es** conforme o locale da UI.
3. Sem login, ver mensagem orientando entrar na conta (401 tratado no cliente).
4. Opcional: inspecionar `POST /api/ai/cargo-status` no DevTools (rede) e validar o JSON de `data`.

## Testes automatizados

- Integração: `tests/integration/api/ai.cargo-status.post.test.ts` (401, 400, 403 escopo, 404, 200, fallback, ausência de `passwordHash` no JSON da resposta).
- Unitário: `tests/unit/features/ai-assist/cargo-status-ai-access.test.ts`, `tests/unit/features/ai-assist/cargo-status-assistant.test.ts` (fonte, bloqueio extra por prontidão documental).
