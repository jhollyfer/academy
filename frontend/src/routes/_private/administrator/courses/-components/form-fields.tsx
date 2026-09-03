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
import { ACTIVE_STATUS_LABELS, COURSE_ACCENT_LABELS } from '#/lib/labels'
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
import type { AdministratorCourseCreatePayload } from '#/lib/validator'
import type { CourseResponse } from '#/integrations/response'

/**
 * A forma que o formulário segura: a de **criação**.
 *
 * A edição usa a mesma, e não a de atualização: aquela é toda `.optional()`, e
 * o `vineResolver` deixaria passar um campo obrigatório apagado - a API leria o
 * campo ausente como "não mexer" e o valor antigo ficaria.
 */
export type CourseFormType = AdministratorCourseCreatePayload

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
type CourseFormFieldsProps = {
  form: UseFormReturn<CourseFormType>
  /**
   * O prefixo dos `id` dos campos.
   *
   * Existe porque `htmlFor` casa por `id` no documento inteiro: sem ele, criar e
   * editar na mesma página - ou o formulário dentro de um dialog sobre a
   * listagem - dariam dois `id="name"`, e o clique no rótulo focaria o campo
   * errado.
   */
  idPrefix: string
  /** A capa já salva, para o preview nascer preenchido na edição. */
  previewUrl?: string | null
}

export function CourseFormFields({
  form,
  idPrefix,
  previewUrl,
}: CourseFormFieldsProps): React.JSX.Element {
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
              <FieldLabel htmlFor={`${idPrefix}-name`}>
                Nome do curso
              </FieldLabel>
              <Input
                {...field}
                id={`${idPrefix}-name`}
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
          name="slug"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-slug`}>
                Endereço na URL
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id={`${idPrefix}-slug`}
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
              <FieldLabel htmlFor={`${idPrefix}-tagline`}>Chamada</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id={`${idPrefix}-tagline`}
                placeholder="A linha que aparece embaixo do nome no card"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        {/*
          A capa do curso. O arquivo sobe na hora da escolha e o formulário
          guarda só o `coverId` - é o mesmo contrato de `POST /storages` que o
          comprovante da matrícula usa, e por isso o campo é o `image-field/` do
          kit e não um input de arquivo desta tela.
        */}
        <Controller
          control={form.control}
          name="coverId"
          render={({ field, fieldState }) => (
            <ImageField
              id={`${idPrefix}-coverId`}
              value={field.value ?? null}
              onValueChange={field.onChange}
              previewUrl={previewUrl}
            >
              <FieldLabel htmlFor={`${idPrefix}-coverId`}>Capa</FieldLabel>
              <ImageFieldContent>
                {/* O `alt` é vazio porque o nome do curso está no campo logo
                    acima: anunciar "capa de X" repetiria o que o leitor de tela
                    acabou de ler. Os children são a sigla de quando não há
                    imagem. */}
                <ImageFieldPreview alt="">Capa</ImageFieldPreview>
                <ImageFieldActions>
                  <ImageFieldUpload>Enviar capa</ImageFieldUpload>
                  <ImageFieldRemove />
                </ImageFieldActions>
              </ImageFieldContent>
              <ImageFieldDescription>
                É a imagem que abre o card do curso na vitrine. JPEG, PNG ou
                WebP.
              </ImageFieldDescription>
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </ImageField>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-description`}>
                Descrição
              </FieldLabel>
              <Textarea
                {...field}
                id={`${idPrefix}-description`}
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
                <FieldLabel htmlFor={`${idPrefix}-accent`}>
                  Tema do curso
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`${idPrefix}-accent`}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_ACCENTS.map((accent) => (
                      <SelectItem key={accent} value={accent}>
                        {COURSE_ACCENT_LABELS[accent] ?? accent}
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
                <FieldLabel htmlFor={`${idPrefix}-status`}>Situação</FieldLabel>
                <Select
                  value={field.value ?? 'ACTIVE'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={`${idPrefix}-status`}>
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
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="text-heading-sm">Formato e investimento</legend>

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
              <FieldLabel htmlFor={`${idPrefix}-requirements`}>
                Requisitos
              </FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                id={`${idPrefix}-requirements`}
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
              <FieldLabel htmlFor={`${idPrefix}-projectOutcome`}>
                O que o aluno vai construir
              </FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                id={`${idPrefix}-projectOutcome`}
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
  form: UseFormReturn<CourseFormType>
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

/**
 * Os campos que o backend pode acusar num 422 ou num 409.
 *
 * Escrito uma vez e usado nos dois formulários: uma lista por tela divergiria, e
 * o campo de fora vira erro que aparece no rodapé em vez de no input.
 */
export const COURSE_FIELDS = [
  'name',
  'slug',
  'tagline',
  'description',
  'accent',
  'workloadHours',
  'durationMonths',
  'minimumAge',
  'requirements',
  'projectOutcome',
  'enrollmentFeeInCents',
  'monthlyFeeInCents',
  'coverId',
  'position',
  'status',
] as const

/** O formulário vazio. */
export const COURSE_FORM_DEFAULTS: CourseFormType = {
  name: '',
  slug: undefined,
  tagline: null,
  description: '',
  accent: 'ROBOTICS',
  workloadHours: 32,
  durationMonths: 4,
  minimumAge: null,
  requirements: null,
  projectOutcome: null,
  enrollmentFeeInCents: 5000,
  monthlyFeeInCents: 15000,
  coverId: null,
  position: 0,
  status: 'ACTIVE',
  modules: [],
  faqs: [],
}

/**
 * O registro carregado, na forma que o formulário segura.
 *
 * A conversão existe porque a resposta traz mais do que o formulário edita -
 * `id`, `createdAt`, a contagem de turmas - e porque a grade e o FAQ chegam com
 * `id` e `position`, que o payload de escrita não aceita: a ordem é o índice do
 * array, e mandar `position` de volta seria o cliente decidindo o que o servidor
 * já decide.
 */
export function courseToValues(course: CourseResponse): CourseFormType {
  return {
    name: course.name,
    slug: course.slug,
    tagline: course.tagline,
    description: course.description,
    accent: course.accent,
    workloadHours: course.workloadHours,
    durationMonths: course.durationMonths,
    minimumAge: course.minimumAge,
    requirements: course.requirements,
    projectOutcome: course.projectOutcome,
    enrollmentFeeInCents: course.enrollmentFeeInCents,
    monthlyFeeInCents: course.monthlyFeeInCents,
    coverId: course.coverId,
    position: course.position,
    status: course.status,
    modules: (course.modules ?? []).map((entry) => ({
      title: entry.title,
      description: entry.description,
    })),
    faqs: (course.faqs ?? []).map((entry) => ({
      question: entry.question,
      answer: entry.answer,
    })),
  }
}
