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
import { FieldLegend, FieldSet } from '#/components/ui/field'
import {
  PHOTO_FIELDS,
  PHOTO_FORM_DEFAULTS,
  PhotoFormFields,
} from './form-fields'
import type { PhotoFormType } from './form-fields'
import { AdministratorPhotoCreateValidator } from '#/lib/validator'
import type { AdministratorPhotoCreatePayload } from '#/lib/validator'
import type { PhotoResponse } from '#/integrations/response'
import { usePhotoCreate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const FORM_ID = 'photo-create'

export function PhotoFormCreate(): React.JSX.Element {
  const { form, onValid, shell } = useResourceForm<
    PhotoFormType,
    PhotoResponse,
    AdministratorPhotoCreatePayload
  >({
    formId: FORM_ID,
    validator: AdministratorPhotoCreateValidator,
    defaults: PHOTO_FORM_DEFAULTS,
    fields: PHOTO_FIELDS,
    mutation: usePhotoCreate,
    invalidate: queryKeys.photos.all,
    backTo: '/administrator/photos',
    success: () => 'Foto publicada.',
    // Sem `retry`: a criação não tem guarda de duplicata, e reenviar depois de
    // um 5xx publicaria a mesma foto duas vezes.
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Nova foto</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Dados da foto</FieldLegend>
              <PhotoFormFields form={form} idPrefix="photo" />
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
