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

/**
 * O woff2 do corpo do texto, importado para render o endereço com hash.
 *
 * `?url` e não um caminho escrito à mão: o arquivo entra no build com hash de
 * conteúdo, e um literal `/assets/outfit-....woff2` quebraria no próximo build
 * que mudasse o hash - e quebraria em silêncio, porque um `preload` que aponta
 * para 404 não estraga a página, só deixa de adiantar o download.
 *
 * Só o subconjunto latino. Os outros que o `@fontsource` declara têm
 * `unicode-range` e o navegador nunca os baixa num site em português; pré-
 * carregá-los seria puxar bytes que nada usa.
 */
import outfitLatin from '@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url'

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
      /*
       * O `.ico` de volta, e desta vez com arquivo.
       *
       * O comentário acima conta que a linha anterior apontava para um `.ico`
       * que nunca existiu, e a saída foi apagar a linha. Só que o navegador que
       * não lê SVG **não** desiste: ele pede `/favicon.ico` na raiz por
       * convenção, declarado ou não, e continuava tomando 404 a cada visita.
       *
       * Agora o arquivo existe (`scripts/generate-icons.mjs` o gera do mesmo
       * SVG), e declará-lo evita a segunda requisição às cegas. Quem lê SVG
       * ignora esta linha: o `image/svg+xml` acima tem precedência.
       */
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      // O iOS ignora o manifesto ao adicionar à tela de início e lê só isto.
      // Sem a linha, ele recorta um print da página como ícone.
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
      /*
       * O manifesto, que é o que torna "adicionar à tela de início" uma
       * instalação com nome e ícone em vez de um atalho genérico.
       *
       * A página já promete que "a matrícula cabe no celular", e o celular é o
       * aparelho de quase todo mundo que se inscreve aqui.
       */
      {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
      /*
       * A fonte do corpo, pedida junto com o CSS em vez de depois dele.
       *
       * Sem isto o navegador só descobre o `@font-face` depois de baixar e
       * analisar a folha de estilo, e só então começa a buscar o woff2 - duas
       * viagens em série. A escola está numa cidade onde a conexão é ruim, e é
       * exatamente ali que uma viagem a menos aparece.
       *
       * `crossOrigin` é obrigatório mesmo sendo mesma origem: fonte é sempre
       * buscada em modo CORS, e um `preload` sem ele vira um **segundo**
       * download em vez de um adiantamento - o pior dos dois mundos.
       *
       * Só o Outfit fica aqui: ele é o corpo de todo texto do site. A serifa
       * (Playfair) é pré-carregada no `head` da home, que é onde ela cai no
       * elemento de LCP - declará-la aqui faria `/termos` e `/privacidade`
       * baixarem uma fonte que aquelas páginas não usam.
       */
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: outfitLatin,
        crossOrigin: 'anonymous',
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
        {/*
          A cor da barra do sistema no celular, uma por tema.

          Escritas aqui e **não** no `head` da rota raiz, e isso não é
          preferência: a fusão de `meta` do roteador desduplica por `name`, e o
          par claro/escuro tem o mesmo `name` - declarado lá, o segundo apagava
          o primeiro e só a variante escura chegava ao HTML. Aqui elas
          atravessam inteiras, e não perdem nada por isso: são estáticas, iguais
          em toda rota, que é justamente o que a casca do documento carrega.

          Uma cor só deixaria a barra do sistema brigando com a página em
          metade dos aparelhos - faixa clara colada num fundo #272221, que é o
          tipo de emenda que faz o site parecer quebrado antes de alguém ler
          qualquer coisa.

          Os valores são os mesmos `--background` de `styles.css`. Se um mudar
          lá, este muda junto: não há como um literal aqui ler um custom
          property de lá.
        */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fafafa"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#272221"
        />
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
