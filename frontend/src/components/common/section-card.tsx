import type * as React from 'react'

import { Card } from '#/components/ui/card'
import { cn } from '#/lib/utils'

/**
 * O card grande da vitrine: curso, professor, benefício, "para quem é".
 *
 * O `Card` de `components/ui` tem dois tamanhos, `default` e `sm`, e os dois são
 * de painel - canto de 8px, respiro de 4 e texto de 12px, que é a medida de uma
 * tabela da secretaria. A landing pede o terceiro: canto de 24px, respiro de 6 e
 * texto de 14px, para o card ocupar meia tela sem parecer uma linha de tabela
 * esticada.
 *
 * Ele mora aqui e não como um `size="lg"` dentro do `Card` porque
 * `components/ui` é o que o `shadcn` entrega, e `shadcn add card` reescreve o
 * arquivo. Já reescreveu, e levou o `size="lg"` junto.
 *
 * O canto grande precisa aparecer também na imagem que abre e na que fecha o
 * card: sem os dois últimos seletores, a foto do professor vira um retângulo de
 * canto reto dentro de uma moldura arredondada.
 */
function SectionCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>): React.JSX.Element {
  return (
    <Card
      {...props}
      className={cn(
        'rounded-card text-sm/relaxed [--card-spacing:--spacing(6)] *:[img:first-child]:rounded-t-card *:[img:last-child]:rounded-b-card',
        className,
      )}
    />
  )
}

export { SectionCard }
