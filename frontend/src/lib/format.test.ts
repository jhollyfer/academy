import { describe, expect, it } from 'vitest'

import { formatCep, formatCnpj, formatCpf, formatPhone } from './format'

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

describe('formatCnpj', () => {
  it('reexibe os catorze dígitos com a pontuação', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('aceita o CNPJ alfanumérico, que também tem catorze', () => {
    expect(formatCnpj('12ABC34501DE35')).toBe('12.ABC.345/01DE-35')
  })
})

describe('formatCep', () => {
  it('reexibe os oito dígitos com o hífen', () => {
    expect(formatCep('69000000')).toBe('69000-000')
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
