import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { EyeIcon, PencilSimpleIcon } from '@phosphor-icons/react'
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
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  useClassArchive,
  useClassDelete,
  useClassUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { ClassResponse } from '#/integrations/response'

type ClassRowActionsProps = {
  entity: ClassResponse
  /** Só o dono apaga de vez. Vem da rota, que tem a conta em contexto. */
  canDelete: boolean
}

/**
 * O menu da linha: ver, editar, arquivar, restaurar e apagar.
 *
 * O erro vira toast e a linha permanece - `409 CLASS_HAS_ENROLLMENTS` é a
 * recusa mais provável, e ela não é motivo para a tela sumir com o registro.
 */
export function ClassRowActions({
  entity,
  canDelete,
}: ClassRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  // A chave é a raiz do recurso, e não a página corrente: arquivar muda a
  // contagem de toda página e de todo recorte, não só do que está na tela.
  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
  }

  const archive = useClassArchive({
    onError: (error) => toast.error(error.message, { id: 'class-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useClassUnarchive({
    onError: (error) => toast.error(error.message, { id: 'class-archive' }),
    onSuccess: invalidate,
  })
  const remove = useClassDelete({
    onError: (error) => toast.error(error.message, { id: 'class-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      <DropdownMenuItem
        render={
          <Link to="/administrator/classes/$id" params={{ id: entity.id }}>
            <EyeIcon />
            Ver detalhes
          </Link>
        }
      />
      <DropdownMenuItem
        render={
          <Link to="/administrator/classes/$id/edit" params={{ id: entity.id }}>
            <PencilSimpleIcon />
            Editar
          </Link>
        }
      />
      <CopyIdMenuItem id={entity.id} />
      <DropdownMenuSeparator />
      {!entity.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(entity.id)}>
          <ConfirmDialogTitle>{`Arquivar "${entity.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            A turma sai da listagem e deixa de aparecer na matrícula do site. As
            matrículas já feitas continuam onde estão.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}
      {entity.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(entity.id)}>
          <ConfirmDialogTitle>{`Restaurar "${entity.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ela volta para a listagem, na situação em que estava.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}
      {/* Apagar só no que já está arquivado: o `delete.use-case.ts` recusa
          turma viva, e recusa de novo se ela tiver matrícula
          (`409 CLASS_HAS_ENROLLMENTS`). */}
      {entity.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(entity.id)}>
          <ConfirmDialogTitle>{`Remover "${entity.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez. Não dá para desfazer, e só funciona em
            turma sem matrícula.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
