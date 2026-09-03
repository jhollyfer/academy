import { createFileRoute } from '@tanstack/react-router'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { SITE_TITLE } from '#/lib/site'

/**
 * O curso pré-selecionado, quando a pessoa chega pelo botão de uma página de
 * curso.
 *
 * Na URL e não em estado: assim o link "Garanta sua vaga" da página de robótica
 * abre o formulário já na robótica, e recarregar a página não perde a escolha.
 *
 * À mão e não com o VineJS: `validateSearch` é síncrono e `validate` do VineJS
 * devolve promessa. Mesmo motivo do `list-search.ts`.
 */
function validateSearch(search: Record<string, unknown>): { curso?: string } {
  if (typeof search.curso === 'string' && search.curso)
    return { curso: search.curso }

  return {}
}

export const Route = createFileRoute('/_public/enrollment/')({
  validateSearch,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(storefrontCoursesQueryOptions()),
  head: () => ({
    meta: [
      { title: `Matrícula · ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          'Faça sua matrícula na Maiyu Academy sem sair de casa. Leva menos de cinco minutos.',
      },
      // O formulário não tem por que aparecer na busca: quem chega direto nele
      // sem passar pela página do curso não sabe o que está comprando.
      { name: 'robots', content: 'noindex' },
    ],
  }),
})
