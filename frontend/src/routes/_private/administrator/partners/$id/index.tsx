import { createFileRoute, notFound } from '@tanstack/react-router'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import { partnerQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/administrator/partners/$id/')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        partnerQueryOptions(params.id),
      )
    } catch (error) {
      // Só o 404 vira "não encontrado" na rota. Rede fora e 500 continuam
      // subindo, senão um backend indisponível pareceria registro apagado.
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND) {
        throw notFound()
      }

      throw error
    }
  },
})
