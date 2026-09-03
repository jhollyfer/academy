import { createFileRoute } from '@tanstack/react-router'
import { HTTPError, request } from '#/integrations/tanstack-query/http'
import { SITE_TITLE } from '#/lib/site'

/**
 * O que o `GET` respondeu sobre o convite, já traduzido para a tela.
 *
 * `reason` é a frase que o backend escreveu para ser lida - ele distingue link
 * inexistente, já usado, expirado e conta indisponível, e cada um manda a pessoa
 * a um lugar diferente. Repetir essa árvore aqui seria mantê-la em dois lugares.
 */
type InviteState = { usable: true } | { usable: false; reason: string }

const FALLBACK_REASON =
  'Este link de convite não é válido. Peça um novo à secretaria'

export const Route = createFileRoute('/authentication/invite/$token/')({
  loader: async ({ params }): Promise<InviteState> => {
    try {
      await request<void>(
        `/authentication/invite/${encodeURIComponent(params.token)}`,
      )

      return { usable: true }
    } catch (error) {
      // Recusa do convite é conteúdo da tela, e não erro de rota: a pessoa
      // precisa ler o porquê e saber o que fazer. Só 5xx e rede fora continuam
      // subindo, senão um backend indisponível pareceria convite inválido - e
      // ela pediria um link novo que também não ia funcionar.
      if (error instanceof HTTPError && !error.isServerError) {
        return { usable: false, reason: error.errors?.root ?? FALLBACK_REASON }
      }

      throw error
    }
  },
  head: () => ({
    meta: [
      { title: `Definir senha · ${SITE_TITLE}` },
      // Um link de convite indexado é um link de convite vazado.
      { name: 'robots', content: 'noindex' },
    ],
  }),
})
