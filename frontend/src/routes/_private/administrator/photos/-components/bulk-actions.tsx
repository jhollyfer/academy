import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { usePhotoArchive } from '#/integrations/tanstack-query/mutations'
import type { PhotoResponse } from '#/integrations/response'

export function PhotoBulkActions({
  photos,
}: {
  photos: Array<PhotoResponse>
}): React.JSX.Element {
  const archive = usePhotoArchive({
    onError: (error) => toast.error(error.message, { id: 'photos-archive' }),
  })

  return (
    <BulkArchive
      items={photos}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.photos.all}
      verb="arquivadas"
    >
      <ConfirmDialogTitle>Arquivar fotos</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${photos.length} fotos saem da galeria e vão para a lixeira, e podem ser restauradas depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
