# Mock Mode por Use Cases

Esta atualização transforma o mock mode em uma simulação orientada a casos de uso, não apenas em arquivos JSON isolados.

## Casos de uso cobertos

### Auth
- registrar usuário
- login/logout
- obter sessão
- atualizar perfil
- usuários aprovados e não aprovados

### Cargas
- listar cargas
- filtrar cargas
- ver detalhe
- criar carga
- manter owner da carga
- manter status do ciclo operacional

### Negociações
- listar negociações
- criar proposta
- aceitar/rejeitar/cancelar negociação
- atualizar status da carga quando uma proposta é aceita
- manter histórico da negociação

### Embarcações
- listar embarcações
- associar embarcação a operador
- simular disponibilidade, rota e manutenção

### Rastreio
- listar timeline
- vincular eventos a carga e negociação aceita
- simular entregue, em trânsito e pendente

### Dashboard/Admin/Governo/Impacto
- alimentar telas com cenários consistentes
- permitir troca global do estado do mock

## Cenários disponíveis

- `empty-state`: sem cargas, negociações e rastreio.
- `market-active`: marketplace ativo, com cargas abertas e propostas pendentes.
- `negotiation-flow`: fluxo de proposta e aceite.
- `in-transit`: negociação aceita, embarcação em rota e rastreio ativo.
- `completed`: carga entregue e timeline concluída.
- `error-scenarios`: pendências documentais, embarcação em manutenção e usuário não aprovado.

## API de controle do mock mode

### Listar cenários

```bash
curl http://localhost:3000/api/mock-mode
```

### Ativar cenário

```bash
curl -X POST http://localhost:3000/api/mock-mode \
  -H "Content-Type: application/json" \
  -d '{"scenario":"in-transit"}'
```

A troca de cenário sobrescreve os arquivos em `.mock-data` com um estado consistente.

## Entidades relacionadas

```txt
User
 ├── Cargo.ownerId
 ├── Vessel.ownerId
 └── Negotiation.carrierId / shipperId

Cargo
 ├── ownerId
 ├── negotiationIds
 └── TrackingEvent.cargoId

Negotiation
 ├── cargoId
 ├── vesselId
 ├── shipperId
 └── carrierId
```

## Arquivos alterados

- `src/shared/server/mock-scenarios.ts`
- `src/shared/server/mock-db.ts`
- `src/app/api/mock-mode/route.ts`
- `src/app/api/negociacoes/route.ts`
- `src/features/marketplace/domain/marketplace.types.ts`

## Observação

O projeto anexado usa Next `16.2.4` e React `19.0.0`.
