import type * as React from 'react'
import { FlexRender } from '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'

import type { TableInstance } from './use-table'

import { cn } from '#/lib/utils'

type TableMobileCardsProps<TRow extends RowData> = {
  table: TableInstance<TRow>
  onRowClick?: (row: TRow) => void
}

/**
 * A mesma tabela, empilhada em `rótulo: valor`, para telas estreitas.
 *
 * Uma tabela de sete colunas num celular vira ou rolagem horizontal infinita ou
 * texto de 8px. Empilhar resolve, e sem duplicar nada: os mesmos `cell` das
 * colunas são reaproveitados, então uma coluna nova aparece aqui sozinha.
 *
 * As colunas **de exibição** - seleção, ações, tudo que não tem `accessorFn` -
 * vão numa faixa de controles no topo do card, e não na lista de pares: elas não
 * têm rótulo, e um `: ` sem nada antes fica órfão.
 */
export function TableMobileCards<TRow extends RowData>({
  table,
  onRowClick,
}: TableMobileCardsProps<TRow>): React.JSX.Element {
  const rows = table.getRowModel().rows

  const labels = new Map<string, string>()
  for (const column of table.getAllColumns()) {
    const label = column.columnDef.meta?.label
    if (label) labels.set(column.id, label)
  }

  return (
    <div data-slot="table-mobile-cards" className="flex flex-col gap-3 p-1">
      {rows.map((row, index) => {
        const cells = row.getVisibleCells()
        const controls = cells.filter((cell) => !cell.column.accessorFn)
        const values = cells.filter((cell) => cell.column.accessorFn)

        let state: 'selected' | undefined = undefined
        if (row.getIsSelected()) state = 'selected'

        return (
          <div
            key={row.id}
            data-test-id={`table-card-${index}`}
            data-state={state}
            className={cn(
              'flex flex-col gap-2 rounded-lg border bg-card p-3',
              'data-[state=selected]:border-primary data-[state=selected]:bg-muted/40',
              onRowClick && 'cursor-pointer',
            )}
            onClick={() => onRowClick?.(row.original)}
          >
            {controls.length > 0 && (
              <div
                className="flex flex-wrap items-center justify-between gap-2"
                // Clicar na caixa de seleção ou no menu não deve também abrir o
                // registro.
                onClick={(event) => event.stopPropagation()}
              >
                {controls.map((cell) => (
                  <div key={cell.id}>
                    <FlexRender cell={cell} />
                  </div>
                ))}
              </div>
            )}

            <dl className="flex flex-col gap-1.5">
              {values.map((cell) => (
                <div
                  key={cell.id}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="max-w-[45%] shrink-0 truncate text-xs font-medium text-muted-foreground">
                    {labels.get(cell.column.id) ?? cell.column.id}
                  </dt>
                  <dd className="min-w-0 text-right text-sm break-words">
                    <FlexRender cell={cell} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
