import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { partnersQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * `?status=` recorta a listagem, como o validator do backend aceita. Só um
 * filtro, e não o par do curso: parceiro não tem trilha.
 *
 * `as const` não é enfeite: sem ele `TKey` infere `string`, o retorno vira um
 * índice aberto e a união de search do roteador deixa de fechar.
 */
const validateSearch = withExtra(['status'] as const)

export const Route = createFileRoute('/_private/administrator/partners/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(partnersQueryOptions(deps)),
})
