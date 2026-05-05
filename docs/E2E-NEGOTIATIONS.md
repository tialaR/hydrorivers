# Negociações — cobertura E2E e lacunas

## O que a UI faz hoje

- **Lista** (`/negociacoes`): `NegotiationBoard` com links para o detalhe.
- **Detalhe** (`/negociacoes/[id]`): `NegotiationDetail` **somente leitura** — histórico, termos, estágio; **sem** botões para aceitar/rejeitar/cancelar e **sem** formulário que chame `POST /api/negociacoes`.
- **Detalhe da carga** (`/cargas/[id]`): o formulário “Simular proposta” apenas atualiza estado local e toast (`simulateProposal`), **não** persiste negociação.

## O que os testes E2E cobrem

| Área | Cobertura |
|------|-----------|
| UI | Embarcador e transportador abrem lista e detalhe; estágio visível (`negotiation-stage-label`). |
| API com cookie | `POST` bloqueado para embarcador (`403` + `role-not-allowed`). |
| API com cookie | `PATCH` retorna `403` para usuário que não é `shipperId` nem `carrierId`. |
| Fluxo feliz (API + verificação na UI) | Transportador cria proposta (`POST`); embarcador aceita (`PATCH` accepted); navegação ao detalhe mostra estágio **Contrato** após reload. |
| Comportamento atual documentado | `POST` como **admin** retorna **201** (a API só bloqueia explicitamente `role === 'shipper'`). |

## Lacunas (TODO de produto / UI)

1. **Bloquear criação de negociação por admin** no fluxo-alvo: hoje a regra não está na API; alinhar produto + `POST /api/negociacoes` + testes de integração.
2. **Ações de aceitar/rejeitar na UI** ligadas a `PATCH /api/negociacoes` (com feedback i18n e estados de carregamento).
3. **Proposta real a partir da carga** substituindo ou complementando a simulação em `CargoDetail`.

## Onde mais há cobertura

Regras de negócio de `PATCH` / `POST` estão detalhadas em `tests/integration/api/negociacoes.post.test.ts` e `negociacoes.patch.test.ts` (mocks isolados, sem disco).
