import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useClassArchive } from '#/integrations/tanstack-query/mutations'
import type { ClassResponse } from '#/integrations/response'

/** As ações da barra de seleção. Só arquivar: remover em massa não existe. */
export function ClassBulkActions({
  entities,
}: {
  entities: Array<ClassResponse>
}): React.JSX.Element {
  const archive = useClassArchive({
    onError: (error) => toast.error(error.message, { id: 'classes-archive' }),
  })

  return (
    <BulkArchive
      items={entities}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.classes.all}
      verb="arquivadas"
    >
      <ConfirmDialogTitle>Arquivar turmas</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${entities.length} turmas saem da listagem e da matrícula do site, e podem ser restauradas depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
