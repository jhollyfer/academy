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
import { USER_FIELDS, USER_FORM_DEFAULTS, UserFormFields } from './form-fields'
import type { UserFormType } from './form-fields'
import { AdministratorUserCreateValidator } from '#/lib/validator'
import type { AdministratorUserCreatePayload } from '#/lib/validator'
import type { ManagedUserResponse } from '#/integrations/response'
import { useUserCreate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const FORM_ID = 'user-create'

/**
 * O único caminho de criação de conta pela interface.
 *
 * Não há cadastro público, e o dono vem do seeder. As contas de responsável e
 * aluno também nascem sozinhas na confirmação da matrícula - esta tela é para
 * quem a secretaria precisa cadastrar à mão, e para corrigir o que o fluxo
 * automático não cobriu.
 */
export function UserFormCreate(): React.JSX.Element {
  // Os três parâmetros explícitos: `USER_FORM_DEFAULTS` é `DefaultValues<>`,
  // que é um parcial profundo, e o compilador não tem como voltar dele ao tipo
  // do formulário.
  const { form, onValid, shell } = useResourceForm<
    UserFormType,
    ManagedUserResponse,
    AdministratorUserCreatePayload
  >({
    formId: FORM_ID,
    validator: AdministratorUserCreateValidator,
    defaults: USER_FORM_DEFAULTS,
    fields: USER_FIELDS,
    mutation: useUserCreate,
    invalidate: queryKeys.users.all,
    backTo: '/administrator/users',
    success: (user) => `Conta de ${user.name} criada.`,
    // Com `retry`: o `create.use-case.ts` recusa e-mail de conta viva com
    // `409 USER_ALREADY_EXISTS`, então reenviar depois de um 5xx que possa ter
    // gravado não cria uma segunda conta - esbarra no 409 e diz isso.
    retry: 'user-create-error',
    /**
     * A senha em branco é **omitida** do corpo, e nunca enviada vazia.
     *
     * É a armadilha do recurso: o `confirmed` do VineJS olha a **chave**, não o
     * valor. `password: ''` mantém a chave, e a API passa a exigir a
     * confirmação de quem escolheu o caminho do convite. A confirmação segue a
     * senha - sozinha ela não tem o que confirmar.
     */
    payload: ({ password, passwordConfirmation, ...rest }) => {
      if (!password) return rest

      return { ...rest, password, passwordConfirmation }
    },
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Adicionar usuário</FormShellTitle>
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
              <UserFormFields form={form} idPrefix="user" />
              <FieldDescription>
                O e-mail de uma conta arquivada reativa aquela linha com os
                dados novos, em vez de criar outra.
              </FieldDescription>
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
