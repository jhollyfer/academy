import type * as React from 'react'
import { Controller } from 'react-hook-form'
import { Input } from '#/components/ui/input'
import { DatePicker } from '#/components/common/date-picker'
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
import { SHIFTS, WEEKDAYS } from '#/lib/entity'
import { SHIFT_LABELS, WEEKDAY_LABELS } from '#/lib/labels'
import type { UseFormReturn } from 'react-hook-form'
import type { CourseResponse, ClassResponse } from '#/integrations/response'
import type { AdministratorClassCreatePayload } from '#/lib/validator'

type ClassFormFieldsProps = {
  form: UseFormReturn<ClassFormValues>
  courses: Array<CourseResponse>
  /**
   * O prefixo dos `id` dos campos.
   *
   * Existe porque `htmlFor` casa por `id` no documento inteiro: sem ele, criar e
   * editar na mesma página dariam dois `id="name"`, e o clique no rótulo
   * focaria o campo errado.
   */
  idPrefix: string
}

export function ClassFormFields({
  form,
  courses,
  idPrefix,
}: ClassFormFieldsProps): React.JSX.Element {
  return (
    <FieldGroup className="gap-6">
      <Controller
        control={form.control}
        name="courseId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-courseId`}>Curso</FieldLabel>
            {/*
              Aqui os rótulos não vêm de um mapa de enum: são os cursos que a
              API devolveu. Sem `items` o gatilho mostrava o uuid do curso
              escolhido, que não diz nada a ninguém.
            */}
            <Select
              items={courses.map((course) => ({
                value: course.id,
                label: course.name,
              }))}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id={`${idPrefix}-courseId`}
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Escolha o curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
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
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-name`}>Nome da turma</FieldLabel>
            <Input
              {...field}
              id={`${idPrefix}-name`}
              placeholder="Turma 1 / 2026"
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
          name="startsAt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-startsAt`}>
                Primeira aula
              </FieldLabel>
              {/*
                O `DatePicker` do kit, e não `<input type="date">`: o nativo
                muda de cara em cada navegador e não tem como ser estilizado,
                e o formato que ele mostra segue a configuração do sistema -
                num painel em pt-BR isso vira mm/dd/aaaa para quem tem o
                sistema em inglês. Os dois falam `YYYY-MM-DD`, que é o que o
                payload carrega.
              */}
              <DatePicker
                id={`${idPrefix}-startsAt`}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
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
          name="endsAt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-endsAt`}>
                Última aula
              </FieldLabel>
              {/* `|| null` no lugar de `''`: a data de término é opcional, e o
                  validator recusa string vazia onde aceita ausência. */}
              <DatePicker
                id={`${idPrefix}-endsAt`}
                value={field.value}
                onValueChange={(value) => field.onChange(value || null)}
                onBlur={field.onBlur}
                placeholder="Em aberto"
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
          name="weekday"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-weekday`}>
                Dia da semana
              </FieldLabel>
              {/*
                `items` é o que faz o GATILHO mostrar "Sábado" e não "SATURDAY".
                O `SelectValue` do Base UI renderiza o valor cru enquanto não
                souber traduzi-lo, e é por este mapa que ele descobre - o mesmo
                que rotula a lista abaixo, a coluna da listagem e o badge da
                ficha. Sem ele, a lista aberta ficava em português e o campo
                fechado voltava para o inglês do enum.
              */}
              <Select
                items={WEEKDAY_LABELS}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={`${idPrefix}-weekday`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {WEEKDAY_LABELS[day] ?? day}
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
          name="shift"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-shift`}>Turno</FieldLabel>
              <Select
                items={SHIFT_LABELS}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={`${idPrefix}-shift`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFTS.map((shift) => (
                    <SelectItem key={shift} value={shift}>
                      {SHIFT_LABELS[shift] ?? shift}
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

      {/*
        O horário, que o turno não diz.
        `<input type="time">` nativo: o navegador já dá teclado de hora no
        celular, relógio no desktop e o formato de 24h que o servidor espera.
        Em branco é turma sem horário fechado, e o envio o manda como nulo.
      */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="startsAtTime"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-startsAtTime`}>
                Começa às
              </FieldLabel>
              <Input {...field} id={`${idPrefix}-startsAtTime`} type="time" />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endsAtTime"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-endsAtTime`}>
                Termina às
              </FieldLabel>
              <Input {...field} id={`${idPrefix}-endsAtTime`} type="time" />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="location"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-location`}>
              Onde acontece
            </FieldLabel>
            <Input {...field} id={`${idPrefix}-location`} />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="capacity"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-capacity`}>Vagas</FieldLabel>
            <Input
              id={`${idPrefix}-capacity`}
              type="number"
              inputMode="numeric"
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => {
                const raw = event.target.value

                if (raw === '') {
                  field.onChange(undefined)
                  return
                }

                field.onChange(Number(raw))
              }}
              aria-invalid={fieldState.invalid}
            />
            {/*
              Reduzir abaixo do que já saiu é 409 do servidor, e a mensagem dele
              diz quantas matrículas existem. Repeti-la aqui como aviso prévio
              exigiria a contagem no formulário, que é dado que ele não tem.
            */}
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
    </FieldGroup>
  )
}

