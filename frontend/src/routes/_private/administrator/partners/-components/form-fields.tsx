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
import type { AdministratorPartnerCreatePayload } from '#/lib/validator'
import type { PartnerResponse } from '#/integrations/response'

/**
 * A forma que o formulário segura: a de **criação**, pelo mesmo motivo do
 * curso. A de atualização é toda `.optional()`, e o `vineResolver` deixaria
 * passar um campo obrigatório apagado.
 */
export type PartnerFormType = AdministratorPartnerCreatePayload

type PartnerFormFieldsProps = {
  form: UseFormReturn<PartnerFormType>
  /** O prefixo dos `id` dos campos, para `htmlFor` não colidir na página. */
  idPrefix: string
  /** A logomarca já salva, para o preview nascer preenchido na edição. */
  previewUrl?: string | null
}

export function PartnerFormFields({
  form,
  idPrefix,
  previewUrl,
}: PartnerFormFieldsProps): React.JSX.Element {
  return (
    <FieldGroup className="gap-8">
      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">Identificação</legend>

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-name`}>
                Nome da instituição
              </FieldLabel>
              <Input
                {...field}
                id={`${idPrefix}-name`}
                {...invalidProps(fieldState.invalid, 'name')}
              />
              <FieldDescription>
                Como a instituição assina, e não a sigla: quem lê a página
                precisa reconhecer o prédio pelo nome que a cidade usa.
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('name')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        {/*
          O campo que faz a seção valer alguma coisa. Uma grade de logos sem
          papel declarado não prova nada - e com dois parceiros, a explicação de
          cada um é o conteúdo inteiro da faixa.
        */}
        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-role`}>
                O que faz pela escola
              </FieldLabel>
              <Input
                {...field}
                id={`${idPrefix}-role`}
                {...invalidProps(fieldState.invalid, 'role')}
              />
              <FieldDescription>
                Uma linha, no concreto: "cede as salas onde as aulas acontecem"
                diz mais que "instituição parceira".
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('role')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="url"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-url`}>Site</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                // String vazia vira `null`: o campo é opcional, e mandar `''`
                // seria reprovado pela regra de link do validator.
                onChange={(event) =>
                  field.onChange(event.target.value || null)
                }
                id={`${idPrefix}-url`}
                inputMode="url"
                placeholder="https://"
                {...invalidProps(fieldState.invalid, 'url')}
              />
              <FieldDescription>
                Opcional. Card sem link é melhor que link morto.
              </FieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('url')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        {/*
          A logomarca sobe na hora da escolha e o formulário guarda só o
          `logoId` - o mesmo contrato de `POST /storages` que a capa do curso
          usa, e por isso o campo é o `image-field/` do kit.
        */}
        <Controller
          control={form.control}
          name="logoId"
          render={({ field, fieldState }) => (
            <ImageField
              id={`${idPrefix}-logoId`}
              {...invalidProps(fieldState.invalid, 'logoId')}
              value={field.value ?? null}
              onValueChange={field.onChange}
              previewUrl={previewUrl}
            >
              <FieldLabel htmlFor={`${idPrefix}-logoId`}>Logomarca</FieldLabel>
              <ImageFieldContent>
                {/* `alt` vazio: o nome da instituição está no campo acima, e
                    anunciar "logo de X" repetiria o que o leitor de tela
                    acabou de ler. */}
                <ImageFieldPreview alt="">Logo</ImageFieldPreview>
                <ImageFieldActions>
                  <ImageFieldUpload>Enviar logomarca</ImageFieldUpload>
                  <ImageFieldRemove />
                </ImageFieldActions>
              </ImageFieldContent>
              <ImageFieldDescription>
                Aparece na faixa de parceiros da home. JPEG, PNG ou WebP.
              </ImageFieldDescription>
              {fieldState.error && (
                <FieldError id={errorId('logoId')}>
                  {fieldState.error.message}
                </FieldError>
              )}
            </ImageField>
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
                A ordem na faixa da home. Menor aparece primeiro.
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
                Só parceiro no ar aparece na vitrine. Fora do ar ele continua
                aqui, para quando o convênio voltar.
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

/**
 * Os campos que o backend pode acusar num 422 ou num 409.
 *
 * Escrito uma vez e usado nos dois formulários: uma lista por tela divergiria, e
 * o campo de fora vira erro que aparece no rodapé em vez de no input.
 */
export const PARTNER_FIELDS = [
  'name',
  'role',
  'url',
  'logoId',
  'position',
  'status',
] as const

/** O formulário vazio. */
export const PARTNER_FORM_DEFAULTS: PartnerFormType = {
  name: '',
  role: '',
  url: null,
  logoId: null,
  position: 0,
  status: 'ACTIVE',
}

/** O registro carregado, na forma que o formulário segura. */
export function partnerToValues(partner: PartnerResponse): PartnerFormType {
  return {
    name: partner.name,
    role: partner.role,
    url: partner.url,
    logoId: partner.logoId,
    position: partner.position,
    status: partner.status,
  }
}
