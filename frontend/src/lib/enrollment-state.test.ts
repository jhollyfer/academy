import { describe, expect, it } from 'vitest'
import {
  courseTimesLabel,
  enrollmentStateFrom,
  formatTimeRange,
  scheduleSummary,
} from './enrollment-state'
import type { ClassResponse, CourseResponse } from '#/integrations/response'

function course(
  nextClass: Partial<ClassResponse> | null | undefined,
): CourseResponse {
  let next: ClassResponse | null | undefined = undefined

  if (nextClass !== undefined) {
    next = nextClass as ClassResponse | null
  }

  return { nextClass: next } as CourseResponse
}

describe('enrollmentStateFrom', () => {
  it('sem curso nenhum não há turma para anunciar', () => {
    expect(enrollmentStateFrom([])).toEqual({ kind: 'NONE' })
  })

  it('lista ausente é o mesmo que lista vazia: a consulta ainda não voltou', () => {
    expect(enrollmentStateFrom(undefined)).toEqual({ kind: 'NONE' })
  })

  it('curso com nextClass nulo não anuncia turma', () => {
    expect(enrollmentStateFrom([course(null)])).toEqual({ kind: 'NONE' })
  })

  /**
   * O defeito que este módulo existe para impedir: a listagem não populava
   * `nextClass`, o campo vinha ausente, e a tela concluía que não havia turma.
   * Ausente e nulo levam ao mesmo botão de propósito.
   */
  it('curso sem o campo nextClass também não anuncia turma', () => {
    expect(enrollmentStateFrom([course(undefined)])).toEqual({ kind: 'NONE' })
  })

  it('turma aberta abre a matrícula', () => {
    const state = enrollmentStateFrom([
      course({ status: 'OPEN', startsAt: '2026-03-07' }),
    ])

    expect(state).toEqual({ kind: 'OPEN', startsAt: '2026-03-07' })
  })

  it('todas lotadas manda para a fila de espera, sem fechar a inscrição', () => {
    const state = enrollmentStateFrom([
      course({ status: 'FULL', startsAt: '2026-03-07' }),
      course({ status: 'FULL', startsAt: '2026-08-01' }),
    ])

    expect(state).toEqual({ kind: 'WAITLIST', startsAt: '2026-03-07' })
  })

  it('uma aberta entre lotadas ganha: o botão global não manda todo mundo para a fila', () => {
    const state = enrollmentStateFrom([
      course({ status: 'FULL', startsAt: '2026-03-07' }),
      course({ status: 'OPEN', startsAt: '2026-08-01' }),
    ])

    // A data é a da turma ABERTA, e não a menor de todas. Anunciar março a
    // partir de uma turma lotada seria anunciar uma data que ninguém alcança.
    expect(state).toEqual({ kind: 'OPEN', startsAt: '2026-08-01' })
  })

  it('entre duas abertas, a data é a mais próxima', () => {
    const state = enrollmentStateFrom([
      course({ status: 'OPEN', startsAt: '2026-08-01' }),
      course({ status: 'OPEN', startsAt: '2026-03-07' }),
    ])

    expect(state).toEqual({ kind: 'OPEN', startsAt: '2026-03-07' })
  })
})

/**
 * Um curso com várias turmas anunciadas, como o servidor manda desde que a
 * escola abriu cinco.
 */
function courseWith(
  classes: ReadonlyArray<Partial<ClassResponse>>,
): CourseResponse {
  return {
    announcedClasses: classes as Array<ClassResponse>,
  } as CourseResponse
}

