import type * as React from 'react'
import { Controller } from 'react-hook-form'
import { Input } from '#/components/ui/input'
import { errorId, invalidProps } from '#/lib/form-a11y'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ACTIVE_STATUSES } from '#/lib/entity'
import { ACTIVE_STATUS_LABELS } from '#/lib/labels'
import {
  ImageField,
  ImageFieldActions,
  ImageFieldContent,
  ImageFieldDescription,
  ImageFieldPreview,
  ImageFieldRemove,
  ImageFieldUpload,
} from '#/components/common/image-field'
import type { UseFormReturn } from 'react-hook-form'
import type { AdministratorPhotoCreatePayload } from '#/lib/validator'
import type { PhotoResponse } from '#/integrations/response'

export type PhotoFormType = AdministratorPhotoCreatePayload

type PhotoFormFieldsProps = {
  form: UseFormReturn<PhotoFormType>
  idPrefix: string
  previewUrl?: string | null
}

export function PhotoFormFields({
  form,
  idPrefix,
  previewUrl,
}: PhotoFormFieldsProps): React.JSX.Element {
  return (
    <FieldGroup className="gap-8">
      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">A foto</legend>

        <Controller
          control={form.control}
          name="imageId"
          render={({ field, fieldState }) => (
            <ImageField
              id={`${idPrefix}-imageId`}
              {...invalidProps(fieldState.invalid, 'imageId')}
              // `|| null` e não `?? null`: o campo é obrigatório e nasce como
              // string vazia, e `''` faria o preview tentar carregar um id que
              // não existe.
              value={field.value || null}
              onValueChange={field.onChange}
              previewUrl={previewUrl}
            >
              <FieldLabel htmlFor={`${idPrefix}-imageId`}>Imagem</FieldLabel>
              <ImageFieldContent>
                {/* `alt` vazio: a legenda está no campo abaixo, e é ela que o
                    leitor de tela lê na galeria. */}
                <ImageFieldPreview alt="">Foto</ImageFieldPreview>
                <ImageFieldActions>
                  <ImageFieldUpload>Enviar foto</ImageFieldUpload>
                  <ImageFieldRemove />
                </ImageFieldActions>
              </ImageFieldContent>
              <ImageFieldDescription>
                Foto do espaço, dos equipamentos ou da turma. JPEG, PNG ou WebP.
              </ImageFieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('imageId')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </ImageField>
          )}
        />

        <Controller
          control={form.control}
          name="caption"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-caption`}>Legenda</FieldLabel>
              <Input
                {...field}
                id={`${idPrefix}-caption`}
                placeholder="A sala do CETI num sábado de manhã"
                {...invalidProps(fieldState.invalid, 'caption')}
              />
              <FieldDescription>
                Diga o que se está vendo e onde. É a legenda que faz a foto
                provar alguma coisa: "alunos felizes" não prova nada.
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('caption')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">Publicação</legend>

        <Controller
          control={form.control}
          name="position"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-position`}>Posição</FieldLabel>
              <Input
                {...field}
                value={field.value ?? 0}
                onChange={(event) => field.onChange(Number(event.target.value))}
                id={`${idPrefix}-position`}
                type="number"
                min={0}
                max={999}
                {...invalidProps(fieldState.invalid, 'position')}
              />
              <FieldDescription>
                A ordem na galeria. Menor aparece primeiro.
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('position')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-status`}>Situação</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={`${idPrefix}-status`}
                  {...invalidProps(fieldState.invalid, 'status')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ACTIVE_STATUS_LABELS[status] ?? status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                A galeria some do site quando não há nenhuma foto no ar.
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('status')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />
      </fieldset>
    </FieldGroup>
  )
}

export const PHOTO_FIELDS = [
  'imageId',
  'caption',
  'position',
  'status',
] as const

export const PHOTO_FORM_DEFAULTS: PhotoFormType = {
  // String vazia e não `null`: o campo é obrigatório, e o validator acusa o
  // vazio como "informe a imagem" em vez de deixar o formulário submeter.
  imageId: '',
  caption: '',
  position: 0,
  status: 'ACTIVE',
}

export function photoToValues(photo: PhotoResponse): PhotoFormType {
  return {
    imageId: photo.imageId,
    caption: photo.caption,
    position: photo.position,
    status: photo.status,
  }
}
