import * as React from 'react'

import { ConfirmDialogProvider } from './confirm-dialog-context'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'

type ConfirmDialogProps = {
  /**
   * O elemento visível que abre o alerta - em geral um `DropdownMenuItem` com
   * `closeOnClick={false}`, porque sem isso o menu fecha e leva o gatilho antes
   * do alerta aparecer.
   *
   * Segue prop e não slot: é o elemento de **fora** do dialog, e a primitiva
   * precisa dele na posição de `render` para herdar os handlers de abertura.
   */
  trigger: React.ReactElement
  onConfirm: () => void
  /** Ação sem volta pinta o botão de confirmar de vermelho. */
  destructive?: boolean
  children: React.ReactNode
}

/**
 * A confirmação de toda ação que remove ou arquiva.
 *
 * `AlertDialog` e não `Dialog`: o alerta não fecha ao clicar fora nem no Esc, e
 * é essa a diferença que importa aqui - um clique distraído fora do dialog não
 * pode ser a resposta a "apagar de vez?".
 *
 * As partes são finas de propósito. Foco, Esc, portal e ARIA continuam sendo do
 * `ui/alert-dialog`, que já é compound; o que se acrescenta aqui é só o texto
 * virar slot, para a tela fora da curva pôr um `<Alert>` ou um `<Checkbox>` na
 * descrição sem que isso vire mais uma prop opcional para as outras noventa.
 */
export function ConfirmDialog({
  trigger,
  onConfirm,
  destructive = false,
  children,
}: ConfirmDialogProps): React.JSX.Element {
  // Sem `useMemo` o objeto é novo a cada render da tela e o botão de confirmar
  // re-renderiza junto, mesmo com a ação igual.
  const value = React.useMemo(
    () => ({ onConfirm, destructive }),
    [onConfirm, destructive],
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <ConfirmDialogProvider value={value}>{children}</ConfirmDialogProvider>
      </AlertDialogContent>
    </AlertDialog>
  )
}
