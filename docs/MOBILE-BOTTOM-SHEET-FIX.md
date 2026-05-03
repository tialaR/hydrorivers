# Mobile bottom sheet fix v0.7.9

Correções aplicadas na listagem de cargas:

- Sheet renderizado via React Portal em `document.body`, evitando clipping por containers/stacking contexts.
- Abertura do filtro com `pointerdown`, mais confiável em mobile.
- Snap inicial em quase tela cheia (`full`) e snap secundário (`half`).
- Fechamento por arraste do topo para baixo.
- Scroll lock completo em `html` e `body` enquanto o sheet estiver aberto.
- Fundo sem camada escura; apenas blur pesado com `backdrop-filter`.
- Lista horizontal de filtros rápidos removida no mobile.
