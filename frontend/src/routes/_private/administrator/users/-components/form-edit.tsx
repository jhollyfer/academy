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
import { getRouteApi, notFound } from '@tanstack/react-router'
import type * as React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardContent } from '#/components/ui/card'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/ui/field'
import { USER_FIELDS, UserFormFields } from './form-fields'
import type { UserFormType } from './form-fields'
import { AdministratorUserUpdateValidator } from '#/lib/validator'
import { manageableRoleOf } from '#/lib/entity'
import type { AdministratorUserUpdatePayload } from '#/lib/validator'
import type { ManagedUserResponse } from '#/integrations/response'
import { userQueryOptions } from '#/integrations/tanstack-query/queries'
import { useUserUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const route = getRouteApi('/_private/administrator/users/$id/edit')

const FORM_ID = 'user-update'

export function UserFormEdit(): React.JSX.Element {
  const { id } = route.useParams()

  // `useSuspenseQuery` e não `useQuery`: o `loader` da rota já garantiu o
  // registro com a mesma chave, e é ele quem trata o 404 e a falha.
  const { data: user } = useSuspenseQuery(userQueryOptions(id))

  /**
   * O dono não se edita por aqui, e a tela recusa abrir.
   *
   * `notFound()` e não um papel de partida: a `UserPolicy` já responde 404 para
   * quem não é dono, então este ramo só é alcançável pelo próprio dono abrindo
   * a própria edição. Escolher um papel de partida ali o **rebaixaria** no
   * primeiro salvamento, em silêncio - falhar alto é o comportamento correto.
   */
  const role = manageableRoleOf(user.role)
  if (role === undefined) throw notFound()

  const { form, onValid, shell } = useResourceForm<
    UserFormType,
    ManagedUserResponse,
    AdministratorUserUpdatePayload
  >({
    formId: FORM_ID,
    /**
     * O validator de **atualização**, e não o de criação.
     *
     * Aqui não há campo de senha: o `PUT` do backend não a aceita. Redefinir a
     * senha de outra pessoa é emitir convite, e trocar a própria é `/account` -
     * um formulário que aceitasse a senha deixaria a secretaria assumir a conta
     * de uma família sem deixar rastro.
     */
    validator: AdministratorUserUpdateValidator,
    // `values`, e não um `useEffect` com `form.reset`: os dados da query chegam
    // depois do primeiro render, quando `defaultValues` já congelou.
    values: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role,
      status: user.status,
      avatarId: user.avatarId,
    },
    fields: USER_FIELDS,
    mutation: (options) => useUserUpdate(id, options),
    invalidate: queryKeys.users.all,
    backTo: '/administrator/users/$id',
    backParams: { id },
    success: (updated) => `Conta de ${updated.name} salva.`,
    // Reenviar um `PUT` é seguro: ele escreve o mesmo registro, e não um novo.
    retry: 'user-update-error',
    // O `id` não entra no corpo: ele vive no caminho, e é `useUserUpdate(id)`
    // que o carrega. A conversão é identidade porque todo campo do formulário é
    // opcional na atualização - mandar tudo preenchido é um merge parcial que
    // não deixa nada de fora.
    payload: (values) => values,
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar {user.name}</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Identidade e acesso</FieldLegend>
              <UserFormFields
                form={form}
                idPrefix="edit-user"
                previewUrl={user.avatar?.url}
                withPassword={false}
              />
              <FieldDescription>
                Desativar a conta encerra o acesso na requisição seguinte, sem
                esperar o token expirar.
              </FieldDescription>
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
