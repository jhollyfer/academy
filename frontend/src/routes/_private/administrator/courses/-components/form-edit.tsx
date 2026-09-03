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
  COURSE_FIELDS,
  COURSE_FORM_DEFAULTS,
  CourseFormFields,
  courseToValues,
} from './form-fields'
import type { CourseFormType } from './form-fields'
import { AdministratorCourseCreateValidator } from '#/lib/validator'
import type { AdministratorCourseUpdatePayload } from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'
import { courseQueryOptions } from '#/integrations/tanstack-query/queries'
import { useCourseUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const route = getRouteApi('/_private/administrator/courses/$id/edit')

const FORM_ID = 'course-update'

export function CourseFormEdit(): React.JSX.Element {
  const { id } = route.useParams()

  // `useSuspenseQuery` e não `useQuery`: o `loader` da rota já garantiu o
  // registro com a mesma chave, e é ele quem trata o 404 e a falha.
  const { data: course } = useSuspenseQuery(courseQueryOptions(id))

  const { form, onValid, shell } = useResourceForm<
    CourseFormType,
    CourseResponse,
    AdministratorCourseUpdatePayload
  >({
    formId: FORM_ID,
    // O validator de **criação**, e não o de atualização: aquele é todo
    // `.optional()`, e o usuário apagaria o nome sem que a tela reclamasse - a
    // API leria o campo ausente como "não mexer" e o nome ficaria o antigo.
    validator: AdministratorCourseCreateValidator,
    defaults: COURSE_FORM_DEFAULTS,
    // `values`, e não um `useEffect` com `form.reset`: os dados da query chegam
    // depois do primeiro render, quando `defaultValues` já congelou.
    values: courseToValues(course),
    fields: COURSE_FIELDS,
    mutation: (options) => useCourseUpdate(id, options),
    invalidate: queryKeys.courses.all,
    backTo: '/administrator/courses/$id',
    backParams: { id },
    success: (updated) => `${updated.name} salvo.`,
    // Reenviar um `PUT` é seguro: ele escreve o mesmo registro, e não um novo.
    retry: 'course-update-error',
    // O formulário segura a forma de **criação** e a API recebe a de
    // atualização. A conversão é identidade porque todo campo obrigatório na
    // criação é opcional na atualização - mandar tudo preenchido é um merge
    // parcial que não deixa nada de fora.
    payload: (values) => values,
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar {course.name}</FormShellTitle>
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
              <CourseFormFields
                form={form}
                idPrefix="edit-course"
                previewUrl={course.cover?.url}
              />
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
