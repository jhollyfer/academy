import type * as React from 'react'
import { toast } from 'sonner'

import { BulkArchive } from '#/components/common/bulk-archive'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useCourseArchive } from '#/integrations/tanstack-query/mutations'
import type { CourseResponse } from '#/integrations/response'

/** As ações da barra de seleção. Só arquivar: remover em massa não existe. */
export function CourseBulkActions({
  courses,
}: {
  courses: Array<CourseResponse>
}): React.JSX.Element {
  const archive = useCourseArchive({
    onError: (error) => toast.error(error.message, { id: 'courses-archive' }),
  })

  return (
    <BulkArchive
      items={courses}
      action={(item) => archive.mutateAsync(item.id)}
      queryKey={queryKeys.courses.all}
      verb="arquivados"
    >
      <ConfirmDialogTitle>Arquivar cursos</ConfirmDialogTitle>
      <ConfirmDialogDescription>{`${courses.length} cursos saem da vitrine e vão para a lixeira, e podem ser restaurados depois.`}</ConfirmDialogDescription>
    </BulkArchive>
  )
}
