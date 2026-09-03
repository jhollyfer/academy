import { describe, expect, it } from 'vitest'

import { formatBytes, initials } from './labels'

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

describe('formatBytes', () => {
  it('mantém bytes abaixo de 1024', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('sobe para KB com uma casa decimal', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('para de subir em MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
    expect(formatBytes(1024 * 1024 * 2048)).toBe('2048.0 MB')
  })
})
