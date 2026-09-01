import type * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { Merge } from '#/lib/interfaces'

/**
 * A pílula da vitrine: o botão grande e redondo do hero, do banner final e do
 * passo a passo.
 *
 * Ele mora aqui e não em `components/ui/button.tsx` porque aquele diretório é o
 * que o `shadcn` entrega, e `shadcn add button` reescreve o arquivo inteiro sem
 * avisar. Já reescreveu uma vez, e levou junto as quatro variantes de pílula que
 * moravam lá. O que é da Maiyu vive em `common/` e **compõe** o botão de
 * fábrica, que continua sendo quem trata foco, `disabled`, `render` e ícone.
 *
 * Três tons, que são os três lugares onde a página põe um CTA:
 *
 *   ink      sobre a página - o contraste máximo, a ação principal
 *   slab     dentro de bloco escuro, onde o `ink` sumiria: o mesmo par virado
 *   outline  a ação secundária ao lado de uma das duas
 *
 * O `slab` não é verde, e isso é conta, não gosto: `--primary` é #178528 no
 * tema claro, e um botão desse verde sobre o bloco `bg-foreground` (#272221)
 * daria 1,74:1 de contorno. O par invertido dá 15,05:1 nos dois temas.
 *
 * Não há tom para "outline dentro de bloco escuro": a página não usa nenhum
 * hoje, e um quarto tom sem chamada é um tom para alguém manter à toa.
 */
const pillVariants = cva(
  "rounded-full border-[1.5px] font-medium [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      tone: {
        /** Sobre a página clara. 15,05:1 nos dois temas - o par inverte junto. */
        ink: 'border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background',
        /** Dentro de bloco escuro. O par do `ink` virado: 15,05:1 nos dois temas. */
        slab: 'border-transparent bg-background text-foreground hover:bg-background/90 hover:text-foreground',
        /** A secundária. Só a borda, para não competir com a pílula ao lado. */
        outline:
          'border-foreground bg-transparent text-foreground hover:bg-foreground/8 hover:text-foreground',
      },
      scale: {
        md: 'h-10 gap-2 px-5 text-sm',
        lg: 'h-12 gap-2 px-6 text-base',
      },
    },
    defaultVariants: {
      tone: 'ink',
      scale: 'md',
    },
  },
)

/**
 * O resto das props vai para o `Button`, e `variant`/`size` ficam de fora: quem
 * decide os dois é este componente, que é o que ele existe para decidir. Sem o
 * `Omit`, um `variant="link"` esquecido numa chamada passaria pelo tipo e
 * desmontaria a pílula em silêncio.
 */
type PillButtonProps = Merge<
  Omit<React.ComponentProps<typeof Button>, 'variant' | 'size'>,
  VariantProps<typeof pillVariants>
>

function PillButton({
  className,
  tone = 'ink',
  scale = 'md',
  ...props
}: PillButtonProps): React.JSX.Element {
  return (
    <Button
      {...props}
      className={cn(pillVariants({ tone, scale }), className)}
    />
  )
}

export { PillButton, pillVariants }
