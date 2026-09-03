import { createFileRoute, notFound } from '@tanstack/react-router'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import { userQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/administrator/users/$id/')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        userQueryOptions(params.id),
      )
    } catch (error) {
      // Só o 404 vira "não encontrado" na rota. Rede fora e 500 continuam
      // subindo, senão um backend indisponível pareceria registro apagado.
      //
      // O 403 também sobe, e aqui ele tem um segundo significado: o dono
      // responde **404** para quem não é dono - o `show.use-case.ts` esconde a
      // existência dele em vez de confirmá-la com um 403.
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND) {
        throw notFound()
      }

      throw error
    }
  },
})
