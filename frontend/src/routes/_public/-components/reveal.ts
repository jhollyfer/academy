/**
 * A entrada das seções ao rolar.
 *
 * Classe do `tw-animate-css` e não `motion/react`: a landing tinha a biblioteca
 * inteira no bundle para fazer um `fade` com deslocamento, que são duas linhas
 * de CSS. Num celular em 4G instável a diferença não é estética, é o tempo até a
 * página responder ao dedo.
 *
 * `[animation-fill-mode:both]` porque a entrada é atrasada: sem ele o bloco
 * apareceria inteiro, sumiria e voltaria no fim do atraso.
 *
 * `motion-reduce:animate-none` para quem pediu menos movimento. A regra global
 * do `styles.css` já zera a duração, e esta impede o estado inicial de deixar a
 * seção invisível quando a animação é anulada.
 */
export const REVEAL =
  'animate-in fade-in-0 slide-in-from-bottom-4 duration-700 [animation-fill-mode:both] motion-reduce:animate-none'

/** O atraso entre um item e o seguinte, em milissegundos. */
export const STAGGER = 80
