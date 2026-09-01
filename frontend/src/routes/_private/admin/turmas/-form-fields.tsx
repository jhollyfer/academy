import type * as React from 'react'
import { Controller } from 'react-hook-form'
import { Input } from '#/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { SHIFTS, WEEKDAYS } from '#/lib/entity'
import type { UseFormReturn } from 'react-hook-form'
import type { ClassFormValues } from './-form-config'
import type { CourseResponse } from '#/integrations/response'

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
}

export function ClassFormFields({
  form,
  courses,
}: {
  form: UseFormReturn<ClassFormValues>
  courses: Array<CourseResponse>
}): React.JSX.Element {
  return (
    <FieldGroup className="gap-6">
      <Controller
        control={form.control}
        name="courseId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="courseId">Curso</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="courseId" aria-invalid={fieldState.invalid}>
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
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Nome da turma</FieldLabel>
            <Input {...field} id="name" placeholder="Turma 1 / 2026" />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="startsAt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="startsAt">Primeira aula</FieldLabel>
              <Input {...field} id="startsAt" type="date" aria-invalid={fieldState.invalid} />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endsAt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="endsAt">Última aula</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value || null)}
                id="endsAt"
                type="date"
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="weekday"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="weekday">Dia da semana</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="weekday">
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
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="shift"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="shift">Turno</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="shift">
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
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
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
              <FieldLabel htmlFor="startsAtTime">Começa às</FieldLabel>
              <Input {...field} id="startsAtTime" type="time" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endsAtTime"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="endsAtTime">Termina às</FieldLabel>
              <Input {...field} id="endsAtTime" type="time" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="location"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="location">Onde acontece</FieldLabel>
            <Input {...field} id="location" />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="capacity"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="capacity">Vagas</FieldLabel>
            <Input
              id="capacity"
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
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
    </FieldGroup>
  )
}
