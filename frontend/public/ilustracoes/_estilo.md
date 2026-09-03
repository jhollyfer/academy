# Ilustrações da landing

TODO: são placeholders. O estilo está fechado, a arte final não.

Regras que a arte definitiva precisa manter, porque a página foi desenhada em
cima delas:

- Line-art com contorno preto de 6px em `viewBox` de 400x300, `stroke-linecap`
  e `stroke-linejoin` redondos.
- Preenchimento chapado, sem gradiente. São **duas** paletas, e o que decide é
  o bloco que hospeda a arte:
  - Sobre bloco claro (nove das dez): azul `#4B8FE3`, laranja `#F2954B`, verde
    `#A8E89B` e o creme `#FBF8F0`, com contorno `#101613`.
  - Sobre o bloco de marca (só `bancada-arduino.svg`, no hero): contorno creme
    `#FBF8F0`, preenchimento no preto esverdeado do bloco e o neon `#88FF9A`
    apenas no que precisa chamar. É a regra de três cores da identidade, e o
    azul e o laranja não entram ali.
- Sem texto dentro do desenho: a página é em português e a arte não pode
  precisar de tradução.
- `viewBox` obrigatório e `width`/`height` ausentes, para o CSS decidir o
  tamanho.
- SVG e não PNG: o público acessa por celular com internet instável, e cada uma
  destas pesa menos que uma miniatura.
