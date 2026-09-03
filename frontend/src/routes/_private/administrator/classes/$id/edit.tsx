import { createFileRoute, notFound } from '@tanstack/react-router'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import {
  classQueryOptions,
  coursesQueryOptions,
} from '#/integrations/tanstack-query/queries'

/**
 * A mesma `queryOptions` do detalhe, com a mesma chave: quem abre a edição a
 * partir do detalhe não dispara requisição nova, o cache já está cheio.
 *
 * O catálogo de cursos entra junto porque o formulário tem um select dele, e o
 * `useSuspenseQuery` do componente suspenderia de verdade sem este aquecimento.
 */
export const Route = createFileRoute(
  '/_private/administrator/classes/$id/edit',
)({
  loader: async ({ context, params }) => {
    context.queryClient.prefetchQuery(coursesQueryOptions({ perPage: 100 }))

    try {
      return await context.queryClient.ensureQueryData(
        classQueryOptions(params.id),
      )
    } catch (error) {
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND) {
        throw notFound()
      }

      throw error
    }
  },
})
