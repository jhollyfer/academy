import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useUserArchive } from '#/integrations/tanstack-query/mutations'
import type { ManagedUserResponse } from '#/integrations/response'

/**
 * As ações da barra de seleção. Só arquivar: remover em massa não existe.
 *
 * Nem a própria conta nem a do dono chegam aqui - as caixas delas nascem
 * desabilitadas pelo predicado de `selectable` em `table.tsx`. É o que permite
 * ter ação em massa num recurso onde um clique errado tira o acesso de várias
 * pessoas: o que não pode ser desfeito por quem clicou não entra na seleção.
 */
export function UserBulkActions({
  users,
}: {
  users: Array<ManagedUserResponse>
}): React.JSX.Element {
  const archive = useUserArchive({
    onError: (error) => toast.error(error.message, { id: 'users-archive' }),
  })

  return (
    <BulkArchive
      items={users}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.users.all}
      verb="arquivadas"
    >
      <ConfirmDialogTitle>Arquivar usuários</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${users.length} conta(s) perdem o acesso na requisição seguinte e saem da listagem. Podem ser restauradas depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
