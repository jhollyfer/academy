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
 * Na prática são dois valores, e o que decide é o fundo. Sobre bloco escuro ou
 * verde a folha sai clara em `text-primary-foreground/5`; sobre bloco claro ela
 * sai em `text-primary/10`, porque 5% do verde escuro sobre creme não se vê. O
 * que **não** funciona é passar de 20%: `school.tsx` esteve em 40% e a folha
 * deixava de ser textura para virar uma mancha de borda dura no canto.
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

/**
 * As trilhas de circuito do fundo dos blocos de marca.
 *
 * SVG inline e não imagem: são doze traços e sete nós, e o arquivo raster que as
 * artes usam pesa mais que a página inteira. Boa parte do público entra por
 * celular com internet ruim, e essa é a diferença entre a marca aparecer no
 * primeiro paint ou meio segundo depois dele.
 *
 * `vectorEffect="non-scaling-stroke"` em cada traço: o bloco estica o SVG para
 * cobrir a largura toda, e sem isso a linha engrossaria junto - a trilha viraria
 * um risco grosso num monitor largo e um fio invisível no celular.
 *
 * Os nós são os pontos luminosos dos cantos das artes. Ficam em `--neon` com
 * opacidade própria, mais alta que a das trilhas: nas artes eles são o que
 * chama o olho, e uniformizar os dois apagaria a hierarquia.
 *
 * `aria-hidden` e `pointer-events-none`: é textura. Quem lê por leitor de tela
 * não ouve nada, e a trilha não rouba o clique do que estiver por cima.
 */
export function CircuitTrails({
  className,
  ...rest
}: React.ComponentProps<'svg'>): React.JSX.Element {
  return (
    <svg
      data-slot="circuit-trails"
      aria-hidden
      viewBox="0 0 400 300"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        'pointer-events-none absolute inset-0 size-full',
        className,
      )}
      {...rest}
    >
      <g
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
        opacity={0.5}
      >
        <path d="M0 54h96l22 22h74" />
        <path d="M400 38h-72l-18 18h-58" />
        <path d="M0 212h58l26-26h120l18 18h178" />
        <path d="M400 258h-96l-20-20h-84" />
        <path d="M148 300v-46l20-20v-52" />
        <path d="M300 0v38" />
        <path d="M62 0v32l22 22v54" />
        <path d="M352 300v-62l-20-20" />
      </g>

      <g fill="currentColor" opacity={0.9}>
        <circle cx="192" cy="76" r="2.5" />
        <circle cx="252" cy="56" r="2.5" />
        <circle cx="84" cy="108" r="2.5" />
        <circle cx="168" cy="182" r="2.5" />
        <circle cx="284" cy="238" r="2.5" />
        <circle cx="300" cy="38" r="2.5" />
        <circle cx="352" cy="238" r="2.5" />
      </g>
    </svg>
  )
}
