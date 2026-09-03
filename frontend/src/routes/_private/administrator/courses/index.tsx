import { createFileRoute } from '@tanstack/react-router'
import { coursesListQueryOptions } from '#/integrations/tanstack-query/queries'
import { validateListSearch } from '#/lib/list-search'

export const Route = createFileRoute('/_private/admin/cursos/')({
  validateSearch: validateListSearch,
  // `loaderDeps` porque a listagem depende do filtro: sem isto o loader roda
  // uma vez e nunca mais, e trocar de página não buscaria nada.
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(coursesListQueryOptions(deps)),
})
