# Estrutura de mensagens (next-intl)

## Estado atual

- Um arquivo JSON por locale: `messages/pt-BR.json`, `messages/en.json`, `messages/es.json`.
- Carregamento em `src/core/i18n/request.ts` via `import(\`../../../messages/${locale}.json\`)`.

Namespaces por escopo de rota/layout (exemplos):

- `pages.home.hero`, `pages.home.visualCards`, `pages.home.benefits` — landing page (`/`); componentes em `src/features/home/components/*`.
- `layout.footer` — rodapé global (`AppFooter`, `FooterSocials`).
- `nav`, `metadata`, etc. — demais áreas já existentes.

## Recomendação para PR futuro (arquivos físicos separados)

Quando o volume de chaves crescer:

1. Dividir por domínio em `messages/<locale>/<namespace>.json` (por exemplo `messages/pt-BR/home.json`, `layout.json`).
2. Manter um barrel por locale que faz merge dos fragmentos:

   ```ts
   // exemplo conceitual
   const home = await import(`./messages/${locale}/home.json`);
   const layout = await import(`./messages/${locale}/layout.json`);
   return { default: { ...base, pages: { home: home.default }, layout: layout.default } };
   ```

3. Garantir que o objeto final mantém a mesma forma que `check-i18n.mjs` espera (paridade de chaves entre `pt-BR`, `en`, `es`).
4. Rodar `npm run check:i18n` após qualquer mudança na estratégia de merge.

Até lá, namespaces aninhados no JSON único por locale mantêm o projeto navegável sem aumentar a superfície de configuração do `next-intl`.
