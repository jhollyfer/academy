import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import {
  ACTIVE_STATUS_DOTS,
  ACTIVE_STATUS_LABELS,
  USER_ROLE_LABELS,
} from '#/lib/labels'
import { ACTIVE_STATUSES, USER_ROLES } from '#/lib/entity'
import type { ListSearch } from '#/lib/list-search'

/**
 * `?role=` e `?status=` recortam a listagem.
 *
 * O papel é o filtro que separa "a equipe" de "as famílias" numa base em que os
 * quatro convivem - é a pergunta que a secretaria mais faz aqui. A lista inclui
 * `OWNER`: filtrar não é atribuir, e quem não pode vê-lo simplesmente não o
 * recebe na resposta.
 */
export function UserFilters({
  search,
}: {
  search: ListSearch & { role?: string; status?: string }
}): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <>
      <OptionCombobox
        aria-label="Papel"
        className="w-44"
        value={search.role ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/users',
            search: { ...search, role: value || undefined, page: undefined },
          })
        }
        options={toOptions(['', ...USER_ROLES], {
          ...USER_ROLE_LABELS,
          '': 'Todo papel',
        })}
      />

      <OptionCombobox
        aria-label="Situação"
        className="w-40"
        value={search.status ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/users',
            search: { ...search, status: value || undefined, page: undefined },
          })
        }
        options={toOptions(
          ['', ...ACTIVE_STATUSES],
          { ...ACTIVE_STATUS_LABELS, '': 'Toda situação' },
          ACTIVE_STATUS_DOTS,
        )}
      />
    </>
  )
}
