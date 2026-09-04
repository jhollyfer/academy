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
  PHOTO_FIELDS,
  PHOTO_FORM_DEFAULTS,
  PhotoFormFields,
  photoToValues,
} from './form-fields'
import type { PhotoFormType } from './form-fields'
import { AdministratorPhotoCreateValidator } from '#/lib/validator'
import type { AdministratorPhotoUpdatePayload } from '#/lib/validator'
import type { PhotoResponse } from '#/integrations/response'
import { photoQueryOptions } from '#/integrations/tanstack-query/queries'
import { usePhotoUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useResourceForm } from '#/hooks/use-resource-form'

const route = getRouteApi('/_private/administrator/photos/$id/edit')

const FORM_ID = 'photo-update'

export function PhotoFormEdit(): React.JSX.Element {
  const { id } = route.useParams()

  const { data: photo } = useSuspenseQuery(photoQueryOptions(id))

  const { form, onValid, shell } = useResourceForm<
    PhotoFormType,
    PhotoResponse,
    AdministratorPhotoUpdatePayload
  >({
    formId: FORM_ID,
    // O validator de criação, e não o de atualização: aquele é todo
    // `.optional()`, e a legenda poderia ser apagada sem a tela reclamar.
    validator: AdministratorPhotoCreateValidator,
    defaults: PHOTO_FORM_DEFAULTS,
    values: photoToValues(photo),
    fields: PHOTO_FIELDS,
    mutation: (options) => usePhotoUpdate(id, options),
    invalidate: queryKeys.photos.all,
    backTo: '/administrator/photos',
    success: () => 'Foto salva.',
    retry: 'photo-update-error',
    payload: (values) => values,
  })

  return (
    <FormShell {...shell}>
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar foto</FormShellTitle>
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
              <PhotoFormFields
                form={form}
                idPrefix="edit-photo"
                previewUrl={photo.image?.url}
              />
            </FieldSet>
          </CardContent>
        </Card>
      </FormShellContent>
    </FormShell>
  )
}
