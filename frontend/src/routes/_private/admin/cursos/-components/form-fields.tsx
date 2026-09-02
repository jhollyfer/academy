import * as React from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { Plus, Trash } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Field,
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
import { ACTIVE_STATUSES, COURSE_ACCENTS } from '#/lib/entity'
import type { UseFormReturn } from 'react-hook-form'
import type { AdministratorCourseCreatePayload } from '#/lib/validator'

/**
 * Os campos do curso, compartilhados entre criar e editar.
 *
 * Um arquivo só porque são os mesmos campos: dois formulários divergem no
 * primeiro campo novo, e a divergência aparece como "no cadastro dá para
 * preencher, na edição não".
 *
 * A grade e o FAQ entram aqui como `useFieldArray` porque a API os recebe como
 * array no mesmo `POST`/`PUT` - não há endpoint separado, de propósito: salvar
 * curso e ementa em dois cliques abriria uma janela em que a página pública
 * mostra metade do que a pessoa escreveu.
 */
const ACCENT_LABELS: Record<string, string> = {
  ROBOTICS: 'Robótica',
  WEB: 'Desenvolvimento web',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'No ar',
  INACTIVE: 'Fora do ar',
}

export function CourseFormFields({
  form,
}: {
  form: UseFormReturn<AdministratorCourseCreatePayload>
}): React.JSX.Element {
  const modules = useFieldArray({ control: form.control, name: 'modules' })
  const faqs = useFieldArray({ control: form.control, name: 'faqs' })

  return (
    <FieldGroup className="gap-8">
      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">Identificação</legend>

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nome do curso</FieldLabel>
              <Input {...field} id="name" aria-invalid={fieldState.invalid} />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="slug"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Endereço na URL</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="slug"
                placeholder="Deixe em branco para sair do nome"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="tagline"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tagline">Chamada</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="tagline"
                placeholder="A linha que aparece embaixo do nome no card"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea
                {...field}
                id="description"
                rows={5}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="accent"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="accent">Tema do curso</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="accent" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_ACCENTS.map((accent) => (
                      <SelectItem key={accent} value={accent}>
                        {ACCENT_LABELS[accent] ?? accent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">Situação</FieldLabel>
                <Select
                  value={field.value ?? 'ACTIVE'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status] ?? status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">
          Formato e investimento
        </legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            form={form}
            name="workloadHours"
            label="Carga horária (horas)"
          />
          <NumberField
            form={form}
            name="durationMonths"
            label="Duração (meses)"
          />
          <NumberField
            form={form}
            name="enrollmentFeeInCents"
            label="Inscrição (centavos)"
            hint="15000 são R$ 150,00"
          />
          <NumberField
            form={form}
            name="monthlyFeeInCents"
            label="Mensalidade (centavos)"
            hint="15000 são R$ 150,00"
          />
          <NumberField
            form={form}
            name="minimumAge"
            label="Idade mínima"
            hint="Em branco, sem restrição"
            nullable
          />
          <NumberField form={form} name="position" label="Ordem na home" />
        </div>

        <Controller
          control={form.control}
          name="requirements"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="requirements">Requisitos</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                id="requirements"
                rows={3}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="projectOutcome"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="projectOutcome">
                O que o aluno vai construir
              </FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                id="projectOutcome"
                rows={3}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-heading-sm">Grade</legend>
        <p className="text-sm text-muted-foreground">
          Um item por encontro, na ordem em que acontecem. A ordem da lista é a
          ordem no site.
        </p>

        {modules.fields.map((entry, index) => (
          <div key={entry.id} className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name={`modules.${index}.title`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel htmlFor={`modules.${index}.title`}>
                      Encontro {index + 1}
                    </FieldLabel>
                    <Input {...field} id={`modules.${index}.title`} />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover encontro ${index + 1}`}
                onClick={() => modules.remove(index)}
                className="mt-6"
              >
                <Trash />
              </Button>
            </div>

            <Controller
              control={form.control}
              name={`modules.${index}.description`}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`modules.${index}.description`}>
                    O que tem nele
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    id={`modules.${index}.description`}
                    rows={2}
                  />
                </Field>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => modules.append({ title: '', description: null })}
        >
          <Plus />
          Adicionar encontro
        </Button>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-heading-sm">Perguntas frequentes</legend>

        {faqs.fields.map((entry, index) => (
          <div key={entry.id} className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name={`faqs.${index}.question`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel htmlFor={`faqs.${index}.question`}>
                      Pergunta
                    </FieldLabel>
                    <Input {...field} id={`faqs.${index}.question`} />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover pergunta ${index + 1}`}
                onClick={() => faqs.remove(index)}
                className="mt-6"
              >
                <Trash />
              </Button>
            </div>

            <Controller
              control={form.control}
              name={`faqs.${index}.answer`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`faqs.${index}.answer`}>
                    Resposta
                  </FieldLabel>
                  <Textarea {...field} id={`faqs.${index}.answer`} rows={2} />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => faqs.append({ question: '', answer: '' })}
        >
          <Plus />
          Adicionar pergunta
        </Button>
      </fieldset>
    </FieldGroup>
  )
}

/**
 * Um campo numérico.
 *
 * `valueAsNumber` no `onChange`, e não no `register`: o `<input type="number">`
 * devolve `string`, e mandar string para um `vine.number()` daria 422 num campo
 * que a pessoa preencheu certo. Campo vazio vira `null` quando a coluna aceita,
 * e `undefined` quando não - `null` num campo obrigatório dá a mensagem certa,
 * `NaN` daria "informe um número" com o número na tela.
 */
function NumberField({
  form,
  name,
  label,
  hint,
  nullable,
}: {
  form: UseFormReturn<AdministratorCourseCreatePayload>
  name:
    | 'workloadHours'
    | 'durationMonths'
    | 'enrollmentFeeInCents'
    | 'monthlyFeeInCents'
    | 'minimumAge'
    | 'position'
  label: string
  hint?: string
  nullable?: boolean
}): React.JSX.Element {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            inputMode="numeric"
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(event) => {
              const raw = event.target.value

              if (raw === '') {
                if (nullable) field.onChange(null)
                if (!nullable) field.onChange(undefined)

                return
              }

              field.onChange(Number(raw))
            }}
            aria-invalid={fieldState.invalid}
          />
          {hint && !fieldState.error && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  )
}
