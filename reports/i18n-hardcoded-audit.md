# i18n Hardcoded Audit

- Scanned files: 113
- Total findings: 2

## HIGH_CONFIDENCE_UI_TEXT

- Nenhum item detectado.

## NEEDS_REVIEW

- arquivo: `src/features/auth/components/auth-form/auth-form.tsx`
- linha: 138
- tipo encontrado: OBJECT_TEXT
- trecho: `message: "request-failed"`
- recomendação: Revisar se o texto é visível; se sim, mover para mensagens i18n e consumir com next-intl.

## POSSIBLE_MOCK_CONTENT

- arquivo: `src/features/marketplace/data/marketplace.mock.ts`
- linha: 285
- tipo encontrado: OBJECT_TEXT
- trecho: `title: "${template.title} • lote ${index + 2}"`
- recomendação: Revisar se o texto é visível; se sim, mover para mensagens i18n e consumir com next-intl.

## IGNORED_FALSE_POSITIVES_SUMMARY

- object:locale_aware_mock_content: 54
- jsx:already_i18n_usage: 2
- jsx:allowlist_exact: 2
- prop:allowlist_exact: 2
- jsx:type_context: 1
- jsx:numeric_or_symbolic: 1
