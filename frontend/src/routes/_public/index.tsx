import { createFileRoute } from '@tanstack/react-router'
import {
  storefrontCoursesQueryOptions,
  storefrontFaqsQueryOptions,
  storefrontPartnersQueryOptions,
  storefrontPhotosQueryOptions,
} from '#/integrations/tanstack-query/queries'
import {
  ADDRESS,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
  WHATSAPP_NUMBER,
  absoluteUrl,
} from '#/lib/site'
// `?url` pelo mesmo motivo do `__root.tsx`: o arquivo entra no build com hash
// de conteúdo, e um caminho escrito à mão quebraria no build seguinte.
import playfairLatinItalic from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2?url'

/**
 * Os dados estruturados da escola.
 *
 * `EducationalOrganization` e não `Organization`: o buscador usa o tipo para
 * decidir o que mostrar no resultado, e escola tem campos que empresa genérica
 * não tem. O endereço vai junto porque a busca que traz aluno é local.
 */
function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    telephone: `+${WHATSAPP_NUMBER}`,
    // `streetAddress` fica de fora enquanto o logradouro não está definido:
    // schema.org aceita endereço sem ele, e uma chave vazia é pior que a
    // ausência - o buscador a trata como dado, e mostra um endereço em branco.
    url: SITE_URL,
    image: SITE_IMAGE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.city,
      addressRegion: ADDRESS.state,
      addressCountry: ADDRESS.country,
    },
    /*
     * As coordenadas da cidade, e não de um logradouro.
     *
     * O ponto de Benjamin Constant é informação pública e verificável; o número
     * da rua ainda não está definido. Marcar a cidade ajuda a busca local sem
     * mandar ninguém para uma calçada errada, que é o que um `geo` de endereço
     * chutado faria.
     *
     * TODO: apertar para o ponto exato junto com `ADDRESS.street`.
     */
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -4.3831,
      longitude: -70.0311,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Alto Solimões, Amazonas',
    },
  }
}

export const Route = createFileRoute('/_public/')({
  // `ensureQueryData` no loader: a home é a primeira navegação de quem vem do
  // anúncio, e sem isto o Nitro renderizaria a casca e o navegador buscaria os
  // cursos depois - dois tempos de espera em vez de um.
  /*
   * `prefetchQuery` e não `ensureQueryData`.
   *
   * O `ensure` devolve o dado e **propaga o erro**, o que faria a API fora do ar
   * derrubar a home inteira - hero, escola, equipe, matrícula e banner juntos,
   * que não dependem de consulta nenhuma. O `prefetch` engole a falha, e quem a
   * mostra é a seção afetada, que já sabe sumir sozinha. Falha de uma seção não
   * derruba a página.
   *
   * As três em paralelo: encadeadas, o FAQ só começaria a carregar depois de os
   * cursos voltarem, e a primeira navegação pagaria os três tempos.
   *
   * **Toda seção que lê a API precisa estar aqui.** Sem o prefetch o cache do
   * servidor nasce vazio, o `useQuery` da seção devolve `undefined` no SSR e o
   * bloco só aparece depois da hidratação - invisível para quem está sem
   * JavaScript e para o rastreador do buscador. Foi o que aconteceu com os
   * parceiros: a seção existia, a API respondia, e o HTML servido não a trazia.
   */
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.prefetchQuery(storefrontCoursesQueryOptions()),
      context.queryClient.prefetchQuery(storefrontFaqsQueryOptions()),
      context.queryClient.prefetchQuery(storefrontPartnersQueryOptions()),
      context.queryClient.prefetchQuery(storefrontPhotosQueryOptions()),
    ]),
  head: () => ({
    meta: [
      { title: SITE_TAGLINE },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:title', content: SITE_TAGLINE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: absoluteUrl('/') },
    ],
    links: [
      /*
       * A serifa, pedida já na primeira resposta da home.
       *
       * Ela cai dentro do `h1` do hero - o `Highlight` é `font-serif` itálico -,
       * e esse `h1` é o maior elemento da primeira tela, ou seja o que o LCP
       * mede. Descoberta só depois do CSS, a palavra troca de fonte no meio do
       * carregamento e a linha inteira se reflui.
       *
       * Aqui e não na raiz porque `/termos` e `/privacidade` não usam o
       * `Highlight`: na raiz, as duas baixariam uma fonte que não pintam.
       */
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: playfairLatinItalic,
        crossOrigin: 'anonymous',
      },
      /*
       * O canônico da home.
       *
       * Aponta para a barra final e é absoluto: sem ele, `?utm_source` de
       * anúncio e `/` versus `/index` viram páginas diferentes para o buscador,
       * e a força do domínio se divide entre elas justamente na página que mais
       * precisa dela.
       */
      { rel: 'canonical', href: absoluteUrl('/') },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
})
