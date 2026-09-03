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
 * tema claro, e um botão desse verde sobre a placa daria 1,74:1 de contorno.
 *
 * Ele é o #FAFAFA nos dois temas, escrito com dois nomes diferentes porque a
 * placa muda de cor: no claro ela é `--foreground` e o botão é `--background`;
 * no escuro ela é `--card` e quem vale #FAFAFA passa a ser o `--foreground`.
 * Dá 15,05:1 no claro e 10,83:1 no escuro.
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
        slab: 'border-transparent bg-background text-foreground hover:bg-background/90 hover:text-foreground dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 dark:hover:text-background',
        /** A secundária. Só a borda, para não competir com a pílula ao lado. */
        outline:
          'border-foreground bg-transparent text-foreground hover:bg-foreground/8 hover:text-foreground',
        /**
         * A ação primária dentro de bloco de marca: neon sólido, texto preto,
         * caixa alta. É a barra de CTA das artes de divulgação.
         *
         * Existe porque `ink` e `outline` são construídos sobre `--foreground`,
         * que é quase preto no tema claro: sobre o `--brand-ink` do hero os dois
         * viravam preto sobre preto e o botão sumia. Este par não depende do
         * tema, pelo mesmo motivo do bloco que o hospeda.
         *
         * O texto é `--brand-ink` e não preto puro: é a cor do bloco, então o
         * botão lê como um recorte iluminado dele em vez de um adesivo colado
         * por cima.
         */
        neon: 'border-transparent bg-neon text-brand-ink uppercase tracking-wide hover:bg-neon/90 hover:text-brand-ink',
        /**
         * A secundária dentro de bloco de marca: contorno neon, sem preenchimento.
         */
        'neon-outline':
          'border-neon bg-transparent text-neon hover:bg-neon/10 hover:text-neon',
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
  render,
  nativeButton,
  ...props
}: PillButtonProps): React.JSX.Element {
  /*
    Quase toda pílula desta vitrine é um link: "Garanta sua vaga" leva a
    `/enrollment`, "Ver os cursos" é uma âncora. O `Button` do Base UI assume
    `nativeButton` verdadeiro, e quando o elemento final não é um `<button>` ele
    avisa no console **a cada render** - com a árvore inteira junto. São sete
    botões assim só na home, e o custo não é o aviso: é o console engasgando a
    navegação em desenvolvimento.

    `render` presente significa que quem manda no elemento é a chamada, e o
    padrão passa a ser `false`. Quem quiser um `<button>` de verdade dentro do
    `render` ainda pode dizer `nativeButton` na chamada - por isso a prop é lida
    aqui em vez de ser cravada.
  */
  let isNativeButton = nativeButton
  if (isNativeButton === undefined) isNativeButton = !render

  return (
    <Button
      {...props}
      render={render}
      nativeButton={isNativeButton}
      className={cn(pillVariants({ tone, scale }), className)}
    />
  )
}

export { PillButton, pillVariants }
