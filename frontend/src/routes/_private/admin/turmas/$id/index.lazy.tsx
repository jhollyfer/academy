import type * as React from 'react'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  classDetailQueryOptions,
  coursesListQueryOptions,
} from '#/integrations/tanstack-query/queries'
import {
  useClassArchive,
  useClassDelete,
  useClassUpdate,
} from '#/integrations/tanstack-query/mutations'
import { useResourceForm } from '#/hooks/use-resource-form'
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
import {
  RowActions,
  RowActionsArchive,
  RowActionsDelete,
} from '#/components/common/row-actions'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { ClassFormFields } from '../-form-fields'
import { CLASS_FIELDS, classToValues, optionalDate } from '../-form-config'
import { Route as ClassRoute } from './index'
import type { ClassFormValues } from '../-form-config'
import type { AdministratorClassUpdatePayload } from '#/lib/validator'
import type { ClassResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/turmas/$id/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { id } = ClassRoute.useParams()
  const { data: entity } = useSuspenseQuery(classDetailQueryOptions(id))
  const { data: courses } = useSuspenseQuery(coursesListQueryOptions({ perPage: 100 }))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { form, onValid, shell } = useResourceForm<
    ClassFormValues,
    ClassResponse,
    AdministratorClassUpdatePayload
  >({
    formId: 'class-edit',
    validator: AdministratorClassCreateValidator,
    values: classToValues(entity),
    fields: CLASS_FIELDS,
    mutation: (options) => useClassUpdate(id, options),
    invalidate: queryKeys.classes.all,
    backTo: '/admin/turmas',
    success: (updated) => `${updated.name} salva.`,
    retry: 'class-edit-error',
    // O formulário segura data como `string` (é o que o `<input type="date">`
    // fala) e a API a quer como `Date`. A conversão é aqui, na borda, e não no
    // campo: converter na digitação faria cada tecla criar um `Date` inválido.
    payload: ({ startsAt, endsAt, ...rest }) => ({
      ...rest,
      startsAt: new Date(startsAt),
      endsAt: optionalDate(endsAt),
    }),
  })

  const archive = useClassArchive({
    onSuccess: async function () {
      toast.success('Turma arquivada')
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      await navigate({ to: '/admin/turmas' })
    },
    onError: (error) => toast.error(error.message),
  })

  const remove = useClassDelete({
    onSuccess: async function () {
      toast.success('Turma apagada')
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      await navigate({ to: '/admin/turmas' })
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>{entity.name}</FormShellTitle>
        <FormShellActions>
          <RowActions>
            <RowActionsArchive onConfirm={() => archive.mutate(entity.id)}>
              <ConfirmDialogTitle>Arquivar {entity.name}?</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                A turma some do site e da matrícula. As matrículas dela continuam onde estão, e a
                vaga volta a contar se você restaurar.
              </ConfirmDialogDescription>
            </RowActionsArchive>

            <RowActionsDelete onConfirm={() => remove.mutate(entity.id)}>
              <ConfirmDialogTitle>Apagar {entity.name}?</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                Isto não tem volta. Só funciona em turma já arquivada e sem nenhuma matrícula,
                nem cancelada.
              </ConfirmDialogDescription>
            </RowActionsDelete>
          </RowActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent>
        <FormShellCard>
          <form id={shell.formId} onSubmit={form.handleSubmit(onValid)}>
            <ClassFormFields form={form} courses={courses.data} />
          </form>
        </FormShellCard>
      </FormShellContent>
    </FormShell>
  )
}
