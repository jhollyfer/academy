import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { CaretLeft, CaretRight, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import type { LinkProps } from '@tanstack/react-router'
import type { PaginationMeta } from '#/integrations/response'

/**
 * A listagem do painel: busca, tabela, paginação.
 *
 * Escrita aqui em vez de vir do `common/table/` da referência: aquele são vinte
 * arquivos sobre o TanStack Table, com arrastar coluna, redimensionar e alternar
 * visibilidade. São recursos de uma tela com trinta colunas; aqui são três
 * recursos com cinco colunas cada, e o motor inteiro entraria no bundle para
 * desenhar um `<table>`.
 *
 * **A busca e a página vivem na URL**, e é a regra que a referência mais insiste:
 * filtro em `useState` some no F5 e não sobrevive a um link compartilhado. A
 * secretaria manda "olha essa aqui" no WhatsApp o tempo todo.
 *
 * Quem navega é a **rota**, por `onSearchChange` e `onPageChange`, e não este
 * componente. O roteador do TanStack tipa os search params por rota, e um
 * `navigate({ to: '.' })` genérico aqui dentro não teria como provar que a
 * chave existe no destino - o compilador recusa, e com razão: cada listagem tem
 * o seu conjunto de filtros.
 */

/** Singular ou plural, sem ternário: a regra do projeto é `if`, não `?:`. */
function label(total: number): string {
  if (total === 1) return 'registro'

  return 'registros'
}

/**
 * A página anterior, com a primeira virando `undefined`.
 *
 * `?page=1` é ruído: é o default, e deixá-lo na URL faz o link compartilhado
 * carregar um parâmetro que não muda nada.
 */
function previousPage(page: number): number | undefined {
  if (page - 1 <= 1) return undefined

  return page - 1
}

export type Column<TRow> = {
  key: string
  header: string
  /** A célula. Recebe a linha inteira porque quase toda coluna combina campos. */
  cell: (row: TRow) => React.ReactNode
  /** Some abaixo de `md`. A tabela no celular mostra as três primeiras. */
  hideOnMobile?: boolean
}

export function ListShell<TRow extends { id: string }>({
  title,
  description,
  createTo,
  createLabel,
  search,
  columns,
  rows,
  meta,
  isPending,
  emptyTitle,
  emptyDescription,
  rowTo,
  onSearchChange,
  onPageChange,
}: {
  title: string
  description?: string
  createTo?: LinkProps['to']
  createLabel?: string
  /** O valor atual da busca, lido da URL pela rota. */
  search: string
  columns: ReadonlyArray<Column<TRow>>
  rows: ReadonlyArray<TRow>
  meta: PaginationMeta | undefined
  isPending: boolean
  emptyTitle: string
  emptyDescription: string
  /** Para onde a linha leva. Sem isto, a tabela é só leitura. */
  rowTo?: (row: TRow) => { to: LinkProps['to']; params?: LinkProps['params'] }
  /** Escreve a busca na URL. A rota conhece os próprios search params. */
  onSearchChange: (term: string | undefined) => void
  onPageChange: (page: number | undefined) => void
}): React.JSX.Element {
  const [term, setTerm] = React.useState(search)

  // A busca só vai para a URL depois que a pessoa para de digitar: uma
  // navegação por tecla encheria o histórico e dispararia uma requisição por
  // caractere.
  React.useEffect(() => {
    if (term === search) return

    const timer = setTimeout(() => onSearchChange(term || undefined), 350)

    return () => clearTimeout(timer)
  }, [term, search, onSearchChange])

  const page = meta?.currentPage ?? 1
  const lastPage = meta?.lastPage ?? 1

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>

        {createTo && (
          <Button render={<Link to={createTo} />}>
            <Plus />
            {createLabel}
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar"
          aria-label="Buscar"
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/*
              O esqueleto tem a forma da tabela final, e não um spinner: o
              spinner não diz quantas linhas vêm, e a página salta de altura
              quando elas chegam.
            */}
            {isPending &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                    >
                      <Skeleton className="h-5 w-full max-w-[16ch]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isPending && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <p className="font-medium">{emptyTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
                </TableCell>
              </TableRow>
            )}

            {!isPending &&
              rows.map((row) => {
                const target = rowTo?.(row)

                return (
                  <TableRow key={row.id} className={cn(target && 'cursor-pointer')}>
                    {columns.map((column, index) => (
                      <TableCell
                        key={column.key}
                        className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                      >
                        {/*
                          O link envolve a **primeira** célula, e não a linha:
                          `<a>` não pode conter `<td>`, e um `onClick` na linha
                          inteira não seria alcançável pelo teclado nem abriria
                          em nova aba com o meio do mouse.
                        */}
                        {target && index === 0 && (
                          <Link
                            to={target.to}
                            params={target.params}
                            className="font-medium hover:underline"
                          >
                            {column.cell(row)}
                          </Link>
                        )}
                        {(!target || index > 0) && column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p aria-live="polite">
            {meta.total} {label(meta.total)}, página {page} de {lastPage}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(previousPage(page))}
            >
              <CaretLeft />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
              <CaretRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
