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
  usePartnerArchive,
  usePartnerDelete,
  usePartnerUnarchive,
} from '#/integrations/tanstack-query/mutations'
import type { PartnerResponse } from '#/integrations/response'

type PartnerRowActionsProps = {
  partner: PartnerResponse
  /** Só o dono apaga de vez. Vem da rota, que tem a conta em contexto. */
  canDelete: boolean
}

export function PartnerRowActions({
  partner,
  canDelete,
}: PartnerRowActionsProps): React.JSX.Element {
  const queryClient = useQueryClient()

  // A chave é a raiz do recurso, e não a página corrente: arquivar muda toda
  // página e todo recorte, não só o que está na tela.
  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.partners.all })
  }

  const archive = usePartnerArchive({
    onError: (error) => toast.error(error.message, { id: 'partner-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = usePartnerUnarchive({
    onError: (error) => toast.error(error.message, { id: 'partner-archive' }),
    onSuccess: invalidate,
  })
  const remove = usePartnerDelete({
    onError: (error) => toast.error(error.message, { id: 'partner-delete' }),
    onSuccess: invalidate,
  })

  return (
    <RowActions>
      <DropdownMenuItem
        render={
          <Link to="/administrator/partners/$id" params={{ id: partner.id }}>
            <EyeIcon />
            Ver detalhes
          </Link>
        }
      />
      <DropdownMenuItem
        render={
          <Link
            to="/administrator/partners/$id/edit"
            params={{ id: partner.id }}
          >
            <PencilSimpleIcon />
            Editar
          </Link>
        }
      />
      <CopyIdMenuItem id={partner.id} />
      <DropdownMenuSeparator />
      {!partner.deletedAt && (
        <RowActionsArchive onConfirm={() => archive.mutate(partner.id)}>
          <ConfirmDialogTitle>{`Arquivar "${partner.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O parceiro sai da faixa da home e da listagem, e pode ser restaurado
            depois.
          </ConfirmDialogDescription>
        </RowActionsArchive>
      )}
      {partner.deletedAt && (
        <RowActionsUnarchive onConfirm={() => unarchive.mutate(partner.id)}>
          <ConfirmDialogTitle>{`Restaurar "${partner.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            Ele volta para a listagem, na situação em que estava.
          </ConfirmDialogDescription>
        </RowActionsUnarchive>
      )}
      {/* Apagar só aparece no que já está arquivado: o `delete.use-case.ts`
          recusa parceiro vivo. Oferecer o botão fora daí é oferecer um erro. */}
      {partner.deletedAt && canDelete && (
        <RowActionsDelete onConfirm={() => remove.mutate(partner.id)}>
          <ConfirmDialogTitle>{`Remover "${partner.name}"?`}</ConfirmDialogTitle>
          <ConfirmDialogDescription>
            O registro é apagado de vez. A logomarca continua em Arquivos, para
            ser apagada de lá se ninguém mais a usar.
          </ConfirmDialogDescription>
        </RowActionsDelete>
      )}
    </RowActions>
  )
}
