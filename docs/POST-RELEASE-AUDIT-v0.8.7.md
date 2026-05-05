# Post-release audit — v0.8.7

## Metadata

- Audit date: 2026-05-05
- Audited branch: `stabilize/v0.8.7-post-release-audit`
- Base commit (HEAD): `ba930fdef6bafd0b7135fad0f83e1038caccf32e`
- Scope: post-release stability verification (documentation + quality gates), no feature work

## Version and release-note checks

- `package.json` version: `0.8.7` (confirmed)
- `docs/RELEASE-NOTES-v0.8.7.md`: exists and matches shipped scope (proposal visibility by role/status, humanized toasts, toast a11y/i18n close label, docs sync, route contracts cleanup, E2E updates, React 19 cleanup)

## Checks executed

All commands were executed locally on the audited branch.

| Check | Result |
|---|---|
| `npm run check:onboarding` | PASS |
| `npm run check:i18n` | PASS |
| `npm run check:i18n:hardcoded` | PASS (Findings: 0) |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test` | PASS (30 files, 156 tests) |
| `npm run test:e2e` | PASS (33 tests) |

## Unexpected/local file changes after test runs

Current `git status --short` shows:

- `.mock-data/cargoes.json`
- `.mock-data/negotiations.json`
- `.mock-data/scenario.json`

Assessment:

- These files are expected to drift during E2E/mock-mode flows.
- No functional source files under `src/` were changed by the audit activity.
- Recommendation: do **not** include these mock-data files in release-stability commits unless the change is intentional dataset curation.

## TODO/FIXME/HACK/XXX scan

Scan target: `src/`, `tests/`, `docs/`.

Results:

- `src/`: no matches
- `tests/`: no matches
- `docs/`: one intentional planning section in `docs/E2E-NEGOTIATIONS.md` (`"Lacunas (TODO de produto / UI)"`)

Interpretation:

- No code-level critical markers found.
- One explicit documentation TODO list exists and is scoped as roadmap, not regression.

## Documentation consistency spot-check

Reviewed:

- `README.md`
- `docs/PORTFOLIO-CASE.md`
- `docs/RELEASE-NOTES-v0.8.7.md`

Findings:

- No direct contradiction with v0.8.7 release notes.
- Core v0.8.7 claims remain aligned with code/tests:
  - React 19 + `useActionState` cargo publish flow
  - Server Action + `commitPublishCargo` split
  - proposal visibility by role/status
  - toast humanization + i18n/a11y close label
  - route-contract cleanup and E2E stabilization

Minor note:

- `README.md` still uses cautious wording around ownership/coverage in some roadmap-oriented passages; this is conservative rather than contradictory.

## Hardcoded i18n status

- `check:i18n:hardcoded` returned 0 findings.
- No new hardcoded-string regressions detected by current audit scripts.

## Recommendations for v0.8.8 (non-blocking)

1. Keep `.mock-data/*` out of functional PR commits unless explicitly intentional.
2. Continue E2E hardening around negotiation write flows already documented in `docs/E2E-NEGOTIATIONS.md`.
3. Maintain conservative docs language separating implemented vs roadmap (current direction is good).

## Final decision

**Release v0.8.7 is stable.**

- No failing quality gates.
- No failing unit/integration/E2E suites.
- No hotfix required from this audit scope.