describe('enrollmentStateFrom com várias turmas por curso', () => {
  it('lê todas as turmas do curso, e não só a primeira', () => {
    const state = enrollmentStateFrom([
      courseWith([
        { status: 'FULL', startsAt: '2026-03-07' },
        { status: 'OPEN', startsAt: '2026-03-07' },
      ]),
    ])

    // A segunda turma abre a matrícula. Enquanto o módulo lia só `nextClass`,
    // uma primeira turma lotada mandava todo mundo para a fila de espera com
    // vaga sobrando na turma do lado.
    expect(state).toEqual({ kind: 'OPEN', startsAt: '2026-03-07' })
  })

  it('resposta antiga, só com nextClass, continua valendo', () => {
    const state = enrollmentStateFrom([
      course({ status: 'OPEN', startsAt: '2026-03-07' }),
    ])

    expect(state).toEqual({ kind: 'OPEN', startsAt: '2026-03-07' })
  })
})

describe('formatTimeRange', () => {
  it('a hora do Postgres vira a hora da página', () => {
    expect(formatTimeRange('08:00:00', '10:00:00')).toBe('08h–10h')
  })

  it('minuto quebrado aparece: turma das 8h30 não é turma das 8h', () => {
    expect(formatTimeRange('08:30:00', '10:30:00')).toBe('08h30–10h30')
  })

  it('sem horário fechado não inventa travessão', () => {
    expect(formatTimeRange(null, null)).toBe('')
  })

  it('só com a hora de início mostra a hora de início', () => {
    expect(formatTimeRange('18:00', null)).toBe('18h')
  })
})

describe('scheduleSummary', () => {
  const OFFER = [
    courseWith([
      { capacity: 40, shift: 'MORNING', startsAtTime: '08:00', endsAtTime: '10:00' },
      { capacity: 40, shift: 'MORNING', startsAtTime: '10:00', endsAtTime: '12:00' },
    ]),
    courseWith([
      { capacity: 40, shift: 'AFTERNOON', startsAtTime: '13:00', endsAtTime: '15:00' },
      { capacity: 40, shift: 'AFTERNOON', startsAtTime: '15:00', endsAtTime: '17:00' },
      { capacity: 40, shift: 'NIGHT', startsAtTime: '18:00', endsAtTime: '20:00' },
    ]),
  ]

  it('a oferta real: cinco turmas de 40, nos três turnos', () => {
    const summary = scheduleSummary(OFFER)

    expect(summary.classCount).toBe(5)
    expect(summary.seatsPerClass).toBe(40)
    expect(summary.totalSeats).toBe(200)
    expect(summary.shiftsLabel).toBe('manhã, tarde e noite')
    expect(summary.timesLabel).toBe('08h às 20h')
  })

  it('capacidades diferentes não têm "vagas por turma" - só total', () => {
    const summary = scheduleSummary([
      courseWith([{ capacity: 40 }, { capacity: 25 }]),
    ])

    expect(summary.seatsPerClass).toBeNull()
    expect(summary.totalSeats).toBe(65)
  })

  it('sem turma anunciada não sobra número nenhum para a página escrever', () => {
    const summary = scheduleSummary([])

    expect(summary).toEqual({
      classCount: 0,
      seatsPerClass: null,
      totalSeats: 0,
      shiftsLabel: '',
      timesLabel: '',
    })
  })

  it('turma sem horário fechado não vira intervalo', () => {
    const summary = scheduleSummary([
      courseWith([{ capacity: 40, shift: 'MORNING', startsAtTime: null }]),
    ])

    expect(summary.timesLabel).toBe('')
    expect(summary.shiftsLabel).toBe('manhã')
  })
})

describe('courseTimesLabel', () => {
  it('lista os horários das turmas do curso', () => {
    const label = courseTimesLabel(
      courseWith([
        { startsAtTime: '08:00', endsAtTime: '10:00' },
        { startsAtTime: '10:00', endsAtTime: '12:00' },
      ]),
    )

    expect(label).toBe('08h–10h e 10h–12h')
  })

  it('turma sem horário entra pelo nome, que é o que a secretaria escreveu', () => {
    const label = courseTimesLabel(
      courseWith([{ name: 'Turma 1 / 2026', startsAtTime: null }]),
    )

    expect(label).toBe('Turma 1 / 2026')
  })
})
