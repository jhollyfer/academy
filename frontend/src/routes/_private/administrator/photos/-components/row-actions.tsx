import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { PencilSimpleIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'

import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { CopyIdMenuItem } from '#/components/common/copy-id-menu-item'
import {
  RowActions,
  RowActionsArchive,
  RowActionsDelete,
  RowActionsUnarchive,
} from '#/components/common/row-actions'
import { DropdownMenuItem, DropdownMenuSeparator } from '#/components/ui/dropdown-menu'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  usePhotoArchive,
  usePhotoDelete,
  usePhotoUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { PhotoResponse } from '#/integrations/response'

type PhotoRowActionsProps = {
  photo: PhotoResponse
  canDelete: boolean
}

export function PhotoRowActions({
  photo,
  canDelete,
}: PhotoRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.photos.all })
  }

  const archive = usePhotoArchive({
    onError: (error) => toast.error(error.message, { id: 'photo-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = usePhotoUnarchive({
    onError: (error) => toast.error(error.message, { id: 'photo-archive' }),
    onSuccess: invalidate,
  })
  const remove = usePhotoDelete({
    onError: (error) => toast.error(error.message, { id: 'photo-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      {/* Sem "ver detalhes": a foto é o conteúdo inteiro, e a miniatura da
          listagem já a mostra. Uma ficha para repetir imagem e legenda seria
          um clique a mais para ver o que já está na tela. */}
      <DropdownMenuItem
        render={
          <Link to="/administrator/photos/$id/edit" params={{ id: photo.id }}>
            <PencilSimpleIcon />
            Editar
          </Link>
        }
      />
      <CopyIdMenuItem id={photo.id} />
      <DropdownMenuSeparator />
      {!photo.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(photo.id)}>
          <ConfirmDialogTitle>Arquivar foto?</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ela sai da galeria do site e pode ser restaurada depois.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}
      {photo.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(photo.id)}>
          <ConfirmDialogTitle>Restaurar foto?</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ela volta para a galeria, na situação em que estava.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}
      {photo.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(photo.id)}>
          <ConfirmDialogTitle>Remover foto?</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez. O arquivo continua em Arquivos, e só
            depois disso pode ser apagado de lá.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
