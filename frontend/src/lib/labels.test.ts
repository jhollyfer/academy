import { describe, expect, it } from 'vitest'

import { initials } from './labels'

describe('initials', () => {
  it('devolve vazio sem nome', () => {
    expect(initials(undefined)).toBe('')
    expect(initials(null)).toBe('')
    expect(initials('   ')).toBe('')
  })

  it('nome de uma palavra devolve uma letra', () => {
    expect(initials('Administrator')).toBe('A')
  })

  it('pega a primeira e a última, e não as duas primeiras', () => {
    expect(initials('Maria Aparecida Souza')).toBe('MS')
  })

  it('ignora espaço sobrando', () => {
    expect(initials('  jhollyfer   rodrigues  ')).toBe('JR')
  })
})
