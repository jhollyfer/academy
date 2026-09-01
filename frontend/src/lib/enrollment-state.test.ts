import { describe, expect, it } from 'vitest'
import { enrollmentStateFrom } from './enrollment-state'
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
