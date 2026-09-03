import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { usersQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * `?role=` e `?status=` recortam a listagem, como o validator do backend
 * aceita. `role` aceita a lista inteira, `OWNER` incluso: filtrar não é
 * atribuir, e quem não pode vê-lo já não o recebe na resposta.
 */
const validateSearch = withExtra(['role', 'status'] as const)

export const Route = createFileRoute('/_private/administrator/users/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(usersQueryOptions(deps)),
})
