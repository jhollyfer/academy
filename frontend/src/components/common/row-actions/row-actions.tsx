import type * as React from 'react'
import { DotsThreeIcon } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'

/**
 * O menu de uma linha da tabela.
 *
 * O casco é o mesmo nas vinte e nove listagens - o mesmo gatilho de três
 * pontos, o mesmo grupo, o mesmo rótulo "Ações", o mesmo separador. Só a
 * largura variava, e por isso ela é a única coisa que continua chegando de
 * fora.
 *
 * Não há contexto: os itens não leem estado nenhum do casco, cada um se basta
 * com o `onConfirm` que a tela lhe dá.
 */
export function RowActions({
  className,
  children,
  ...rest
}: React.ComponentProps<typeof DropdownMenuContent>): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Abrir ações">
            <DotsThreeIcon weight="bold" />
          </Button>
        }
      />
      <DropdownMenuContent
        data-slot="row-actions"
        className={cn('w-48', className)}
        {...rest}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {children}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
