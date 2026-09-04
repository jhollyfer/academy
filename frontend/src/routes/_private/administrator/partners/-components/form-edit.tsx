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
  PARTNER_FIELDS,
  PARTNER_FORM_DEFAULTS,
  PartnerFormFields,
  partnerToValues,
} from './form-fields'
import type { PartnerFormType } from './form-fields'
import { AdministratorPartnerCreateValidator } from '#/lib/validator'
import type { AdministratorPartnerUpdatePayload } from '#/lib/validator'
import type { PartnerResponse } from '#/integrations/response'
import { partnerQueryOptions } from '#/integrations/tanstack-query/queries'
import { usePartnerUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const route = getRouteApi('/_private/administrator/partners/$id/edit')

const FORM_ID = 'partner-update'

export function PartnerFormEdit(): React.JSX.Element {
  const { id } = route.useParams()

  // `useSuspenseQuery` e não `useQuery`: o `loader` da rota já garantiu o
  // registro com a mesma chave, e é ele quem trata o 404 e a falha.
  const { data: partner } = useSuspenseQuery(partnerQueryOptions(id))

  const { form, onValid, shell } = useResourceForm<
    PartnerFormType,
    PartnerResponse,
    AdministratorPartnerUpdatePayload
  >({
    formId: FORM_ID,
    // O validator de **criação**, e não o de atualização: aquele é todo
    // `.optional()`, e o usuário apagaria o nome sem que a tela reclamasse.
    validator: AdministratorPartnerCreateValidator,
    defaults: PARTNER_FORM_DEFAULTS,
    // `values`, e não um `useEffect` com `form.reset`: os dados da query chegam
    // depois do primeiro render, quando `defaultValues` já congelou.
    values: partnerToValues(partner),
    fields: PARTNER_FIELDS,
    mutation: (options) => usePartnerUpdate(id, options),
    invalidate: queryKeys.partners.all,
    backTo: '/administrator/partners/$id',
    backParams: { id },
    success: (updated) => `${updated.name} salvo.`,
    // Reenviar um `PUT` é seguro: ele escreve o mesmo registro, e não um novo.
    retry: 'partner-update-error',
    // O formulário segura a forma de **criação** e a API recebe a de
    // atualização. A conversão é identidade porque todo campo obrigatório na
    // criação é opcional na atualização.
    payload: (values) => values,
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar {partner.name}</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Dados do parceiro</FieldLegend>
              <PartnerFormFields
                form={form}
                idPrefix="edit-partner"
                previewUrl={partner.logo?.url}
              />
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
