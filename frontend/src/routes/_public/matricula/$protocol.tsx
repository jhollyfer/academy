import { createFileRoute, notFound } from '@tanstack/react-router'
import { storefrontEnrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/_public/matricula/$protocol')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        storefrontEnrollmentQueryOptions(params.protocol),
      )
    } catch (error) {
      /*
       * O 404 do protocolo é resposta, não avaria.
       *
       * Sem esta distinção, protocolo inexistente caía na fronteira de erro
       * genérica do router e a tela dizia "Algo quebrou aqui - a falha é nossa,
       * não sua". Ela é nossa quando o banco cai; quando o número está errado a
       * falha não é de ninguém, e a pessoa precisa é de saber que aquele
       * protocolo não existe e o que fazer a seguir.
       *
       * `notFound()` e não a mensagem do 4xx que o `defaultErrorComponent` já
       * sabe mostrar: aquele caminho depende de `error instanceof HTTPError`
       * sobreviver ao SSR, e não sobrevive - o erro lançado no `loader` é
       * serializado para hidratar o cliente e volta como `Error` comum, então o
       * cliente repintava a tela de 500 por cima do 404 que o servidor tinha
       * renderizado certo. É o mesmo `throw notFound()` que `cursos/$slug.tsx`
       * usa, e ele atravessa a serialização porque o router o trata como
       * estado de rota, não como exceção.
       *
       * Só o 404. Um 500 ou uma queda de rede continuam subindo para a
       * fronteira de erro, que oferece "tentar de novo" - e tentar de novo é
       * exatamente o que não adianta num protocolo que não existe.
       */
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND)
        throw notFound()

      throw error
    }
  },
  head: () => ({
    meta: [
      { title: `Sua matrícula - ${SITE_TITLE}` },
      // A URL contém o protocolo, que é a credencial do candidato. Indexá-la
      // colocaria o dado pessoal de alguém no resultado de busca.
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})
