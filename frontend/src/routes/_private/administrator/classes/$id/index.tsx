import { createFileRoute, notFound } from '@tanstack/react-router'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import { classQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/administrator/classes/$id/')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        classQueryOptions(params.id),
      )
    } catch (error) {
      // Só o 404 vira "não encontrado" na rota; rede fora e 500 sobem.
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND) {
        throw notFound()
      }

      throw error
    }
  },
})
