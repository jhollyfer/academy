import { createFileRoute, notFound } from '@tanstack/react-router'
import { enrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'

export const Route = createFileRoute(
  '/_private/administrator/enrollments/$id/',
)({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        enrollmentQueryOptions(params.id),
      )
    } catch (error) {
      /*
       * Id inexistente é resposta, não avaria - o mesmo que a rota pública do
       * protocolo já faz. Sem esta distinção a API devolvia 404 e a rota
       * respondia 500, mostrando a fronteira de erro genérica com a mensagem do
       * servidor: a tela dizia "não encontrado" e o status dizia "quebrou".
       *
       * Só o 404 vira `notFound()`. Um 500 ou uma queda de rede continuam
       * subindo para a fronteira de erro, que oferece tentar de novo - e tentar
       * de novo é o que não adianta num id que não existe.
       */
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND)
        throw notFound()

      throw error
    }
  },
})
