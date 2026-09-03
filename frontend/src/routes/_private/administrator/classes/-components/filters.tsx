import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import { CLASS_STATUS_DOTS, CLASS_STATUS_LABELS } from '#/lib/labels'
import { CLASS_STATUSES } from '#/lib/entity'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'
import type { ClassListSearch } from '#/integrations/tanstack-query/queries'

/**
 * `?courseId=` e `?status=` recortam a listagem.
 *
 * O curso vem da própria API e não de um enum: são registros, e a lista muda
 * quando a escola cadastra um curso novo. `perPage: 100` cobre o catálogo
 * inteiro numa página - são dois cursos hoje, e a escola não vai a três dígitos
 * sem que esta tela mude antes.
 *
 * `page: undefined` junto: quem estava na página 3 de tudo e filtra por um
 * curso quase nunca tem página 3 do recorte novo, e a tela abriria vazia sobre
 * um resultado que existe.
 */
export function ClassFilters({
  search,
}: {
  search: ClassListSearch
}): React.JSX.Element {
  const navigate = useNavigate()

  const { data } = useQuery(coursesQueryOptions({ perPage: 100 }))
  const courses = data?.data ?? []

  return (
    <>
      <OptionCombobox
        aria-label="Curso"
        className="w-48"
        value={search.courseId ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/classes',
            search: {
              ...search,
              courseId: value || undefined,
              page: undefined,
            },
          })
        }
        options={[
          { value: '', label: 'Todo curso' },
          ...courses.map((course) => ({
            value: course.id,
            label: course.name,
          })),
        ]}
      />

      <OptionCombobox
        aria-label="Situação"
        className="w-40"
        value={search.status ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/classes',
            search: {
              ...search,
              status: value || undefined,
              page: undefined,
            },
          })
        }
        options={toOptions(
          ['', ...CLASS_STATUSES],
          { ...CLASS_STATUS_LABELS, '': 'Toda situação' },
          CLASS_STATUS_DOTS,
        )}
      />
    </>
  )
}
