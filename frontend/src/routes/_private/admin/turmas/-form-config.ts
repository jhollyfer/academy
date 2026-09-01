import type { AdministratorClassCreatePayload } from '#/lib/validator'
import type { ClassResponse } from '#/integrations/response'

export const CLASS_FIELDS = [
  'courseId',
  'name',
  'startsAt',
  'endsAt',
  'weekday',
  'shift',
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
export type ClassFormValues = Omit<AdministratorClassCreatePayload, 'startsAt' | 'endsAt'> & {
  startsAt: string
  endsAt: string | null
}

export function classDefaults(): ClassFormValues {
  return {
    courseId: '',
    name: '',
    startsAt: '',
    endsAt: null,
    weekday: 'SATURDAY',
    shift: 'MORNING',
    location: 'FAMETRO, Benjamin Constant/AM',
    capacity: 40,
    status: 'OPEN',
  }
}

export function classToValues(entity: ClassResponse): ClassFormValues {
  return {
    courseId: entity.courseId,
    name: entity.name,
    // A API devolve ISO com hora; o input quer só a data. Fatiar como texto e
    // não converter, pelo motivo do `formatDate`: `new Date()` num fuso a oeste
    // retrocede um dia.
    startsAt: entity.startsAt.slice(0, 10),
    endsAt: entity.endsAt ? entity.endsAt.slice(0, 10) : null,
    weekday: entity.weekday,
    shift: entity.shift,
    location: entity.location,
    capacity: entity.capacity,
    // `FULL` é derivado e o formulário não o oferece. Turma lotada em edição
    // mostra `OPEN`, e salvar não a reabre: o servidor recalcula.
    status: entity.status === 'FULL' ? 'OPEN' : entity.status,
  }
}
