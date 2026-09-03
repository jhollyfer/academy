import type * as React from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { validateRedirectSearch } from '#/lib/redirect-search'
import { homeForRole } from '#/lib/entity'

/**
 * O guard inverso: quem já tem sessão não vê o formulário de login. Fica no
 * layout pelo mesmo motivo do `_private` - tela de autenticação nova nasce
 * coberta por estar no lugar certo.
 */
export const Route = createFileRoute('/authentication')({
  validateSearch: validateRedirectSearch,
  beforeLoad: async ({ context, location }) => {
    let account

    try {
      account = await context.queryClient.ensureQueryData(accountQueryOptions())
    } catch {
      // Sem sessão é o caso normal desta área: segue para o formulário.
      return
    }

    // O convite é a exceção do guard, e precisa ser: o link chega por e-mail e
    // é aberto no navegador que a pessoa tem à mão - que pode muito bem ter
    // sessão, a da secretaria que acabou de reenviá-lo ou a de outra conta da
    // mesma família. Redirecionar ali engoliria o link em silêncio, e a pessoa
    // não teria como definir a senha sem antes descobrir que precisa sair.
    if (location.pathname.startsWith('/authentication/invite/')) return

    // Fora do `try`: um `redirect` é lançado, e lançado de dentro dele seria
    // capturado pelo próprio `catch` que existe para o caso oposto.
    //
    // Destino derivado do papel, e não fixo: são duas áreas, e o servidor barra
    // uma da outra. Um responsável mandado para `/administrator` receberia 403
    // logo depois de definir a senha pelo convite.
    throw redirect({ to: homeForRole(account.role) })
  },
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return <Outlet />
}
