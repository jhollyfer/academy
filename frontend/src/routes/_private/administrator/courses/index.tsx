import { createFileRoute } from '@tanstack/react-router'
import { TableSkeleton } from '#/components/common/table/table-skeleton'
import { withExtra } from '#/lib/list-search'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * `?status=` e `?accent=` recortam a listagem, como o validator do backend
 * aceita.
 *
 * `as const` não é enfeite: sem ele `TKey` infere `string`, o retorno vira um
 * índice aberto e a união de search do roteador deixa de fechar - os
 * componentes genéricos da tabela voltam a não compilar.
 */
const validateSearch = withExtra(['status', 'accent'] as const)

export const Route = createFileRoute('/_private/administrator/courses/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  // `loaderDeps` porque a listagem depende do filtro: sem isto o loader roda
  // uma vez e nunca mais, e trocar de página não buscaria nada.
  loaderDeps: ({ search }) => search,
  // `ensureQueryData` e não `prefetchQuery`: o primeiro devolve o dado e
  // propaga o erro. É o mesmo do guard em `_private/layout.tsx`.
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(coursesQueryOptions(deps)),
})
