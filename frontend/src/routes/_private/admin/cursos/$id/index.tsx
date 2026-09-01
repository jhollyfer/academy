import { createFileRoute } from '@tanstack/react-router'
import { courseDetailQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/admin/cursos/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(courseDetailQueryOptions(params.id)),
})
