import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

/**
 * A palavra em serifa itálica dentro de uma pílula.
 *
 * É o gesto que faz a página parecer o sistema da referência, e ele tem uma
 * regra: **uma palavra por título**. Duas pílulas no mesmo `h2` deixam de
 * destacar - viram um jeito de escrever, não um destaque.
 *
 * `whitespace-nowrap` é seguro justamente por isso: uma palavra não tem onde
 * quebrar, e a pílula inteira desce para a linha seguinte como um bloco. Sem
 * ele, a quebra cairia no meio do fundo colorido e partiria a pastilha ao meio
 * em 360px.
 *
 * Tudo em `em` e não em `rem`: a pílula acompanha o tamanho do título em que
 * está, e o mesmo componente serve o `h1` do hero e o `h2` de uma seção sem
 * ganhar prop de tamanho.
 *
 * `leading-none` porque a caixa da pílula já é o que ocupa a linha; a altura
 * vem do `padding`. Com a entrelinha do título por dentro, a pastilha do `h1`
 * encostaria na linha de cima.
 */
const highlightVariants = cva(
  'inline-block rounded-full px-[0.36em] py-[0.06em] font-serif text-[1.02em] leading-none font-normal italic whitespace-nowrap',
  {
    variants: {
      variant: {
        /** Sobre a página e dentro de bloco escuro. O par de `--primary`: 12,58:1. */
        fill: 'bg-primary text-primary-foreground',
        /** Dentro do bloco verde, onde o `fill` sumiria. O mesmo par, virado. */
        ink: 'bg-primary-foreground text-primary',
        /** Quando o fundo já carrega cor e mais um bloco chapado pesaria. */
        outline:
          'border-[1.5px] border-foreground bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'fill',
    },
  },
)

function Highlight({
  className,
  variant = 'fill',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof highlightVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      { className: cn(highlightVariants({ variant }), className) },
      props,
    ),
    render,
    state: {
      slot: 'highlight',
      variant,
    },
  })
}

export { Highlight, highlightVariants }
