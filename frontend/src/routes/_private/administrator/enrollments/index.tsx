import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { enrollmentsQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * `?courseId=`, `?classId=` e `?status=` recortam a fila, como o validator do
 * backend aceita.
 *
 * `as const` não é enfeite: sem ele `TKey` infere `string`, o retorno vira um
 * índice aberto e a união de search do roteador deixa de fechar - os
 * componentes genéricos da tabela voltam a não compilar.
 */
const validateSearch = withExtra(['courseId', 'classId', 'status'] as const)

export const Route = createFileRoute('/_private/administrator/enrollments/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(enrollmentsQueryOptions(deps)),
})
