import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/query-context'
import {
  NotFoundPage,
  NotFoundPageActions,
  NotFoundPageDescription,
  NotFoundPageHomeButton,
  NotFoundPageSubtitle,
  NotFoundPageTitle,
} from '#/components/common/not-found-page'
import { Button } from '#/components/ui/button'
import { HTTPError } from '#/integrations/tanstack-query/http'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <NotFoundPage />,

    /*
     * ponytail: `defaultPendingMs` fica no padrão (1000ms) até haver medida.
     *
     * As 30 listagens ganharam `pendingComponent`, mas com `defaultPreload:
     * 'intent'` o chunk e o loader começam no hover, e a maioria dos cliques
     * chega quente - nesses o esqueleto não deve aparecer. Baixar o valor agora
     * arrisca piscar esqueleto em navegação instantânea, porque o
     * `defaultPendingMinMs` (500ms) segura o quadro depois de ele nascer.
     *
     * O botão a girar é este, e só depois de ver quanto tempo o loader leva num
     * clique frio de verdade.
     */

    /*
     * A saída de tudo que falha e não foi tratado.
     *
     * Não existia: rota sem `errorComponent` e router sem padrão caem na tela
     * embutida do TanStack, que em produção é um bloco de texto sem estilo.
     * O app tinha 404 desenhado e nenhuma tela de erro - e a falha de rede num
     * `loader` é bem mais frequente que uma URL digitada errada.
     *
     * `reset` antes de "voltar ao início": quase todo erro daqui é o `loader`
     * que não respondeu, e refazer a tentativa resolve sem perder o lugar. O
     * caminho para casa fica como segunda saída, não como única.
     */
    defaultErrorComponent: ({ error, reset }) => {
      /*
       * O 4xx do `loader` traz mensagem escrita para quem lê a tela - "Esta
       * empresa foi desativada", "Produto não encontrado" -, e mostrá-la é o
       * que separa "a falha é nossa" de "a situação é esta". Sem isto, uma
       * empresa arquivada pelo administrador recebia "Algo quebrou aqui, a
       * falha é nossa" e ficava sem saber o que fazer.
       *
       * Só 4xx: a mensagem de um 5xx é do servidor para o log, e repeti-la na
       * tela não ajuda ninguém e pode vazar detalhe de implementação.
       */
      let handled: HTTPError | null = null
      if (
        error instanceof HTTPError &&
        error.status >= 400 &&
        error.status < 500
      )
        handled = error

      if (handled)
        return (
          <NotFoundPage code={String(handled.status)}>
            <NotFoundPageTitle>{handled.message}</NotFoundPageTitle>
            <NotFoundPageDescription>
              Se você chegou aqui por um link, ele pode ter mudado de lugar.
            </NotFoundPageDescription>
            <NotFoundPageActions>
              <NotFoundPageHomeButton />
            </NotFoundPageActions>
          </NotFoundPage>
        )

      return (
        <NotFoundPage code="500">
          <NotFoundPageTitle>Algo quebrou aqui</NotFoundPageTitle>
          <NotFoundPageSubtitle>A falha é nossa, não sua</NotFoundPageSubtitle>
          <NotFoundPageDescription>
            Esta tela não conseguiu carregar. Tentar de novo costuma bastar; se
            insistir, volte ao início.
          </NotFoundPageDescription>
          <NotFoundPageActions>
            <Button className="w-fit rounded-control" onClick={reset}>
              Tentar de novo
            </Button>
            <NotFoundPageHomeButton />
          </NotFoundPageActions>
        </NotFoundPage>
      )
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
