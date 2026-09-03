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

import { Card, CardContent } from '#/components/ui/card'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/ui/field'
import {
  COURSE_FIELDS,
  COURSE_FORM_DEFAULTS,
  CourseFormFields,
} from './form-fields'
import type { CourseFormType } from './form-fields'
import { AdministratorCourseCreateValidator } from '#/lib/validator'
import type { AdministratorCourseCreatePayload } from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'
import { useCourseCreate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const FORM_ID = 'course-create'

export function CourseFormCreate(): React.JSX.Element {
  // Os três parâmetros explícitos: `COURSE_FORM_DEFAULTS` entra como
  // `DefaultValues<>`, que é um parcial profundo, e o compilador não tem como
  // voltar dele ao tipo do formulário.
  const { form, onValid, shell } = useResourceForm<
    CourseFormType,
    CourseResponse,
    AdministratorCourseCreatePayload
  >({
    formId: FORM_ID,
    validator: AdministratorCourseCreateValidator,
    defaults: COURSE_FORM_DEFAULTS,
    fields: COURSE_FIELDS,
    mutation: useCourseCreate,
    invalidate: queryKeys.courses.all,
    backTo: '/administrator/courses',
    success: (course) => `${course.name} cadastrado.`,
    // Com `retry`: o `create.use-case.ts` recusa a duplicata com
    // `409 COURSE_ALREADY_EXISTS`, então reenviar depois de um 5xx não cria um
    // segundo curso igual.
    retry: 'course-create-error',
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

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Dados do curso</FieldLegend>
              <CourseFormFields form={form} idPrefix="course" />
              <FieldDescription>
                Só curso no ar aparece na vitrine. Fora do ar ele continua aqui,
                com as turmas e as matrículas que já tinha.
              </FieldDescription>
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
