# HydroRivers v0.8.7

## Highlights

- Finaliza a regra de visibilidade de propostas por perfil/status.
- Adiciona toasts humanizados por status/contexto.
- Corrige i18n/a11y do botão de fechar toast.
- Sincroniza documentação com ownership, `/minhas-cargas` e React 19.
- Finaliza adoção de route contracts em call sites remanescentes.
- Adiciona cobertura E2E para visibilidade de proposta no detalhe da carga.
- Documenta cleanup React 19/useActionState.
- Atualiza o case de portfólio.
- Atualiza o E2E de publicação de carga para o fluxo com Server Action.

## Product

- Shipper dono não envia proposta para a própria carga.
- Carrier aprovado pode enviar proposta.
- Carrier pendente/não aprovado recebe mensagem de aprovação/moderação.
- Admin não envia proposta operacional.
- Publicação de carga segue o fluxo com React 19 Server Action/useActionState.

## Engineering

- Melhor centralização de mensagens de toast.
- Menos strings hardcoded de rota.
- Documentação técnica mais alinhada ao estado real do código.
- Cobertura de testes ampliada.
- E2E de publicação alinhado ao fluxo atual sem depender de `POST /api/cargas`.

## Validation

- `npm run check:onboarding`
- `npm run check:i18n`
- `npm run check:i18n:hardcoded`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
