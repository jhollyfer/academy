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
    endsAt: dateOnly(entity.endsAt),
    weekday: entity.weekday,
    shift: entity.shift,
    location: entity.location,
    capacity: entity.capacity,
    // `FULL` é derivado e o formulário não o oferece. Turma lotada em edição
    // mostra `OPEN`, e salvar não a reabre: o servidor recalcula.
    status: editableStatus(entity.status),
  }
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
