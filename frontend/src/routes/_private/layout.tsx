import * as React from 'react'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useMatches,
} from '@tanstack/react-router'

import { Sidebar } from './-components/sidebar'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { UploadingProvider } from '#/components/common/uploading-context'
import { HTTPError, HTTPStatus } from '#/integrations/tanstack-query/http'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Separator } from '#/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { useCompactViewport } from '#/hooks/use-compact-viewport'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { buildBreadcrumbs } from '#/lib/breadcrumbs'

/**
 * O portão do painel. Fica no layout, e não em cada tela, porque assim rota nova
 * dentro de `_private/` nasce protegida por estar no lugar certo - que é a mesma
 * ideia do `middleware.auth()` aplicado ao grupo em `backend/start/routes.ts`.
 */
export const Route = createFileRoute('/_private')({
  beforeLoad: async ({ context, location }) => {
    try {
      // `ensureQueryData` e não `prefetchQuery`: o primeiro devolve o dado e
      // propaga o erro, o segundo engole os dois e o guard nunca reprovaria.
      const account = await context.queryClient.ensureQueryData(
        accountQueryOptions(),
      )

      return { account }
    } catch (error) {
      // Só 401 e 403 significam ausência de sessão utilizável - e para chegar
      // ao 401 o `request` já tentou renovar com o refresh token antes de
      // deixar o erro subir.
      //
      // Um `catch` cego mandava para o login também o 500, o timeout de 15s e a
      // queda de rede: a API fora do ar virava "você foi deslogado", e a pessoa
      // reentrava para cair no mesmo lugar. Erro de infraestrutura sobe para o
      // `defaultErrorComponent`, que sabe desenhá-lo.
      const semSessao =
        error instanceof HTTPError &&
        (error.status === HTTPStatus.UNAUTHORIZED ||
          error.status === HTTPStatus.FORBIDDEN)

      if (!semSessao) throw error

      throw redirect({
        to: '/authentication',
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

/** O alvo do "pular para o conteúdo", e o `id` do `<main>` que o `SidebarInset` renderiza. */
const MAIN_ID = 'conteudo'

function RouteComponent(): React.JSX.Element {
  const compact = useCompactViewport()

  const [open, setOpen] = React.useState(true)
  const [wasCompact, setWasCompact] = React.useState(compact)

  /*
   * A sidebar acompanha a largura da janela, e só quando ela cruza o limite.
   *
   * Entre 768px e 1280px ela não respondia a nada: larga demais para virar
   * gaveta, aberta demais para a tabela caber ao lado. É a faixa dos notebooks,
   * e era o que o teste de aceitação via.
   *
   * Sincronizar no render e não num `useEffect`: com o React Compiler ligado o
   * efeito seria uma renderização a mais, e é o mesmo padrão que o `DatePicker`
   * usa para acompanhar valor que vem de fora.
   *
   * Reage à **transição**, e não ao estado: depois de cruzar o limite, quem
   * abrir a sidebar pelo botão continua com ela aberta. Forçar a cada render
   * transformaria o `SidebarTrigger` num botão que não faz nada.
   */
  if (compact !== wasCompact) {
    setWasCompact(compact)
    setOpen(!compact)
  }

  return (
    // `h-svh` sobre o `min-h-svh` do componente: com altura mínima o container
    // cresce junto com o conteúdo, e uma altura que cresce não limita ninguém.
    // Altura fixa dá o teto, e quem rola passa a ser a área interna.
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      className="h-svh overflow-hidden"
    >
      {/*
        `sr-only` com `focus:not-sr-only`, e não `display: none`: escondido de
        verdade o link não receberia foco e deixaria de existir para quem ele
        serve. Aqui ele rende mais que na vitrine - a sidebar vem antes do
        conteúdo em toda tela, a cada navegação.
      */}
      <a
        href={'#'.concat(MAIN_ID)}
        className="focus-ring sr-only rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <Sidebar />

      {/* `tabIndex={-1}` para o alvo do salto poder receber o foco: sem ele o
          navegador rola até aqui e deixa o foco no link, e a tabulação seguinte
          volta para o topo da sidebar. */}
      {/*
        `min-w-0` é o par horizontal do `min-h-0`, e faz falta pelo mesmo
        motivo: o `SidebarInset` é item de um flex em linha, e item de flex não
        encolhe abaixo do próprio conteúdo por default. Uma tabela larga
        empurrava a área inteira para além da tela - e como o `SidebarProvider`
        acima é `overflow-hidden`, o que passava do fim era **recortado**, não
        rolável. A última coluna da tabela, que é a do menu de ações, é
        exatamente a que mora nessa borda.
      */}
      <SidebarInset id={MAIN_ID} tabIndex={-1} className="min-h-0 min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear motion-reduce:transition-none group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Trail />
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle className="size-8" />
          </div>
        </header>

        {/*
          O provider fica aqui, e não em cada formulário: o upload acontece na
          escolha do arquivo e o formulário só conhece o `id` depois que ele
          existe, então **todo** botão de salvar do painel precisa saber se há
          arquivo em voo. Um por tela seriam tantas chances de esquecer quantas
          são as telas - e a falha é silenciosa, porque `useRegisterUpload` fora
          do provider não faz nada e o registro nasce sem imagem, sem erro.
        */}
        <UploadingProvider>
          {/*
            `min-h-0` com `overflow-auto` é o par da altura fixa lá em cima: sem
            ele um filho flex não encolhe abaixo do próprio conteúdo, a área de
            rolagem interna nunca recebe altura limitada, e o scroll vaza para a
            página inteira.
          */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
            <Outlet />
          </div>
        </UploadingProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}

/**
 * A trilha da tela atual.
 *
 * `useMatches()` e não `location.pathname`: a lista de rotas que casaram é o que
 * diz quais prefixos existem de verdade. A regra inteira mora em
 * `lib/breadcrumbs.ts`, testada lá.
 */
function Trail(): React.JSX.Element {
  const matches = useMatches()
  const crumbs = buildBreadcrumbs(matches)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.label.concat(String(index))}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.to && (
                <BreadcrumbLink render={<Link to={crumb.to} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
              {!crumb.to && <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
