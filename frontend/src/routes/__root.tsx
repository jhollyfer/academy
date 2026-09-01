import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { ThemeProvider } from 'next-themes'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'

import {
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_TAGLINE,
  SITE_TITLE,
} from '#/lib/site'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

/**
 * O idioma do documento.
 *
 * Literal, e não `getLocale()` do paraglide como vinha do esqueleto: o
 * `project.inlang/settings.json` declara `baseLocale: "en"` e os locales `en` e
 * `de`, e as sete chaves de `messages/` são as que o gerador criou ("Home page",
 * "Learn Paraglide JS"). Nada do produto passa por lá - são ~1300 trechos de
 * português literal no JSX -, então `getLocale()` devolvia `"en"` e o site
 * inteiro se anunciava em inglês: leitor de tela lia com a voz errada, o
 * navegador oferecia tradução e o buscador indexava o idioma errado.
 *
 * Quando a tradução de verdade começar, isto volta a sair do paraglide.
 */
const LOCALE = 'pt-BR'

/**
 * O que toda rota enxerga em `context`.
 *
 * `type` e não `interface`: aqui não é module augmentation - é declaração local,
 * e a regra do projeto vale (o único `interface` legítimo é o de
 * `vite-env.d.ts`, que aumenta o `ImportMetaEnv` do Vite).
 */
type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: SITE_TAGLINE,
      },
      /*
       * Sem `description` o buscador monta o resumo do resultado com o que
       * achar na página, e o cartão de link em aplicativo de mensagem sai só
       * com o título. Uma rota que queira a sua a escreve no próprio `head` - o
       * mais fundo vence na fusão por nome.
       */
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      /*
       * O cartão de link, e o padrão de todo o site.
       *
       * O `head` das rotas casadas é fundido por nome e por propriedade, e o
       * mais fundo vence: a página de um curso põe o próprio título por cima
       * destes, e as demais ficam com a cara do site em vez de um cartão sem
       * imagem nem descrição.
       *
       * `og:locale` importa mais aqui do que num site em inglês: a página é
       * regional, e é o que impede o cartão de sair com o idioma adivinhado.
       */
      { property: 'og:site_name', content: SITE_TITLE },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: SITE_TAGLINE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: SITE_IMAGE },
      /*
       * `summary_large_image` e não `summary`: com a imagem de 1200x630 o
       * cartão pequeno recorta o texto do centro, que é onde o nome da escola
       * está.
       */
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TAGLINE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: SITE_IMAGE },
    ],
    links: [
      /*
       * Sem esta linha o navegador pede `/favicon.ico` na raiz por convenção e
       * a aba fica com o ícone genérico até a resposta chegar. Declarado, ele
       * entra junto com o resto do `head`.
       */
      /*
       * SVG e não `.ico`. O `.ico` declarado aqui antes apontava para um arquivo
       * que nunca existiu no projeto: a aba ficava com o ícone genérico e o
       * servidor respondia 404 a cada visita.
       */
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    // `suppressHydrationWarning` só aqui, e é obrigatório: o `next-themes`
    // escreve `class="dark"` no `<html>` por um script que roda antes da
    // hidratação - é o que evita o flash de tema claro -, então o servidor e o
    // cliente divergem neste elemento por construção.
    <html lang={LOCALE} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          `attribute="class"` porque o Tailwind 4 deste projeto declara
          `@custom-variant dark (&:is(.dark *))` em `styles.css`: quem liga o
          tema escuro é a classe, não um `data-theme`.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/*
            Um provider só para toda a árvore: ele agrupa o atraso de abertura,
            então passar o mouse de um botão a outro não recomeça a contagem.
          */}
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster />
        {/*
          Só em desenvolvimento. Os dois painéis de dentro já se anulam sozinhos
          fora dele - `TanStackRouterDevtoolsPanel` e `ReactQueryDevtoolsPanel`
          viram função vazia quando `NODE_ENV !== 'development'` -, mas a casca
          `TanStackDevtools` não tem essa guarda: sem esta linha o botão
          flutuante das ferramentas aparece por cima da vitrine para quem entrou
          para comprar, e o núcleo `@tanstack/devtools` vai junto no bundle.
        */}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
