import type * as React from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { validateRedirectSearch } from '#/lib/redirect-search'

/**
 * O guard inverso: quem já tem sessão não vê o formulário de login. Fica no
 * layout pelo mesmo motivo do `_private` - tela de autenticação nova nasce
 * coberta por estar no lugar certo.
 */
export const Route = createFileRoute('/authentication')({
  validateSearch: validateRedirectSearch,
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(accountQueryOptions())
    } catch {
      // Sem sessão é o caso normal desta área: segue para o formulário.
      return
    }

    // Fora do `try`: um `redirect` é lançado, e lançado de dentro dele seria
    // capturado pelo próprio `catch` que existe para o caso oposto.
    //
    // Destino fixo, e não derivado do papel como na referência: aqui há um
    // painel só. `OWNER` e `ADMINISTRATOR` diferem no que podem apagar, não em
    // onde entram.
    throw redirect({ to: '/administrator' })
  },
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return <Outlet />
}
