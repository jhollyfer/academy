import { createFileRoute } from '@tanstack/react-router'
import { classesListQueryOptions } from '#/integrations/tanstack-query/queries'
import { validateListSearch } from '#/lib/list-search'

export const Route = createFileRoute('/_private/admin/turmas/')({
  validateSearch: validateListSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(classesListQueryOptions(deps)),
})
