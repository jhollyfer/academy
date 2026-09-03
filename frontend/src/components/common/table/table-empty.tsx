import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { RowData } from '@tanstack/react-table'

import { useTableContext } from './table-context'
import type { TableInstance } from './use-table'

import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from '#/components/ui/empty'
import { cn } from '#/lib/utils'
import { TrashedModes } from '#/lib/entity'

/**
 * Qual dos três vazios está na tela.
 *
 * São três e o texto não pode ser o mesmo: "nada cadastrado" numa busca sem
 * resultado manda a pessoa cadastrar o que já existe, e na lixeira vazia sugere
 * que o recurso inteiro sumiu.
 *
 * Fica no contexto e não em prop porque a tela não sabe qual é - quem sabe é o
 * `search` da URL, que o `TableEmpty` já lê. As partes escritas pela tela
 * servem só ao vazio de verdade; nos outros dois o texto é do componente, e as
 * partes se calam ou se substituem.
 */
type TableEmptyVariant = 'filtered' | 'trash' | 'empty'

type TableEmptyContextValue = {
  variant: TableEmptyVariant
}

const TableEmptyContext = React.createContext<TableEmptyContextValue | null>(
  null,
)

/**
 * Qual vazio está na tela, para quem está dentro de `TableEmpty`.
 *
 * O `consumer` entra na mensagem para o erro dizer **qual** parte ficou fora do
 * provider - sem isso o `throw` reporta "faltou provider" e deixa a busca por
 * conta de quem lê a stack.
 */
function useTableEmptyContext(consumer: string): TableEmptyContextValue {
  const context = React.use(TableEmptyContext)

  if (!context) {
    throw new Error(`\`${consumer}\` precisa estar dentro de \`TableEmpty\``)
  }

  return context
}

type TableEmptyProps<TRow extends RowData> = {
  table: TableInstance<TRow>
  /** O texto e a ação do vazio de verdade - o filtro e a lixeira têm os seus. */
  children?: React.ReactNode
}

/**
 * O que aparece no lugar da tabela quando não há linha nenhuma.
 *
 * Decide sozinho se renderiza, lendo a contagem de linhas da instância - uma
 * prop `isEmpty` seria segunda fonte de verdade ao lado da tabela.
 *
 * `gap-1` e não o `gap-4` do `Empty`: título e descrição andam colados, e é
 * `TableEmptyActions` quem abre o respiro antes do botão.
 */
export function TableEmpty<TRow extends RowData>({
  table,
  children,
}: TableEmptyProps<TRow>): React.JSX.Element | null {
  const { to, search } = useTableContext('TableEmpty')
  const navigate = useNavigate()

  // O filtro vence a lixeira: buscar dentro dela e não achar nada é problema do
  // termo, não da lixeira estar vazia.
  let variant: TableEmptyVariant = 'empty'
  if (search.trashed === TrashedModes.ONLY) variant = 'trash'
  if (search.search) variant = 'filtered'

  const value = React.useMemo(() => ({ variant }), [variant])

  if (table.getRowModel().rows.length > 0) return null

  return (
    <TableEmptyContext.Provider value={value}>
      <Empty className="gap-1 rounded-xl border">
        {children}

        {variant === 'filtered' && (
          <EmptyContent className="mt-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to,
                  search: { ...search, search: undefined, page: undefined },
                })
              }
            >
              Limpar filtro
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </TableEmptyContext.Provider>
  )
}

/** O título do vazio. O filtro e a lixeira têm o seu e ignoram o da tela. */
export function TableEmptyTitle({
  children,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element {
  const { variant } = useTableEmptyContext('TableEmptyTitle')

  return (
    <EmptyTitle data-slot="table-empty-title" {...props}>
      {variant === 'filtered' && 'Nada para esse filtro'}
      {variant === 'trash' && 'A lixeira está vazia'}
      {variant === 'empty' && children}
    </EmptyTitle>
  )
}

/**
 * A descrição do vazio.
 *
 * Só a lista vazia de verdade usa a descrição da tela. As outras duas escrevem a
 * sua, como o título ao lado já fazia: o texto da tela explica o recurso, e
 * explicar o recurso é a resposta errada nas duas.
 *
 * A lixeira mantinha o da tela até isto ser visto de perto na de matrículas: ali
 * sobrava "quando alguém se inscrever pelo site, aparece nesta lista" numa
 * lixeira vazia - a instrução certa para a tela errada. Quem abre a lixeira não
 * quer saber como o recurso nasce; quer saber que ela está vazia e que o que
 * for arquivado cai ali.
 */
export function TableEmptyDescription({
  children,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element {
  const { variant } = useTableEmptyContext('TableEmptyDescription')

  if (variant === 'filtered') {
    return (
      <EmptyDescription data-slot="table-empty-description" {...props}>
        Nada bateu com o termo buscado. Limpe o filtro para ver a lista inteira.
      </EmptyDescription>
    )
  }

  if (variant === 'trash') {
    return (
      <EmptyDescription data-slot="table-empty-description" {...props}>
        Nada foi arquivado ainda. O que você arquivar aparece aqui e pode voltar
        a qualquer momento.
      </EmptyDescription>
    )
  }

  return (
    <EmptyDescription data-slot="table-empty-description" {...props}>
      {children}
    </EmptyDescription>
  )
}

/**
 * A ação oferecida na lista vazia - em geral o `TableCreateButton`.
 *
 * Só no vazio de verdade: mandar cadastrar quem está olhando a lixeira ou um
 * filtro sem resultado é oferecer a saída errada.
 */
export function TableEmptyActions({
  className,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element | null {
  const { variant } = useTableEmptyContext('TableEmptyActions')

  if (variant !== 'empty') return null

  return (
    <EmptyContent
      data-slot="table-empty-actions"
      className={cn('mt-3', className)}
      {...props}
    />
  )
}
