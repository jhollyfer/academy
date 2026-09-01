import { createFileRoute } from '@tanstack/react-router'
import { enrollmentDetailQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/admin/matriculas/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(enrollmentDetailQueryOptions(params.id)),
})
