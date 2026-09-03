import type * as React from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from './-components/header'
import { Footer } from './-components/footer'

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

/** O alvo do "pular para o conteúdo". */
const MAIN_ID = 'conteudo'

function RouteComponent(): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col">
      {/*
        Primeiro elemento focável da página. `sr-only` com `focus:not-sr-only`, e
        não `display: none`: escondido de verdade o link não receberia foco e
        deixaria de existir para quem ele serve.
      */}
      <a
        href={'#'.concat(MAIN_ID)}
        className="focus-ring sr-only bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <Header />

      <main id={MAIN_ID} tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
