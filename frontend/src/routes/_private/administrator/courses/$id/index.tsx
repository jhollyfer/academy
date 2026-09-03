import { createFileRoute, notFound } from '@tanstack/react-router'
import { courseDetailQueryOptions } from '#/integrations/tanstack-query/queries'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'

export const Route = createFileRoute('/_private/admin/cursos/$id/')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        courseDetailQueryOptions(params.id),
      )
    } catch (error) {
      // Mesmo motivo de `matriculas/$id`: 404 da API virava 500 da rota.
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND)
        throw notFound()

      throw error
    }
  },
})
