import { describe, expect, it } from 'vitest'

import {
  formatCents,
  formatCpf,
  formatPhone,
  parseCents,
  pluralize,
} from './format'

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

describe('pluralize', () => {
  it('uma turma no singular', () => {
    expect(pluralize(1, 'turma', 'turmas')).toBe('1 turma')
  })

  it('o resto no plural, inclusive zero', () => {
    expect(pluralize(0, 'turma', 'turmas')).toBe('0 turmas')
    expect(pluralize(5, 'turma', 'turmas')).toBe('5 turmas')
  })
})

describe('formatCents', () => {
  it('mostra os centavos com duas casas e sem o símbolo', () => {
    expect(formatCents(15000)).toBe('150,00')
    expect(formatCents(150)).toBe('1,50')
    expect(formatCents(0)).toBe('0,00')
  })

  it('separa o milhar', () => {
    expect(formatCents(100000000)).toBe('1.000.000,00')
  })
})

describe('parseCents', () => {
  it('conta os dígitos como centavos, na ordem em que se digita', () => {
    // O modelo de acumulador: cada tecla empurra o valor uma casa para a
    // esquerda, como num caixa eletrônico.
    expect(parseCents('1')).toBe(1)
    expect(parseCents('1,5')).toBe(15)
    expect(parseCents('15,0')).toBe(150)
    expect(parseCents('150,00')).toBe(15000)
  })

  it('aceita valor colado com símbolo e separador', () => {
    expect(parseCents('R$ 1.500,00')).toBe(150000)
  })

  it('campo vazio ou sem dígito é zero', () => {
    expect(parseCents('')).toBe(0)
    expect(parseCents('abc')).toBe(0)
    expect(parseCents('R$ ')).toBe(0)
  })

  it('não passa do teto do validator', () => {
    // Segurar uma tecla estouraria o `max` do `money()`, e o erro só apareceria
    // no envio.
    expect(parseCents('9999999999999')).toBe(100000000)
  })

  it('o que sai do campo volta igual', () => {
    for (const cents of [0, 1, 150, 15000, 99999999]) {
      expect(parseCents(formatCents(cents))).toBe(cents)
    }
  })
})
