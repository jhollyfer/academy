import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import {
  ACTIVE_STATUS_DOTS,
  ACTIVE_STATUS_LABELS,
  COURSE_ACCENT_LABELS,
} from '#/lib/labels'
import { ACTIVE_STATUSES, COURSE_ACCENTS } from '#/lib/entity'
import type { ListSearch } from '#/lib/list-search'

/**
 * `?status=` e `?accent=` recortam a listagem, como o validator do backend
 * aceita. São dois, e não um: o curso tem ciclo de publicação **e** trilha, e
 * as duas perguntas da secretaria - "o que está fora do ar?" e "o que é de
 * robótica?" - não são a mesma.
 *
 * `page: undefined` junto: quem estava na página 3 de tudo e filtra por
 * "Fora do ar" quase nunca tem página 3 do recorte novo, e a tela abriria vazia
 * sobre um resultado que existe.
 *
 * Os dois convivem sem se apagar - o `...search` preserva o outro -, porque o
 * `paginate` do backend também os aplica juntos.
 */
export function CourseFilters({
  search,
}: {
  search: ListSearch & { status?: string; accent?: string }
}): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <>
      <OptionCombobox
        aria-label="Trilha"
        className="w-40"
        value={search.accent ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/courses',
            search: {
              ...search,
              accent: value || undefined,
              page: undefined,
            },
          })
        }
        // Sem bolinha: trilha não é estado, e `COURSE_ACCENT_LABELS` não tem
        // par de cores por isso mesmo.
        options={toOptions(['', ...COURSE_ACCENTS], {
          ...COURSE_ACCENT_LABELS,
          '': 'Toda trilha',
        })}
      />

      <OptionCombobox
        aria-label="Situação"
        className="w-40"
        value={search.status ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/courses',
            search: {
              ...search,
              status: value || undefined,
              page: undefined,
            },
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
