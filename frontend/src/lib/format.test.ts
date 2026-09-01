import { describe, expect, it } from 'vitest'

import { formatCpf, formatPhone } from './format'

describe('formatCpf', () => {
  it('reexibe os onze dígitos com a pontuação', () => {
    expect(formatCpf('39053344705')).toBe('390.533.447-05')
  })

  it('devolve o valor cru quando o tamanho não bate', () => {
    // Dado antigo ou fora do padrão aparece como está, e não fatiado em algo
    // que se parece com um CPF sem ser.
    expect(formatCpf('123')).toBe('123')
  })

  it('mostra hífen quando não há valor', () => {
    expect(formatCpf(null)).toBe('-')
    expect(formatCpf('')).toBe('-')
  })
})



describe('formatPhone', () => {
  it('distingue fixo de celular pelo tamanho do meio', () => {
    expect(formatPhone('9233334444')).toBe('(92) 3333-4444')
    expect(formatPhone('92999990000')).toBe('(92) 99999-0000')
  })

  it('devolve o valor cru quando não é nem dez nem onze dígitos', () => {
    expect(formatPhone('123456')).toBe('123456')
  })

  it('mostra hífen quando não há valor', () => {
    expect(formatPhone(null)).toBe('-')
  })
})
