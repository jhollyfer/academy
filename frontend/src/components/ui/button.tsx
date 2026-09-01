import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',

        // As pílulas da landing.
        //
        // Vivem aqui, e não num componente à parte, pelo mesmo motivo que a
        // escala semântica do `Badge` vive no `Badge`: são o mesmo botão com
        // outra roupa, e um segundo componente daria dois lugares para corrigir
        // o dia em que o foco ou o estado desabilitado mudasse.
        //
        // O tamanho não vem junto: é o eixo `size`, com `pill` e `pill-lg`. Um
        // CTA de landing precisa de área de toque de polegar, e as alturas do
        // painel (`h-7`) são a densidade certa para tabela e a errada para cá.
        pill: 'bg-ink text-cream hover:bg-ink/90',
        'pill-green':
          'bg-green text-ink hover:bg-green/85 focus-visible:border-neon focus-visible:ring-neon/40',
        'pill-outline': 'border-ink bg-transparent text-ink hover:bg-ink/8',
        // A secundária dentro de bloco escuro, onde a borda ink desapareceria.
        'pill-outline-light':
          'border-cream/40 bg-transparent text-cream hover:bg-cream/10 focus-visible:border-neon focus-visible:ring-neon/40',
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-4",

        // `rounded-full` vence o `rounded-md` da base pelo `cn`, que é
        // `tailwind-merge`: a última classe do mesmo grupo é a que fica.
        // `border-[1.5px]` porque 1px de contorno numa pílula desta altura
        // parece traço de tabela, e 2px parece botão desabilitado.
        pill: "h-11 gap-2 rounded-full border-[1.5px] px-5 text-sm [&_svg:not([class*='size-'])]:size-4",
        'pill-lg':
          "h-13 gap-2 rounded-full border-[1.5px] px-7 text-base [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
