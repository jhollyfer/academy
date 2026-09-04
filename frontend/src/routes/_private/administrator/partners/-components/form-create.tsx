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
  PARTNER_FIELDS,
  PARTNER_FORM_DEFAULTS,
  PartnerFormFields,
} from './form-fields'
import type { PartnerFormType } from './form-fields'
import { AdministratorPartnerCreateValidator } from '#/lib/validator'
import type { AdministratorPartnerCreatePayload } from '#/lib/validator'
import type { PartnerResponse } from '#/integrations/response'
import { usePartnerCreate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const FORM_ID = 'partner-create'

export function PartnerFormCreate(): React.JSX.Element {
  const { form, onValid, shell } = useResourceForm<
    PartnerFormType,
    PartnerResponse,
    AdministratorPartnerCreatePayload
  >({
    formId: FORM_ID,
    validator: AdministratorPartnerCreateValidator,
    defaults: PARTNER_FORM_DEFAULTS,
    fields: PARTNER_FIELDS,
    mutation: usePartnerCreate,
    invalidate: queryKeys.partners.all,
    backTo: '/administrator/partners',
    success: (partner) => `${partner.name} cadastrado.`,
    // Com `retry`: o `create.use-case.ts` recusa a duplicata com
    // `409 PARTNER_ALREADY_EXISTS`, então reenviar depois de um 5xx não cria um
    // segundo parceiro igual.
    retry: 'partner-create-error',
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Novo parceiro</FormShellTitle>
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
              <PartnerFormFields form={form} idPrefix="partner" />
              <FieldDescription>
                A faixa de parceiros some da home quando não há nenhum no ar.
              </FieldDescription>
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
