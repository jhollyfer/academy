import type * as React from 'react'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { courseDetailQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  useCourseArchive,
  useCourseDelete,
  useCourseUpdate,
} from '#/integrations/tanstack-query/mutations'
import { useResourceForm } from '#/hooks/use-resource-form'
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
import {
  RowActions,
  RowActionsArchive,
  RowActionsDelete,
} from '#/components/common/row-actions'
import {
  ConfirmDialogDescription,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { CourseFormFields } from '../-components/form-fields'
import { COURSE_FIELDS, courseToValues } from '../-components/form-config'
import { Route as CourseRoute } from './index'
import type {
  AdministratorCourseCreatePayload,
  AdministratorCourseUpdatePayload,
} from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/cursos/$id/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { id } = CourseRoute.useParams()
  const { data: course } = useSuspenseQuery(courseDetailQueryOptions(id))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { form, onValid, shell } = useResourceForm<
    AdministratorCourseCreatePayload,
    CourseResponse,
    AdministratorCourseUpdatePayload
  >({
    formId: 'course-edit',
    // O validator de **criação**, e não o de atualização: a tela de edição
    // preenche todos os campos, e validar com o opcional deixaria alguém limpar
    // um campo obrigatório e só descobrir no 422.
    validator: AdministratorCourseCreateValidator,
    values: courseToValues(course),
    fields: COURSE_FIELDS,
    mutation: (options) => useCourseUpdate(id, options),
    invalidate: queryKeys.courses.all,
    backTo: '/admin/cursos',
    success: (updated) => `${updated.name} salvo.`,
    // Aqui o reenvio é seguro: a atualização é idempotente.
    retry: 'course-edit-error',
    // O formulário segura a forma de **criação** e a API recebe a de
    // atualização. A conversão é identidade porque todo campo obrigatório na
    // criação é opcional na atualização - mandar tudo preenchido é um merge
    // parcial que não deixa nada de fora.
    payload: (values) => values,
  })

  const archive = useCourseArchive({
    onSuccess: async function () {
      toast.success('Curso arquivado')
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      await navigate({ to: '/admin/cursos' })
    },
    onError: (error) => toast.error(error.message),
  })

  const remove = useCourseDelete({
    onSuccess: async function () {
      toast.success('Curso apagado')
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      await navigate({ to: '/admin/cursos' })
    },
    // O 409 de "possui turmas" chega aqui. A mensagem do backend já diz o que
    // fazer, então repeti-la é melhor que uma genérica.
    onError: (error) => toast.error(error.message),
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>{course.name}</FormShellTitle>
        <FormShellActions>
          <RowActions>
            {/*
              O título nomeia o registro, e não "Tem certeza?": numa tela cheia
              de cursos, a frase genérica não diz qual está prestes a sair.
            */}
            <RowActionsArchive onConfirm={() => archive.mutate(course.id)}>
              <ConfirmDialogTitle>Arquivar {course.name}?</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                O curso sai do site e da listagem. As turmas e as matrículas continuam onde
                estão, e dá para restaurar depois.
              </ConfirmDialogDescription>
            </RowActionsArchive>

            <RowActionsDelete onConfirm={() => remove.mutate(course.id)}>
              <ConfirmDialogTitle>Apagar {course.name}?</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                Isto não tem volta: a grade e o FAQ vão junto. Só funciona em curso já arquivado
                e sem turma.
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
            <CourseFormFields form={form} />
          </form>
        </FormShellCard>
      </FormShellContent>
    </FormShell>
  )
}
