# Limpeza e organização do repositório (HydroRivers)

Este guia ajuda a manter branches e refs enxutos, sem apagar trabalho útil. **Não substitui** checagem manual (PRs abertos, etiquetas de release, decisões do time).

## Atualização do snapshot

Os blocos marcados como *snapshot* refletem o estado após `git fetch origin` e comparação com `origin/main`. **Reexecute os comandos abaixo** antes de apagar qualquer branch em equipe.

```bash
git fetch origin --prune
git branch -r --merged origin/main | sed 's/^[[:space:]]*//' | sort
git branch -r --no-merged origin/main | sed 's/^[[:space:]]*//' | grep -v HEAD | sort
```

---

## Branches remotas já incorporadas em `origin/main`

*Snapshot analisado: 2026-05-04.*

Estas refs em `origin/…` aparecem como **totalmente merged** em `origin/main`: o histórico delas já está linearmente contido na linha principal. São **candidatas seguras à remoção no remoto** *desde que*:

- não exista PR ou issue que ainda nomeie a branch;
- você não precise do nome da branch para auditoria ou release;
- `main` (e `dev`, se usado) permaneçam intactos.

**Não apagar por padrão:** `origin/main`, `origin/dev`, `origin/HEAD`.

### Lista de candidatas (remotas merged)

| Prefixo | Branches |
|--------|----------|
| `chore/` | `chore/stabilize-e2e-baseline` |
| `ci/` | `ci/quality-gates-v4` |
| `docs/` | `docs/agents-roadmap`, `docs/agents-roadmap-v3`, `docs/ai-roadmap`, `docs/ai-roadmap-v2`, `docs/ai-roadmap-v3`, `docs/database-planning`, `docs/database-planning-v2`, `docs/database-planning-v4`, `docs/developer-ai-onboarding-v2`, `docs/documents-module`, `docs/documents-module-v2`, `docs/documents-module-v3`, `docs/enterprise-roadmap-v3`, `docs/executive-dashboard`, `docs/executive-dashboard-v2`, `docs/executive-dashboard-v3`, `docs/portfolio-case`, `docs/portfolio-case-v2`, `docs/portfolio-case-v3`, `docs/product-case-guide`, `docs/security-product-decisions` |
| `feature/` | `feature/onboarding-dashboard-v3`, `feature/tracking-timeline`, `feature/tracking-timeline-v2`, `feature/tracking-timeline-v3` |
| `refactor/` | `refactor/repository-boundary`, `refactor/repository-boundary-v2` |
| `security/` | `security/api-audit`, `security/api-audit-2` |
| `test/` | `test/authz-coverage`, `test/authz-coverage-2` |
| `tooling/` | `tooling/onboarding-progress-check-v3` |

Remoção remota (exemplo; troque `nome/da-branch`):

```bash
git push origin --delete nome/da-branch
```

Para várias branches, prefira revisar uma lista gerada pelo comando da seção **Atualização do snapshot**.

---

## Branches remotas *não* merged em `origin/main`

*Snapshot: 2026-05-04.*

Estas refs remotas **não** estão merged em `origin/main`. **Não delete no remoto** sem revisar: podem ter commits únicos, PR em aberto ou ter sido superseded apenas parcialmente.

| Branch | Orientação |
|--------|------------|
| `origin/security/api-error-standards` | Conferir se o conteúdo entrou por outra branch ou cherry-pick; comparar com `main`. |
| `origin/security/api-error-standards-2` | Idem; validar relação com `-2` e com padrões atuais em `main`. |
| `origin/tooling/onboarding-progress-check-v2` | `v3` já está merged; comparar `v2` com `v3` e `main` antes de descartar. |

```bash
git log origin/main..origin/security/api-error-standards --oneline
git log origin/main..origin/tooling/onboarding-progress-check-v2 --oneline
```

---

## Branches locais fora do remoto ou sem upstream

*Snapshot: 2026-05-04.*

Úteis para decidir limpeza **local** (não afeta produção).

| Situação | Branches observadas |
|----------|---------------------|
| **Sem upstream** (`git for-each-ref` sem `upstream`) | `chore/cleanup-branches-v4`, `docs/database-planning-v3`, `docs/developer-ai-onboarding-v2-2`, `refactor/repository-boundary-v3` |
| **Não merged em `origin/main`** | `docs/developer-ai-onboarding-v2-2`, `refactor/repository-boundary-v3`, `security/api-error-standards`, `security/api-error-standards-2`, `tooling/onboarding-progress-check-v2` |

