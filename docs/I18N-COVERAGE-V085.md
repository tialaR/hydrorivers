# HydroRivers v0.8.5 — i18n coverage

Esta versão amplia a internacionalização para viabilizar UX consistente em:

- Português (`pt-BR`)
- Inglês (`en`)
- Espanhol (`es`)

## Escopo aplicado

Foram internacionalizados textos de UI e textos operacionais mockados exibidos em:

- marketplace de cargas;
- cards de cargas;
- detalhes de carga;
- embarcações;
- detalhes de embarcação;
- negociações;
- detalhes de negociação;
- rastreio;
- dashboard;
- governo;
- formulários de login, cadastro, perfil e nova carga.

## Exceções intencionais

Conforme regra do produto, os seguintes itens podem permanecer no idioma original:

- origem;
- destino;
- nomes próprios de cargas/empresas/embarcações;
- siglas/documentos oficiais quando a sigla é a nomenclatura de negócio, como NF-e, CT-e, DOF, ANTAQ e POD.

## Observação técnica

O conteúdo mockado dinâmico é traduzido via `src/shared/i18n/mock-content.ts`, usando:
- mapeamentos exatos;
- padrões para datas, janelas e ETA;
- fallback seguro para nomes próprios e campos não mapeados.
