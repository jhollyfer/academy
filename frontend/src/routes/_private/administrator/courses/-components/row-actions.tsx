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
  useCourseArchive,
  useCourseDelete,
  useCourseUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { CourseResponse } from '#/integrations/response'

type CourseRowActionsProps = {
  course: CourseResponse
  /** Só o dono apaga de vez. Vem da rota, que tem a conta em contexto. */
  canDelete: boolean
}

/**
 * O menu da linha: ver, editar, arquivar, restaurar e apagar.
 *
 * As mutations moram aqui, e não na rota: quem as dispara é este menu, e
 * mantê-las junto dele evita a rota carregar três hooks só para repassá-los.
 *
 * O erro vira toast e a linha permanece - `409 COURSE_HAS_CLASSES` é a recusa
 * mais provável, e ela não é motivo para a tela sumir com o registro.
 */
export function CourseRowActions({
  course,
  canDelete,
}: CourseRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  // A chave é a raiz do recurso, e não a página corrente: arquivar muda a
  // contagem de toda página e de todo recorte, não só do que está na tela.
  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
  }

  const archive = useCourseArchive({
    onError: (error) => toast.error(error.message, { id: 'course-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useCourseUnarchive({
    onError: (error) => toast.error(error.message, { id: 'course-archive' }),
    onSuccess: invalidate,
  })
  const remove = useCourseDelete({
    onError: (error) => toast.error(error.message, { id: 'course-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      <DropdownMenuItem
        render={
          <Link to="/administrator/courses/$id" params={{ id: course.id }}>
            <EyeIcon />
            Ver detalhes
          </Link>
        }
      />
      <DropdownMenuItem
        render={
          <Link to="/administrator/courses/$id/edit" params={{ id: course.id }}>
            <PencilSimpleIcon />
            Editar
          </Link>
        }
      />
      <CopyIdMenuItem id={course.id} />
      <DropdownMenuSeparator />
      {!course.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(course.id)}>
          <ConfirmDialogTitle>{`Arquivar "${course.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O curso sai da vitrine e da listagem, e pode ser restaurado depois.
            As turmas já abertas continuam como estão.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}
      {course.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(course.id)}>
          <ConfirmDialogTitle>{`Restaurar "${course.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ele volta para a listagem, na situação em que estava.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}
      {/* Apagar só aparece no que já está arquivado: o `delete.use-case.ts`
          recusa curso vivo, e recusa de novo se ele tiver turma
          (`409 COURSE_HAS_CLASSES`). Oferecer o botão fora daí é oferecer um
          erro. */}
      {course.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(course.id)}>
          <ConfirmDialogTitle>{`Remover "${course.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez, com a grade, o FAQ e a capa. Não dá
            para desfazer.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
