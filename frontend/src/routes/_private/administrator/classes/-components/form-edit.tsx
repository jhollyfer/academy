import {
  FormShell,
  FormShellActions,
  FormShellBack,
  FormShellContent,
  FormShellDiscard,
  FormShellHeader,
  FormShellSubmit,
  FormShellTitle,
} from '#/components/common/form-shell'
import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardContent } from '#/components/ui/card'
import { FieldLegend, FieldSet } from '#/components/ui/field'
import {
  CLASS_FIELDS,
  CLASS_FORM_DEFAULTS,
  ClassFormFields,
  classToValues,
  optionalDate,
} from './form-fields'
import type { ClassFormValues } from './form-fields'
import { AdministratorClassCreateValidator } from '#/lib/validator'
import type { AdministratorClassUpdatePayload } from '#/lib/validator'
import type { ClassResponse } from '#/integrations/response'
import {
  classQueryOptions,
  coursesQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { useClassUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const route = getRouteApi('/_private/administrator/classes/$id/edit')

const FORM_ID = 'class-update'

export function ClassFormEdit(): React.JSX.Element {
  const { id } = route.useParams()

  // `useSuspenseQuery` e não `useQuery`: o `loader` da rota já garantiu o
  // registro com a mesma chave, e é ele quem trata o 404 e a falha.
  const { data: entity } = useSuspenseQuery(classQueryOptions(id))
  const { data: courses } = useSuspenseQuery(
    coursesQueryOptions({ perPage: 100 }),
  )

  const { form, onValid, shell } = useResourceForm<
    ClassFormValues,
    ClassResponse,
    AdministratorClassUpdatePayload
  >({
    formId: FORM_ID,
    // O validator de **criação**, e não o de atualização: aquele é todo
    // `.optional()`, e o usuário apagaria a data da primeira aula sem que a
    // tela reclamasse.
    validator: AdministratorClassCreateValidator,
    defaults: CLASS_FORM_DEFAULTS,
    // `values`, e não um `useEffect` com `form.reset`: os dados da query chegam
    // depois do primeiro render, quando `defaultValues` já congelou.
    values: classToValues(entity),
    fields: CLASS_FIELDS,
    mutation: (options) => useClassUpdate(id, options),
    invalidate: queryKeys.classes.all,
    backTo: '/administrator/classes/$id',
    backParams: { id },
    success: (updated) => `${updated.name} salva.`,
    retry: 'class-update-error',
    payload: ({ startsAt, endsAt, ...rest }) => ({
      ...rest,
      startsAt: new Date(startsAt),
      endsAt: optionalDate(endsAt),
    }),
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar {entity.name}</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Dados da turma</FieldLegend>
              <ClassFormFields
                form={form}
                courses={courses.data}
                idPrefix="edit-class"
              />
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