export const CLASS_FIELDS = [
  'courseId',
  'name',
  'startsAt',
  'endsAt',
  'weekday',
  'shift',
  'startsAtTime',
  'endsAtTime',
  'location',
  'capacity',
  'status',
] as const

/**
 * O formulário da turma, com `startsAt` e `endsAt` como `string`.
 *
 * O payload validado os entrega como `Date` - o `vine.date()` converte -, mas o
 * `<input type="date">` fala `string`. É o mesmo par do wizard de matrícula, e
 * pela mesma razão.
 */
export type ClassFormValues = Omit<
  AdministratorClassCreatePayload,
  'startsAt' | 'endsAt' | 'startsAtTime' | 'endsAtTime'
> & {
  startsAt: string
  endsAt: string | null
  /**
   * Vazio, e não `null`, enquanto o horário não foi preenchido: um
   * `<input type="time">` controlado com `null` volta a ser não-controlado no
   * meio da digitação. O `''` chega assim à API e o `convertEmptyStringsToNull`
   * do VineJS o trata como ausente, que é o que faz a mensagem ser "informe a
   * hora" em vez de "formato inválido".
   */
  startsAtTime: string
  endsAtTime: string
}

export const CLASS_FORM_DEFAULTS: ClassFormValues = {
  courseId: '',
  name: '',
  startsAt: '',
  endsAt: null,
  weekday: 'SATURDAY',
  shift: 'MORNING',
  startsAtTime: '',
  endsAtTime: '',
  location: 'Benjamin Constant/AM',
  capacity: 40,
  status: 'OPEN',
}

export function classToValues(entity: ClassResponse): ClassFormValues {
  return {
    courseId: entity.courseId,
    name: entity.name,
    // A API devolve ISO com hora; o input quer só a data. Fatiar como texto e
    // não converter, pelo motivo do `formatDate`: `new Date()` num fuso a oeste
    // retrocede um dia.
    startsAt: entity.startsAt.slice(0, 10),
    endsAt: dateOnly(entity.endsAt),
    weekday: entity.weekday,
    shift: entity.shift,
    // A API devolve `"08:00:00"`; o `<input type="time">` mostra `08:00` e
    // devolve o mesmo formato curto, que o validator aceita.
    startsAtTime: timeOnly(entity.startsAtTime),
    endsAtTime: timeOnly(entity.endsAtTime),
    location: entity.location,
    capacity: entity.capacity,
    // `FULL` é derivado e o formulário não o oferece. Turma lotada em edição
    // mostra `OPEN`, e salvar não a reabre: o servidor recalcula.
    status: editableStatus(entity.status),
  }
}

/**
 * A hora sem os segundos, para o `<input type="time">`, que só aceita `HH:MM`.
 * Sem horário vira string vazia, que é o campo em branco.
 */
function timeOnly(value: string | null): string {
  if (!value) return ''

  return value.slice(0, 5)
}

/** A data sem a hora, para o `<input type="date">`. Nula continua nula. */
function dateOnly(iso: string | null): string | null {
  if (!iso) return null

  return iso.slice(0, 10)
}

function editableStatus(status: ClassResponse['status']): 'OPEN' | 'CLOSED' {
  if (status === 'CLOSED') return 'CLOSED'

  return 'OPEN'
}

/**
 * A data opcional do formulário na forma que a API recebe.
 *
 * Vazio é `null` e não `Invalid Date`: `new Date('')` produz uma data inválida
 * que o VineJS recusa com "informe uma data", num campo que a pessoa
 * deliberadamente deixou em branco.
 */
export function optionalDate(value: string | null): Date | null {
  if (!value) return null

  return new Date(value)
}
