import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useEnrollmentArchive } from '#/integrations/tanstack-query/mutations'
import type { EnrollmentResponse } from '#/integrations/response'

/**
 * As ações da barra de seleção. Só arquivar: confirmar e cancelar em massa não
 * existem de propósito - as duas exigem olhar o comprovante de cada um, e um
 * botão que confirma trinta de uma vez é o caminho mais curto para confirmar
 * quem não pagou.
 */
export function EnrollmentBulkActions({
  enrollments,
}: {
  enrollments: Array<EnrollmentResponse>
}): React.JSX.Element {
  const archive = useEnrollmentArchive({
    onError: (error) =>
      toast.error(error.message, { id: 'enrollments-archive' }),
  })

  return (
    <BulkArchive
      items={enrollments}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.enrollments.all}
      verb="arquivadas"
    >
      <ConfirmDialogTitle>Arquivar matrículas</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${enrollments.length} matrículas saem da fila e podem ser restauradas depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