Após remover branches no GitHub, limpe refs locais obsoletas:

```bash
git fetch origin --prune
git branch -vv | grep ': gone]'   # rastreia upstream removido
```

Remoção local segura (só após confirmar que o trabalho está em `main` ou em outro backup):

```bash
git branch -d nome/da-branch        # recusa se houver commits não merged
git branch -D nome/da-branch        # forçar só se tiver certeza
```

---

## Estratégia de limpeza (ordem sugerida)

1. **`git fetch origin --prune`** — alinha `origin/*` e remove referências a branches já apagadas no remoto.
2. **Confirmar branch padrão** — `main` como verdade de merge; alinhar com o time se `dev` continua como integração (no snapshot atual, `main` e `dev` apontam ao mesmo commit).
3. **Listar merged** — `git branch -r --merged origin/main` e excluir `main`, `dev`, `HEAD`.
4. **Checar PRs abertos** — no GitHub, filtrar por branches candidatas antes de `git push origin --delete`.
5. **Tratar não-merged** — revisar diffs e decidir merge, cherry-pick ou descarte documentado.
6. **Limpar local** — apagar branches locais que só duplicam remoto já removido; resolver “gone” com `prune` + `branch -d`.
7. **Opcional: ** `git worktree list` e diretórios antigos de worktree, se existirem.

---

## Boas práticas de branch

- **Uma branch por unidade de trabalho** (PR pequeno, focado), alinhado às regras do projeto.
- **Renomear ou fechar** branches de documentação experimental depois do merge, para não acumular dezenas de `docs/*` com o mesmo tema.
- **Prefixos consistentes:** `feature/`, `fix/`, `docs/`, `chore/`, `ci/`, `test/`, `refactor/`, `security/`, `tooling/` — facilita automação e triagem.
- **Sincronizar antes de abrir PR:** `git fetch origin && git rebase origin/main` (ou merge, conforme política do time).
- **Deletar no remoto após merge** do PR (configuração “auto-delete head branch” no GitHub reduz acúmulo).
- **Não force-push em branch compartilhada** sem alinhamento.

---

## Convenções de sufixo `v1`, `v2`, `v3`, `v4` (adotadas no histórico)

No repositório, iterações do **mesmo tema** costumam aparecer como **novas branches com sufixo de versão**, em vez de reescrever a branch original:

| Sufixo | Uso típico |
|--------|------------|
| **(sem sufixo)** | Primeira proposta ou linha base do tópico (ex.: `docs/ai-roadmap`). |
| **`v2`** | Segunda rodada de PR: refinamento, alinhamento com feedback ou pequena mudança de escopo. |
| **`v3`** | Consolidação ou redefinição mais estável do documento/feature (ex.: `docs/ai-roadmap-v3`, `feature/tracking-timeline-v3`). |
| **`v4`** | Quando ainda há iteração adicional (ex.: `docs/database-planning-v4`, `ci/quality-gates-v4`); indica “quarta variante” nomeada, não necessariamente quarto deploy. |

**Boas práticas com sufixos:**

- Tratar `v4` como **última linha nomeada** daquele *stream* só se o time confirmar; senão, preferir um nome semântico (`…-final`, `…-consolidated`) ou um único doc em `main` após merge.
- Após merge da versão desejada, **as branches antigas do mesmo tema** entram na lista “merged” e podem ser removidas para reduzir ruído.
- Evitar `v2-2` e variações ad hoc; preferir incrementar `v3` ou usar prefixo de escopo (`docs/...-gamified`) para clareza.

---

## Referências rápidas

| Objetivo | Comando |
|----------|---------|
| Branches remotas merged em `main` | `git branch -r --merged origin/main` |
| Branches remotas não merged | `git branch -r --no-merged origin/main` |
| Ver se commit da branch está em `main` | `git merge-base --is-ancestor <sha> origin/main && echo merged` |
| Atualizar lista local após deletes no remoto | `git fetch origin --prune` |

Para integração contínua do que deve passar antes de merge, ver [CI-QUALITY-GATES.md](./CI-QUALITY-GATES.md).
