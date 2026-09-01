import type * as React from 'react'

import { useFormShellContext } from './form-shell-context'

import { Card, CardContent } from '#/components/ui/card'
import { PageShellContent } from '#/components/common/page-shell'
import { cn } from '#/lib/utils'
import type { Merge } from '#/lib/interfaces'

type FormShellContentProps = Merge<
  React.ComponentProps<'form'>,
  { children: React.ReactNode }
>

/**
 * O conteúdo que rola, e o `<form>` de verdade.
 *
 * O `id` vem do contexto porque o `Salvar` mora no cabeçalho fixo, fora desta
 * árvore, e é por ele que o clique alcança o formulário.
 */
export function FormShellContent({
  children,
  ...props
}: FormShellContentProps): React.JSX.Element {
  const { formId } = useFormShellContext('FormShellContent')

  return (
    <PageShellContent>
      <form data-slot="form-shell-content" id={formId} {...props}>
        {children}
      </form>
    </PageShellContent>
  )
}

type FormShellCardProps = Merge<
  React.ComponentProps<typeof CardContent>,
  { children: React.ReactNode }
>

/**
 * Um bloco de campos.
 *
 * `Card` + `CardContent` + a coluna com `gap-4` que todo formulário do painel
 * escrevia à mão. Peça separada e não embutida no `FormShellContent` porque a
 * quantidade varia: uma tela simples tem um, `administrator/companies` tem
 * quatro, e `$company/impact-reports` tem layout próprio e não usa nenhum. Uma
 * prop booleana de escape seria a mesma coisa com um nome pior.
 */
export function FormShellCard({
  className,
  children,
  ...props
}: FormShellCardProps): React.JSX.Element {
  return (
    <Card data-slot="form-shell-card">
      <CardContent className={cn('flex flex-col gap-4', className)} {...props}>
        {children}
      </CardContent>
    </Card>
  )
}
