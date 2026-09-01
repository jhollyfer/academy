import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useResourceForm } from '#/hooks/use-resource-form'
import { useClassCreate } from '#/integrations/tanstack-query/mutations'
import { coursesListQueryOptions } from '#/integrations/tanstack-query/queries'
import { AdministratorClassCreateValidator } from '#/lib/validator'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  FormShell,
  FormShellActions,
  FormShellBack,
  FormShellCard,
  FormShellContent,
  FormShellDiscard,
  FormShellHeader,
  FormShellSubmit,
  FormShellTitle,
} from '#/components/common/form-shell'
import { ClassFormFields } from './-form-fields'
import { CLASS_FIELDS, classDefaults, optionalDate } from './-form-config'
import type { ClassFormValues } from './-form-config'
import type { AdministratorClassCreatePayload } from '#/lib/validator'
import type { ClassResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/turmas/nova')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { data } = useSuspenseQuery(coursesListQueryOptions({ perPage: 100 }))

  const { form, onValid, shell } = useResourceForm<
    ClassFormValues,
    ClassResponse,
    AdministratorClassCreatePayload
  >({
    formId: 'class-create',
    validator: AdministratorClassCreateValidator,
    defaults: classDefaults(),
    fields: CLASS_FIELDS,
    mutation: useClassCreate,
    invalidate: queryKeys.classes.all,
    backTo: '/admin/turmas',
    success: (entity) => `${entity.name} cadastrada.`,
    // Mesma conversão da edição: `<input type="date">` fala `string`, o
    // `vine.date()` quer `Date`.
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

      <FormShellContent>
        <FormShellCard>
          <form id={shell.formId} onSubmit={form.handleSubmit(onValid)}>
            <ClassFormFields form={form} courses={data.data} />
          </form>
        </FormShellCard>
      </FormShellContent>
    </FormShell>
  )
}
