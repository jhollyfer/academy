import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { EyeIcon } from '@phosphor-icons/react'
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
  useEnrollmentArchive,
  useEnrollmentDelete,
  useEnrollmentUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { EnrollmentResponse } from '#/integrations/response'

type EnrollmentRowActionsProps = {
  enrollment: EnrollmentResponse
  /** Só o dono apaga de vez. Vem da rota, que tem a conta em contexto. */
  canDelete: boolean
}

/**
 * O menu da linha: ver, arquivar, restaurar e apagar.
 *
 * Sem "Editar": a matrícula não se edita campo a campo, ela **transita** de
 * situação - e a transição vive na ficha, onde o comprovante do Pix está à
 * vista de quem confirma. Um formulário de edição aqui deixaria alguém trocar o
 * nome do aluno sem olhar o documento.
 */
export function EnrollmentRowActions({
  enrollment,
  canDelete,
}: EnrollmentRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all })
  }

  const archive = useEnrollmentArchive({
    onError: (error) =>
      toast.error(error.message, { id: 'enrollment-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useEnrollmentUnarchive({
    onError: (error) =>
      toast.error(error.message, { id: 'enrollment-archive' }),
    onSuccess: invalidate,
  })
  const remove = useEnrollmentDelete({
    onError: (error) => toast.error(error.message, { id: 'enrollment-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      <DropdownMenuItem
        render={
          <Link
            to="/administrator/enrollments/$id"
            params={{ id: enrollment.id }}
          >
            <EyeIcon />
            Ver detalhes
          </Link>
        }
      />
      <CopyIdMenuItem id={enrollment.id} />
      <DropdownMenuSeparator />
      {!enrollment.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(enrollment.id)}>
          <ConfirmDialogTitle>{`Arquivar a matrícula de ${enrollment.studentName}?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ela sai da fila da secretaria e pode ser restaurada depois. A vaga
            que ela ocupava continua ocupada - quem devolve vaga é o
            cancelamento, na ficha.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}
      {enrollment.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(enrollment.id)}>
          <ConfirmDialogTitle>{`Restaurar a matrícula de ${enrollment.studentName}?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ela volta para a fila, na situação em que estava.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}
      {enrollment.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(enrollment.id)}>
          <ConfirmDialogTitle>{`Remover a matrícula de ${enrollment.studentName}?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez, com o comprovante anexado. Não dá para
            desfazer.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
