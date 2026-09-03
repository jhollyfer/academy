import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { classesQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * `?courseId=` e `?status=` recortam a listagem, como o validator do backend
 * aceita.
 *
 * `as const` não é enfeite: sem ele `TKey` infere `string`, o retorno vira um
 * índice aberto e a união de search do roteador deixa de fechar - os
 * componentes genéricos da tabela voltam a não compilar.
 */
const validateSearch = withExtra(['courseId', 'status'] as const)

export const Route = createFileRoute('/_private/administrator/classes/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(classesQueryOptions(deps)),
})
