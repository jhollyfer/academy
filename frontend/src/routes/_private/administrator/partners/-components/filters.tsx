import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import { ACTIVE_STATUS_DOTS, ACTIVE_STATUS_LABELS } from '#/lib/labels'
import { ACTIVE_STATUSES } from '#/lib/entity'
import type { ListSearch } from '#/lib/list-search'

/**
 * Só `?status=`, e não o par de filtros do curso: parceiro não tem trilha. A
 * pergunta que a secretaria faz aqui é uma só - "quem saiu do ar?".
 *
 * `page: undefined` junto: quem estava na página 2 de tudo e filtra por "Fora
 * do ar" quase nunca tem página 2 do recorte novo.
 */
export function PartnerFilters({
  search,
}: {
  search: ListSearch & { status?: string }
}): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <OptionCombobox
      aria-label="Situação"
      className="w-40"
      value={search.status ?? ''}
      clearable
      onValueChange={(value) =>
        navigate({
          to: '/administrator/partners',
          search: { ...search, status: value || undefined, page: undefined },
        })
      }
      options={toOptions(
        ['', ...ACTIVE_STATUSES],
        { ...ACTIVE_STATUS_LABELS, '': 'Toda situação' },
        ACTIVE_STATUS_DOTS,
      )}
    />
  )
}
