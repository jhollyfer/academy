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
import type * as React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardContent } from '#/components/ui/card'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/ui/field'
import {
  CLASS_FIELDS,
  CLASS_FORM_DEFAULTS,
  ClassFormFields,
  optionalDate,
} from './form-fields'
import type { ClassFormValues } from './form-fields'
import { AdministratorClassCreateValidator } from '#/lib/validator'
import type { AdministratorClassCreatePayload } from '#/lib/validator'
import type { ClassResponse } from '#/integrations/response'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { useClassCreate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const FORM_ID = 'class-create'

export function ClassFormCreate(): React.JSX.Element {
  // `perPage: 100` cobre o catálogo inteiro numa página: são dois cursos hoje,
  // e a escola não vai a três dígitos sem que esta tela mude antes.
  const { data } = useSuspenseQuery(coursesQueryOptions({ perPage: 100 }))

  const { form, onValid, shell } = useResourceForm<
    ClassFormValues,
    ClassResponse,
    AdministratorClassCreatePayload
  >({
    formId: FORM_ID,
    validator: AdministratorClassCreateValidator,
    defaults: CLASS_FORM_DEFAULTS,
    fields: CLASS_FIELDS,
    mutation: useClassCreate,
    invalidate: queryKeys.classes.all,
    backTo: '/administrator/classes',
    success: (entity) => `${entity.name} cadastrada.`,
    // `<input type="date">` fala `string`, o `vine.date()` quer `Date`. A
    // conversão é do envio, e não do campo: o input controlado por `Date`
    // voltaria a ser não-controlado no meio da digitação.
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
        <FormShellTitle>Nova turma</FormShellTitle>
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
                courses={data.data}
                idPrefix="class"
              />
              <FieldDescription>
                Turma aberta é a que a matrícula do site oferece. Quando a
                última vaga é ocupada ela vira "Lotada" sozinha.
              </FieldDescription>
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
