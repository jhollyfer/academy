import type * as React from 'react'
import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import {
  ConfirmDialog,
  ConfirmDialogCancel,
  ConfirmDialogConfirm,
  ConfirmDialogFooter,
  ConfirmDialogHeader,
} from '#/components/common/confirm-dialog'
import { DropdownMenuItem } from '#/components/ui/dropdown-menu'
import type { Merge } from '#/lib/interfaces'

type RowActionsItemProps = {
  /** A mutation da linha, já com o id: `() => archive.mutate(row.id)`. */
  onConfirm: () => void
  /**
   * `ConfirmDialogTitle` e `ConfirmDialogDescription`.
   *
   * O texto fica com a tela porque é dela: metade das listagens diz o efeito
   * concreto ("sai da vitrine junto com os produtos dela") e a outra metade a
   * frase genérica. Fixar aqui obrigaria a genérica em todas.
   */
  children: React.ReactNode
}

/**
 * Arquivar a linha. Só aparece no que ainda não está arquivado.
 *
 * `closeOnClick={false}` porque o item abre um diálogo: fechar o menu no
 * clique levaria o diálogo embora junto.
 */
export function RowActionsArchive({
  onConfirm,
  children,
}: RowActionsItemProps): React.JSX.Element {
  return (
    <ConfirmDialog
      onConfirm={onConfirm}
      trigger={
        <DropdownMenuItem data-slot="row-actions-archive" closeOnClick={false}>
          <ArchiveIcon />
          Arquivar
        </DropdownMenuItem>
      }
    >
      <ConfirmDialogHeader>{children}</ConfirmDialogHeader>
      <ConfirmDialogFooter>
        <ConfirmDialogCancel />
        <ConfirmDialogConfirm>Arquivar</ConfirmDialogConfirm>
      </ConfirmDialogFooter>
    </ConfirmDialog>
  )
}

/** Tirar a linha da lixeira. Só aparece no que está arquivado. */
export function RowActionsUnarchive({
  onConfirm,
  children,
}: RowActionsItemProps): React.JSX.Element {
  return (
    <ConfirmDialog
      onConfirm={onConfirm}
      trigger={
        <DropdownMenuItem
          data-slot="row-actions-unarchive"
          closeOnClick={false}
        >
          <ArrowCounterClockwiseIcon />
          Restaurar
        </DropdownMenuItem>
      }
    >
      <ConfirmDialogHeader>{children}</ConfirmDialogHeader>
      <ConfirmDialogFooter>
        <ConfirmDialogCancel />
        <ConfirmDialogConfirm>Restaurar</ConfirmDialogConfirm>
      </ConfirmDialogFooter>
    </ConfirmDialog>
  )
}

type RowActionsDeleteProps = Merge<
  RowActionsItemProps,
  {
    /**
     * O rótulo do item no menu. Duas listagens dizem "Remover" onde as outras
     * quinze dizem "Excluir" - é a única diferença, e não vale um slot só para
     * ela. O botão do diálogo é "Remover" nas dezessete.
     */
    label?: string
  }
>

/**
 * Apagar a linha de vez. Só no que já está arquivado e só para quem pode.
 *
 * O use-case recusa o registro vivo com 409 e a mensagem "arquive antes de
 * apagar" (RN-04): oferecer o item fora daí é oferecer um erro.
 */
export function RowActionsDelete({
  onConfirm,
  label = 'Excluir',
  children,
}: RowActionsDeleteProps): React.JSX.Element {
  return (
    <ConfirmDialog
      destructive
      onConfirm={onConfirm}
      trigger={
        <DropdownMenuItem
          data-slot="row-actions-delete"
          variant="destructive"
          closeOnClick={false}
        >
          <TrashIcon />
          {label}
        </DropdownMenuItem>
      }
    >
      <ConfirmDialogHeader>{children}</ConfirmDialogHeader>
      <ConfirmDialogFooter>
        <ConfirmDialogCancel />
        <ConfirmDialogConfirm>Remover</ConfirmDialogConfirm>
      </ConfirmDialogFooter>
    </ConfirmDialog>
  )
}
