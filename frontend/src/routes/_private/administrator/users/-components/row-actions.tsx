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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import {
  RowActions,
  RowActionsArchive,
  RowActionsDelete,
  RowActionsUnarchive,
} from '#/components/common/row-actions'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  useUserArchive,
  useUserDelete,
  useUserUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { ManagedUserResponse } from '#/integrations/response'

type UserRowActionsProps = {
  user: ManagedUserResponse
  /** Só o dono apaga de vez. Vem da rota, que tem a conta em contexto. */
  canDelete: boolean
  /**
   * Se a linha é a de quem está olhando.
   *
   * A `UserPolicy` recusa qualquer alteração do próprio cadastro - arquivar a
   * si mesmo é o caminho mais curto para se trancar do lado de fora do painel.
   * A tela esconde as ações para não oferecer um 403.
   */
  isSelf: boolean
}

export function UserRowActions({
  user,
  canDelete,
  isSelf,
}: UserRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
  }

  const archive = useUserArchive({
    onError: (error) => toast.error(error.message, { id: 'user-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useUserUnarchive({
    onError: (error) => toast.error(error.message, { id: 'user-archive' }),
    onSuccess: invalidate,
  })
  const remove = useUserDelete({
    onError: (error) => toast.error(error.message, { id: 'user-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      <DropdownMenuItem
        render={
          <Link to="/administrator/users/$id" params={{ id: user.id }}>
            <EyeIcon />
            Ver detalhes
          </Link>
        }
      />
      {/* O dono não é editável: a `UserPolicy` recusa, e `isSelf` cobre o caso
          de ele abrir a própria linha. */}
      {!isSelf && (
        <DropdownMenuItem
          render={
            <Link to="/administrator/users/$id/edit" params={{ id: user.id }}>
              <PencilSimpleIcon />
              Editar
            </Link>
          }
        />
      )}
      <CopyIdMenuItem id={user.id} />
      <DropdownMenuSeparator />

      {!isSelf && !user.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(user.id)}>
          <ConfirmDialogTitle>{`Arquivar "${user.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O acesso cai na requisição seguinte, sem esperar o token expirar. A
            conta pode ser restaurada depois, e as matrículas ficam como estão.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}

      {!isSelf && user.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(user.id)}>
          <ConfirmDialogTitle>{`Restaurar "${user.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            A conta volta para a listagem e o acesso é devolvido, com a mesma
            senha de antes.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}

      {/* Apagar só no que já está arquivado: o `delete.use-case.ts` recusa
          usuário vivo, e recusa de novo quando há matrícula vinculada
          (`409 USER_HAS_ENROLLMENTS`). Oferecer o botão fora daí é oferecer um
          erro. */}
      {!isSelf && user.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(user.id)}>
          <ConfirmDialogTitle>{`Remover "${user.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez, com o vínculo de guarda e os tokens de
            acesso. As matrículas ficam, sem dono. Não dá para desfazer.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
