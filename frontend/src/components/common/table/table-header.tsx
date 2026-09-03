import { PlusIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type * as React from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

/**
 * O cabeçalho fixo da listagem: título e descrição à esquerda, ações à direita.
 *
 * Slots e não props de texto porque as telas não concordam sobre o que vai
 * aqui: a de depoimentos não cria nada - eles chegam da vitrine -, a de
 * notícias cria, e a da biblioteca de arquivos não tem descrição. Com prop,
 * cada uma dessas variações vira mais uma
 * prop opcional aqui dentro; com slot, a tela escreve o que tem e omite o
 * resto.
 *
 * A grade de duas colunas só existe quando há `TableActions` - é o mesmo
 * `has-data-[slot=...]` que o `Card` usa, e é o que deixa o título ocupar a
 * linha inteira quando a tela não tem ação nenhuma.
 */
function TableHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="table-header"
      className={cn(
        'grid shrink-0 auto-rows-min items-start gap-1 border-b pb-3 has-data-[slot=table-actions]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  )
}

function TableTitle({
  className,
  ...props
}: React.ComponentProps<'h1'>): React.JSX.Element {
  return (
    <h1
      data-slot="table-title"
      // `min-w-0` porque item de grade tem `min-width: auto`: sem isto um título
      // longo empurra a coluna `1fr` em vez de quebrar dentro dela, e é a barra
      // de ações ao lado que paga a conta. Não `truncate` - o título é o nome da
      // tela, e cortá-lo com reticências é pior que quebrá-lo em duas linhas.
      className={cn('min-w-0 text-2xl font-bold', className)}
      {...props}
    />
  )
}

/** Some quando a tela não tem o que explicar - nem toda listagem precisa. */
function TableDescription({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element | null {
  if (!children) return null

  return (
    <div
      data-slot="table-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * As ações da direita: criar, exportar, o que a tela tiver - uma, três ou
 * nenhuma. `flex-wrap` porque três botões não cabem lado a lado no telefone.
 *
 * `col-start-2` é obrigatório, e a falta dele invertia o cabeçalho inteiro. No
 * posicionamento automático da grade, um item com linha definida (`row-start-1`)
 * é colocado **antes** dos itens sem posição nenhuma: sem dizer a coluna, estas
 * ações tomavam a `1fr` e empurravam o título para a `auto`, que é estreita. O
 * resultado era o botão à esquerda, o título espremido contra a borda direita, e
 * a ação difícil de acertar com o dedo quando a tela apertava.
 */
function TableActions({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element | null {
  if (!children) return null

  return (
    <div
      data-slot="table-actions"
      className={cn(
        'col-start-2 row-span-2 row-start-1 flex flex-wrap items-center justify-end gap-2 self-start justify-self-end',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * O botão de criar, para o cabeçalho e para o estado vazio.
 *
 * `Link` e não `onClick` com `navigate()`: criar é navegação, e como link ele
 * responde a abrir em nova aba, ao clique do meio e ao menu de contexto.
 */
function TableCreateButton({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Button
      type="button"
      // `nativeButton={false}` porque o `render` entrega um `<a>`: sem ele o
      // Base UI avisa no console a cada render que esperava um `<button>`
      // nativo. É o mesmo par usado no `page-shell` e no `not-found-page`.
      nativeButton={false}
      render={
        <Link to={to}>
          <PlusIcon />
          {children}
        </Link>
      }
    />
  )
}

export {
  TableActions,
  TableCreateButton,
  TableDescription,
  TableHeader,
  TableTitle,
}
