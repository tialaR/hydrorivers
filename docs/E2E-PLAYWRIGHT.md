cat >> docs/agents/E2E-PLAYWRIGHT.md <<'EOF'

---

## Quando criar ou atualizar um teste E2E?

Crie ou atualize testes E2E sempre que houver mudanças em **fluxos reais de usuário** — ou seja, caminhos completos que alguém percorre na aplicação.

Exemplos típicos:

- login / logout
- acesso a rotas privadas
- onboarding
- dashboard
- negociação / cotação
- troca de idioma
- permissões por papel (admin, shipper, carrier)
- qualquer fluxo crítico do negócio

👉 Regra prática:
Se a mudança impacta **o que o usuário faz ou vê na tela**, provavelmente precisa de E2E.

👉 Evite usar E2E para:
- regras muito pequenas
- validações internas
- lógica isolada de backend

Nesses casos, prefira:
- testes unitários (lógica isolada)
- testes de integração (API + regras de autorização)

---

## Relação com testes de integração

Os testes de integração garantem que o **backend está seguro e correto**.

Exemplo atual do projeto:

- `POST /api/mock-mode`
- `PATCH /api/negociacoes`

Esses testes validam respostas como:

- `401` → sem sessão
- `403` → sem permissão
- `200` → usuário autorizado

👉 Importante:

Os testes E2E **não substituem** os testes de integração.

- Integração → garante a regra
- E2E → garante que a UI respeita essa regra

Exemplo:
- Integração valida que um usuário não autorizado recebe `403`
- E2E valida que a UI **não deixa esse usuário executar a ação**

---

## Rotas que merecem cobertura E2E (futuro)

### 🔐 Autenticação

**Rotas:**
- `/login`
- `/logout` (se existir)
- rotas privadas como `/dashboard`

**Cobrir:**
- login válido
- tentativa de acesso sem sessão
- redirect para login
- redirect pós-login
- logout e bloqueio após sair

---

### 🧪 Mock mode / Admin

**API:**
- `/api/mock-mode`

**Cobertura E2E (via UI, se existir):**
- admin consegue alterar cenário mock
- usuário comum não vê ou não consegue executar essa ação

👉 Observação:
A regra de autorização já deve estar garantida por testes de integração.

---

### 🤝 Negociações

**API:**
- `/api/negociacoes`

**UI (se existir):**
- listagem
- detalhe de negociação

**Cobrir:**
- participante consegue interagir
- não participante é bloqueado
- estados da negociação aparecem corretamente

👉 Observação:
A validação de `shipperId` / `carrierId` continua sendo responsabilidade dos testes de integração.

---

### 🌍 Internacionalização (i18n)

**Cobrir:**
- troca de idioma
- textos renderizados corretamente
- persistência do idioma ao navegar ou recarregar

---

## Boas práticas para testes E2E

- Prefira seletores acessíveis:
  - `getByRole`
  - `getByLabel`
  - `getByText`

- Evite:
  - classes CSS (`.btn-primary`, etc.)
  - seletores frágeis

- Não dependa da ordem visual dos elementos

- Use dados estáveis (fixtures / mocks)

- Foque em fluxos críticos — não tente cobrir tudo com E2E

- Não duplique validações já cobertas por integração

---

## Checklist antes de commitar E2E

Sempre rode:

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run test
npm run test:e2e
