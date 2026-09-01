import type * as React from 'react'

import { cn } from '#/lib/utils'

/**
 * Os tracinhos de brilho ao lado de um título.
 *
 * SVG inline e não arquivo em `public/`: são três traços, e o arquivo custaria
 * uma requisição a mais do que o desenho inteiro ocupa. O mesmo motivo pelo qual
 * os ícones da página vêm do `@phosphor-icons/react` e não de `.svg` solto.
 *
 * `aria-hidden`: é enfeite. Quem lê por leitor de tela ouviria "imagem" no meio
 * de uma frase.
 */
export function Sparkles({
  className,
  ...rest
}: React.ComponentProps<'svg'>): React.JSX.Element {
  return (
    <svg
      data-slot="sparkles"
      aria-hidden
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={cn('pointer-events-none', className)}
      {...rest}
    >
      <path d="M16 3v6" />
      <path d="M5.5 8.5 9.5 12" />
      <path d="M26.5 8.5 22.5 12" />
    </svg>
  )
}

/**
 * A folha grande do fundo de seção.
 *
 * Fica em `--green` com opacidade baixa, atrás do texto. É o que a referência
 * usa para o bloco não ser um retângulo chapado, e a opacidade é o que impede
 * que ele dispute a leitura: acima de uns 20% a curva começa a passar por trás
 * das letras e a atrapalhar quem lê no sol.
 *
 * `pointer-events-none` porque a forma costuma vazar por cima da coluna de
 * texto, e sem isso ela roubaria o clique do link que estivesse embaixo.
 */
export function Leaf({
  className,
  ...rest
}: React.ComponentProps<'svg'>): React.JSX.Element {
  return (
    <svg
      data-slot="leaf"
      aria-hidden
      viewBox="0 0 200 200"
      fill="currentColor"
      className={cn('pointer-events-none absolute', className)}
      {...rest}
    >
      <path d="M186 14C186 14 96 6 50 52 4 98 14 186 14 186s88 10 134-36c46-46 38-136 38-136Z" />
    </svg>
  )
}

/**
 * A pétala, a segunda forma orgânica. Existe para as seções vizinhas não
 * repetirem o mesmo contorno: duas folhas iguais em telas seguidas viram
 * textura, e textura repetida parece erro de layout.
 */
export function Petal({
  className,
  ...rest
}: React.ComponentProps<'svg'>): React.JSX.Element {
  return (
    <svg
      data-slot="petal"
      aria-hidden
      viewBox="0 0 200 200"
      fill="currentColor"
      className={cn('pointer-events-none absolute', className)}
      {...rest}
    >
      <path d="M100 2c54 30 76 68 76 98s-34 58-76 58-76-28-76-58S46 32 100 2Z" />
    </svg>
  )
}
