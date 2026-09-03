import type * as React from 'react'

import { cn } from '#/lib/utils'

/**
 * O título de seção da vitrine, no padrão das artes de divulgação: condensado
 * itálico em caixa alta, primeira linha na cor do texto e segunda em destaque.
 *
 * Existe porque as onze seções escreviam a mesma string de nove classes à mão,
 * com três variações que ninguém decidiu de propósito: umas em `text-foreground`,
 * outras em `text-background dark:text-card-foreground`, e o `max-w` oscilando
 * entre 16ch e 18ch sem critério. Um ajuste de tipografia virava onze edições, e
 * a décima segunda seção nascia com a versão anterior.
 *
 * **Duas linhas, por slot e não por prop de texto.** É o padrão da marca, e ele
 * é estrutura do título: a quebra não é conveniência de largura, é onde a cor
 * troca. Um `<br>` some no `text-balance` justamente nas telas estreitas onde a
 * quebra mais importa.
 *
 * O `tone` diz sobre que fundo o título está, e é o que resolve contraste:
 *
 *   page  sobre o fundo do tema. O destaque sai em `--neon-ink`, o verde
 *         escuro, porque o neon puro sobre creme dá 1,3:1 e é ilegível
 *   ink   sobre o bloco de marca. Branco e neon puro, 14,8:1 e 11,8:1
 *   slab  sobre o bloco escuro que inverte com o tema (`bg-foreground`)
 */
type Tone = 'page' | 'ink' | 'slab'

const LEAD: Record<Tone, string> = {
  page: 'text-foreground',
  ink: 'text-white',
  slab: 'text-background dark:text-card-foreground',
}

const ACCENT: Record<Tone, string> = {
  page: 'text-neon-ink dark:text-neon',
  ink: 'text-neon',
  slab: 'text-neon',
}

type SectionTitleProps = {
  tone?: Tone
  /** A primeira linha, na cor do texto. */
  lead: React.ReactNode
  /** A segunda linha, em destaque. */
  accent: React.ReactNode
  className?: string
  /** `h1` nas páginas que abrem com ele; `h2` no resto. */
  as?: 'h1' | 'h2'
}

export function SectionTitle({
  tone = 'page',
  lead,
  accent,
  className,
  as: Tag = 'h2',
}: SectionTitleProps): React.JSX.Element {
  return (
    <Tag
      data-slot="section-title"
      className={cn(
        'brand-title text-heading-lg text-balance sm:text-display-md lg:text-display-lg',
        className,
      )}
    >
      <span className={cn('block', LEAD[tone])}>{lead}</span>
      <span className={cn('block', ACCENT[tone])}>{accent}</span>
    </Tag>
  )
}
