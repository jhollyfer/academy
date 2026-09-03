import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useResourceForm } from '#/hooks/use-resource-form'
import { useCourseCreate } from '#/integrations/tanstack-query/mutations'
import { AdministratorCourseCreateValidator } from '#/lib/validator'
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
import { CourseFormFields } from './-components/form-fields'
import { COURSE_FIELDS, courseDefaults } from './-components/form-config'
import type { AdministratorCourseCreatePayload } from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/cursos/novo')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { form, onValid, shell } = useResourceForm<
    AdministratorCourseCreatePayload,
    CourseResponse,
    AdministratorCourseCreatePayload
  >({
    formId: 'course-create',
    validator: AdministratorCourseCreateValidator,
    defaults: courseDefaults(),
    fields: COURSE_FIELDS,
    mutation: useCourseCreate,
    invalidate: queryKeys.courses.all,
    backTo: '/admin/cursos',
    success: (course) => `${course.name} cadastrado.`,
    // Sem `retry`: o `create` recusa duplicata com 409, então reenviar depois de
    // um 5xx pode ter gravado. O critério está em `applyMutationError`.
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Novo curso</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent>
        <FormShellCard>
          <form id={shell.formId} onSubmit={form.handleSubmit(onValid)}>
            <CourseFormFields form={form} />
          </form>
        </FormShellCard>
      </FormShellContent>
    </FormShell>
  )
}
