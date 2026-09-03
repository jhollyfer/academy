import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  classDetailQueryOptions,
  coursesListQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'

export const Route = createFileRoute('/_private/admin/turmas/$id/')({
  loader: async ({ context, params }) => {
    try {
      // `Promise.all` e não em sequência: as duas leituras são independentes, e
      // encadeá-las somaria os dois tempos de espera sem motivo.
      await Promise.all([
        context.queryClient.ensureQueryData(classDetailQueryOptions(params.id)),
        context.queryClient.ensureQueryData(
          coursesListQueryOptions({ perPage: 100 }),
        ),
      ])
    } catch (error) {
      // Mesmo motivo de `matriculas/$id`: 404 da API virava 500 da rota.
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND)
        throw notFound()

      throw error
    }
  },
})
