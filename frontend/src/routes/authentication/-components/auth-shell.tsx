import type * as React from 'react'

import { cn } from '#/lib/utils'

/**
 * A moldura das telas de autenticação: uma coluna centrada, com a marca acima
 * do formulário.
 *
 * **Só a moldura.** O que aparece acima do formulário são partes, e cada tela
 * escreve as que tem - hoje é uma tela só, mas a moldura já não é dela: ela é
 * do grupo `authentication`, e é por isso que mora aqui e não dentro do
 * `_sign-in/`.
 *
 * **Sem contexto:** não há estado a compartilhar entre as partes - cada uma se
 * basta. Um provider vazio aqui seria o "unnecessary Context overhead" que a
 * própria regra de compound desaconselha. Pelo mesmo motivo elas cabem num
 * arquivo só: a pasta por componente existe para o contexto e o hook-guard
 * morarem separados, e aqui não há nem um nem outro.
 */
export function AuthShell({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="auth-shell"
      className={cn(
        'relative flex min-h-svh items-center justify-center px-4 py-12',
        className,
      )}
      {...props}
    >
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  )
}

/**
 * A marca, acima do formulário.
 *
 * `<h1>` porque é o título da página: a tela de login não tem outro, e um
 * documento sem `h1` deixa quem navega por cabeçalho sem ponto de entrada.
 */
export function AuthShellBrand({
  className,
  ...props
}: React.ComponentProps<'h1'>): React.JSX.Element {
  return (
    <h1
      data-slot="auth-shell-brand"
      className={cn('brand-title text-2xl', className)}
      {...props}
    />
  )
}

/** A linha que diz de quem é a porta. */
export function AuthShellDescription({
  className,
  ...props
}: React.ComponentProps<'p'>): React.JSX.Element {
  return (
    <p
      data-slot="auth-shell-description"
      className={cn('text-muted-foreground mt-1 text-sm', className)}
      {...props}
    />
  )
}
