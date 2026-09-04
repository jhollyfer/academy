import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { usePartnerArchive } from '#/integrations/tanstack-query/mutations'
import type { PartnerResponse } from '#/integrations/response'

/** As ações da barra de seleção. Só arquivar: remover em massa não existe. */
export function PartnerBulkActions({
  partners,
}: {
  partners: Array<PartnerResponse>
}): React.JSX.Element {
  const archive = usePartnerArchive({
    onError: (error) => toast.error(error.message, { id: 'partners-archive' }),
  })

  return (
    <BulkArchive
      items={partners}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.partners.all}
      verb="arquivados"
    >
      <ConfirmDialogTitle>Arquivar parceiros</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${partners.length} parceiros saem da vitrine e vão para a lixeira, e podem ser restaurados depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
