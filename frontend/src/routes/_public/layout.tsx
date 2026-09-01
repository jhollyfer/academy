import type * as React from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

/**
 * O site.
 *
 * Sem guard nenhum, e não por esquecimento: é a característica do bloco, igual
 * ao grupo `storefront` de `backend/start/routes.ts`. O que limita o que aparece
 * aqui é a condição de visibilidade do servidor, não a sessão.
 */
export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return <Outlet />
}
