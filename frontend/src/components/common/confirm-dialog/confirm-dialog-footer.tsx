import type * as React from 'react'

import { useConfirmDialogContext } from './confirm-dialog-context'

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import type { Merge } from '#/lib/interfaces'

/** A linha de botões. Em telas estreitas ela empilha, com a saída por cima. */
export function ConfirmDialogFooter(
  props: React.ComponentProps<typeof AlertDialogFooter>,
): React.JSX.Element {
  return <AlertDialogFooter data-slot="confirm-dialog-footer" {...props} />
}

/**
 * A saída. Sem children escreve "Cancelar", que é o que noventa e quatro das
 * noventa e quatro confirmações do painel dizem.
 */
export function ConfirmDialogCancel({
  children = 'Cancelar',
  ...rest
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
    <AlertDialogCancel
      data-slot="confirm-dialog-cancel"
      render={
        <Button variant="outline" {...rest}>
          {children}
        </Button>
      }
    />
  )
}

type ConfirmDialogConfirmProps = Merge<
  React.ComponentProps<typeof Button>,
  { children: React.ReactNode }
>

/**
 * O botão que confirma.
 *
 * A ação e o peso dela vêm do contexto, não de prop: quem os declara é a tela,
 * no `ConfirmDialog`, e repeti-los aqui daria duas fontes de verdade para a
 * mesma decisão.
 */
export function ConfirmDialogConfirm({
  children,
  ...rest
}: ConfirmDialogConfirmProps): React.JSX.Element {
  const { onConfirm, destructive } = useConfirmDialogContext(
    'ConfirmDialogConfirm',
  )

  let variant: 'destructive' | 'default' = 'default'
  if (destructive) variant = 'destructive'

  return (
    <AlertDialogAction
      data-slot="confirm-dialog-confirm"
      render={
        <Button variant={variant} {...rest}>
          {children}
        </Button>
      }
      onClick={onConfirm}
    />
  )
}
