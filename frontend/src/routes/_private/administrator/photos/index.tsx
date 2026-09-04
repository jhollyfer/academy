import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { photosQueryOptions } from '#/integrations/tanstack-query/queries'

const validateSearch = withExtra(['status'] as const)

export const Route = createFileRoute('/_private/administrator/photos/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(photosQueryOptions(deps)),
})
