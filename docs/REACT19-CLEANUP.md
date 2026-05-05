# React 19 + Server Actions — decisão e roadmap leve

**Tipo:** documentação apenas — **sem** alteração de comportamento do produto.  
**Objetivo:** registrar **por que** o fluxo de publicação de carga está montado assim hoje e **onde** olhar no código; listar **candidatos futuros** sem obrigar migração em massa.

---

## Contexto

- **Stack:** React **19** + Next.js **16** (App Router). Versões exatas em `package.json` / lockfile.
- Este ficheiro **não** é um plano de “migrar tudo para React 19”; o app já corre em React 19. O foco é o padrão **Server Action + `useActionState`** adotado na **publicação de carga**.

---

## Decisão técnica (estado atual)

### Separação de responsabilidades

| Camada | Ficheiro / papel | O que faz (resumo honesto) |
|--------|------------------|----------------------------|
| **UI (cliente)** | `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx` | **`useActionState(publishCargoAction, …)`** liga o `<form>` à Server Action; **validação mínima no cliente** (campos obrigatórios antes de submeter) para feedback rápido e i18n de formulário; **`isPending`** no botão; efeitos colaterais pós-sucesso (toast, evento mock, `router.push`) ficam no cliente. |
| **Server Action** | `src/features/cargo-market/actions/publish-cargo-action.ts` | Entrada única **`'use server'`** para o formulário: resolve **sessão**, **locale** vindo do `FormData`, **`getTranslations`** (servidor) para rótulos auxiliares (ex. rascunho), monta **`Partial<Cargo>`** a partir do form, chama **`commitPublishCargo`**, mapeia falhas para **`PublishCargoActionState`** (idle / success / error com `code`). **Não** duplica a persistência nem as regras de `commitPublishCargo`. |
| **Domínio + persistência + cache** | `src/features/cargos/server/commit-publish-cargo.ts` | **Regras de negócio** para publicar (papel, `approved`, campos obrigatórios no servidor), constrói o **`Cargo`**, **`upsertCargo`**, **`revalidateTag`** / **`revalidatePath`** conforme contratos de cache do módulo. Também usado por **`POST /api/cargas`** — uma única implementação de “publicar” no mock. |

### Por que esta divisão

1. **Um único commit de publicação** (`commitPublishCargo`) evita divergência entre API route e fluxo de formulário.
2. A **Server Action** permanece fina: orquestração + traduções de servidor + mapeamento de estado para o cliente — adequado a **`useActionState`**.
3. O **cliente** continua responsável por UX imediata (loading, erros de formulário, navegação após sucesso) sem misturar revalidate no componente.

### O que já está feito (não tratar como pendência)

- Formulário **nova carga** com **`useActionState`** e **`publishCargoAction`**.
- Persistência/revalidação centralizadas em **`commitPublishCargo`**.

---

## Oportunidades futuras (◇ não implementadas)

Trabalhos **opcionais**, em PRs pequenos, quando houver ganho claro:

| Tema | Notas |
|------|--------|
| **Outros formulários** | Autenticação, perfil, fluxos que hoje usam `fetch` ou padrões diferentes: avaliar **caso a caso** se Server Action + `useActionState` simplifica estado e erros — **não** é meta global. |
| **Progressive enhancement** | Formulário utilizável com JS limitado é **◇** mais exigente no App Router (ações, CSRF, UX); só vale discussão se produto priorizar. |
| **`useFormStatus`** | Extrair subcomponente de **submit** (ex. botão dentro de `<form>`) para **`pending`** explícito no filho — hoje o `Button` usa `loading={isPending}` no pai; refatoração cosmética/arquitetural menor. |
| **UI otimista** | Atualizar lista de cargas ou contadores **antes** da confirmação do servidor pode melhorar perceção no mock; exige **reversão** em erro e testes — só onde o risco de inconsistência for aceitável. |
| **Outras APIs do React 19** | Adotar novos hooks ou padrões **só** quando resolvem um problema concreto (performance, DX), não por checklist. |

---

## O que este documento **não** cobre

- Refatoração ampla de **todos** os formulários.
- Mudança de contratos HTTP, i18n ou regras de **`commitPublishCargo`**.
- Substituir **APIs REST** existentes por Server Actions sem decisão de produto explícita.

---

## Referências

- `docs/NEXT16-APP-ROUTER-CLEANUP.md` — boundaries, loading, streaming; secção sobre formulários / Server Actions.
- `docs/SECURITY-PRODUCT-DECISIONS.md` / `docs/API-SECURITY-AUDIT.md` — regras de sessão e papel na publicação.
- `docs/PORTFOLIO-CASE.md` / `docs/ENTERPRISE-ROADMAP.md` — contexto MVP e mock.

*Ao atualizar este doc, validar rapidamente no código: `new-cargo-form.tsx`, `publish-cargo-action.ts`, `commit-publish-cargo.ts`.*
