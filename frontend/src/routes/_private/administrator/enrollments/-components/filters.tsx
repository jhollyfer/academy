import type * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { OptionCombobox, toOptions } from '#/components/common/option-combobox'
import { ENROLLMENT_STATUS_DOTS, ENROLLMENT_STATUS_LABELS } from '#/lib/labels'
import { ENROLLMENT_STATUSES } from '#/lib/entity'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'
import type { EnrollmentListSearch } from '#/integrations/tanstack-query/queries'

/**
 * `?courseId=` e `?status=` recortam a fila da secretaria.
 *
 * Combobox e não a fileira de botões que esta tela tinha: os quatro botões de
 * situação já não cabiam ao lado da busca e do seletor de curso, e a barra
 * quebrava em duas linhas no notebook. O componente é o mesmo das outras duas
 * listagens, e é isso que faz o painel inteiro filtrar do mesmo jeito.
 *
 * `page: undefined` junto: quem estava na página 3 de tudo e filtra por
 * "Confirmada" quase nunca tem página 3 do recorte novo.
 */
export function EnrollmentFilters({
  search,
}: {
  search: EnrollmentListSearch
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
            to: '/administrator/enrollments',
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
        className="w-44"
        value={search.status ?? ''}
        clearable
        onValueChange={(value) =>
          navigate({
            to: '/administrator/enrollments',
            search: {
              ...search,
              status: value || undefined,
              page: undefined,
            },
          })
        }
        options={toOptions(
          ['', ...ENROLLMENT_STATUSES],
          { ...ENROLLMENT_STATUS_LABELS, '': 'Toda situação' },
          ENROLLMENT_STATUS_DOTS,
        )}
      />
    </>
  )
}
