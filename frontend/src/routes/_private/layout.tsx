import * as React from 'react'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { SignOut } from '@phosphor-icons/react'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { useSignOut } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { Button } from '#/components/ui/button'
import { ThemeToggle } from '#/components/common/theme-toggle'
import { cn } from '#/lib/utils'

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
    } catch {
      // Qualquer falha aqui é ausência de sessão utilizável: o `request` já
      // tentou renovar com o refresh token antes de deixar o erro subir.
      throw redirect({
        to: '/authentication',
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

/** Os destinos do painel. Uma lista e não JSX repetido: são três hoje e a
 *  navegação inteira sai daqui, incluindo o estado de "ativo". */
const LINKS = [
  { to: '/admin', label: 'Visão geral', exact: true },
  { to: '/admin/cursos', label: 'Cursos', exact: false },
  { to: '/admin/turmas', label: 'Turmas', exact: false },
  { to: '/admin/matriculas', label: 'Matrículas', exact: false },
] as const

/** O alvo do "pular para o conteúdo". */
const MAIN_ID = 'conteudo'

function RouteComponent(): React.JSX.Element {
  const { account } = Route.useRouteContext()

  return (
    // Sem tema fixo: o painel segue o `<html>`, como no simple-hub, no adacaibs
    // e no lowcodejs. A justificativa do `light` cravado - "aqui alguém passa
    // uma hora seguida numa tabela" - continua verdadeira, e é exatamente por
    // isso que a escolha passa a ser de quem trabalha na tela, e não do arquivo.
    <div className="min-h-svh bg-background text-foreground">
      {/*
        `sr-only` com `focus:not-sr-only`, e não `display: none`: escondido de
        verdade o link não receberia foco e deixaria de existir para quem ele
        serve.
      */}
      <a
        href={'#'.concat(MAIN_ID)}
        className="sr-only rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link to="/admin" className="font-semibold tracking-tight">
            Maiyu <span className="text-primary">Academy</span>
          </Link>

          <nav aria-label="Painel" className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                )}
                activeProps={{
                  className: 'bg-secondary text-foreground font-medium',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {account.name}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main id={MAIN_ID} tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

function SignOutButton(): React.JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useSignOut({
    onSuccess: async function () {
      // Invalidar **antes** de navegar: o guard de `_private` lê o cache no
      // `beforeLoad`, e sem isto ele encontraria a sessão que acabou de morrer
      // e deixaria passar.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })
      await router.navigate({ to: '/authentication' })
    },
  })

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <SignOut />
      Sair
    </Button>
  )
}
