import * as React from 'react'
import { cn } from '#/lib/utils'
import type { CourseAccent } from '#/lib/entity'

/**
 * O card das artes: borda fina no acento, canto chanfrado e glow suave.
 *
 * Compound component com contexto, e não prop repetida em cada parte: o que
 * muda entre um card de robótica e um de web é **uma** decisão - a variante - e
 * ela precisa alcançar o título, o ícone e o rodapé. Passá-la em cada peça
 * seria a mesma informação escrita quatro vezes por card.
 *
 * A variante `filled` é o gesto que a referência usa para criar hierarquia sem
 * mudar de layout: num grupo de quatro cards iguais, **um** vem preenchido em
 * verde sólido com texto escuro, e o olho encontra o que importa antes de ler
 * qualquer palavra. Um por grupo - dois já anulam o efeito.
 */

type NeonCardVariant = 'outline' | 'filled'

type NeonCardContextValue = {
  variant: NeonCardVariant
}

const NeonCardContext = React.createContext<NeonCardContextValue>({ variant: 'outline' })

function useNeonCard(): NeonCardContextValue {
  return React.useContext(NeonCardContext)
}

export function NeonCard({
  variant = 'outline',
  accent,
  className,
  children,
  ...rest
}: {
  variant?: NeonCardVariant
  /**
   * O acento do curso. Vira `data-accent`, que o `styles.css` traduz em
   * `--local-accent` - e não um mapa de classes aqui, porque o valor vem do
   * banco e um mapa obrigaria a tocar no componente a cada curso novo.
   */
  accent?: CourseAccent
} & React.ComponentProps<'div'>): React.JSX.Element {
  const value = React.useMemo(() => ({ variant }), [variant])

  return (
    <NeonCardContext.Provider value={value}>
      <div
        data-slot="neon-card"
        data-accent={accent}
        className={cn(
          'chamfer relative flex flex-col gap-4 p-6 transition-colors',
          variant === 'outline' &&
            'neon-glow bg-card text-card-foreground hover:bg-surface-soft',
          // O preenchido usa o acento do card como fundo e escreve escuro por
          // cima: o neon é claro demais para ser texto, e é exatamente por isso
          // que ele funciona como superfície.
          variant === 'filled' &&
            'bg-[var(--local-accent,var(--accent))] text-[var(--accent-fg)]',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </NeonCardContext.Provider>
  )
}

export function NeonCardIcon({
  className,
  ...rest
}: React.ComponentProps<'div'>): React.JSX.Element {
  const { variant } = useNeonCard()

  return (
    <div
      data-slot="neon-card-icon"
      className={cn(
        'flex size-11 shrink-0 items-center justify-center [&_svg]:size-5',
        variant === 'outline' && 'bg-surface-soft text-[var(--local-accent,var(--accent))]',
        variant === 'filled' && 'bg-[var(--accent-fg)]/10 text-[var(--accent-fg)]',
        className
      )}
      {...rest}
    />
  )
}

export function NeonCardTitle({
  className,
  ...rest
}: React.ComponentProps<'h3'>): React.JSX.Element {
  return (
    <h3
      data-slot="neon-card-title"
      className={cn('font-display text-xl font-bold tracking-tight italic', className)}
      {...rest}
    />
  )
}

export function NeonCardDescription({
  className,
  ...rest
}: React.ComponentProps<'p'>): React.JSX.Element {
  const { variant } = useNeonCard()

  return (
    <p
      data-slot="neon-card-description"
      className={cn(
        'text-sm leading-relaxed',
        variant === 'outline' && 'text-muted-foreground',
        // No preenchido o `--muted-foreground` sumiria: ele foi calibrado
        // contra o card escuro, e sobre o verde chapado dá menos de 2:1.
        variant === 'filled' && 'text-[var(--accent-fg)]/80',
        className
      )}
      {...rest}
    />
  )
}

export function NeonCardFooter({
  className,
  ...rest
}: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="neon-card-footer"
      className={cn('mt-auto flex items-center gap-3 pt-2', className)}
      {...rest}
    />
  )
}
