import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import { ACTIVE_STATUS_DOTS, ACTIVE_STATUS_LABELS } from '#/lib/labels'
import { ACTIVE_STATUSES } from '#/lib/entity'
import type { ListSearch } from '#/lib/list-search'

export function PhotoFilters({
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
          to: '/administrator/photos',
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
