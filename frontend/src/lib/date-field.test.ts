import { describe, expect, it } from 'vitest'
import { parse } from 'date-fns'

import {
  WIRE,
  fromWire,
  parseDisplay,
  toDisplay,
  toWire,
  withinRange,
} from './date-field'

describe('ida e volta da data', () => {
  it('devolve o mesmo dia que recebeu', () => {
    // `YYYY-MM-DD` -> `Date` -> `YYYY-MM-DD` tem que dar o mesmo dia, em
    // qualquer fuso. É o ponto que quebra em silêncio: trocar o `parse` por
    // `new Date(iso)` passa em fuso zero e devolve o dia anterior no Brasil.
    for (const iso of ['2026-07-31', '2026-01-01', '2026-12-31']) {
      expect(toWire(fromWire(iso)!)).toBe(iso)
    }
  })

  it('não perde o 29 de fevereiro de ano bissexto', () => {
    expect(toWire(fromWire('2028-02-29')!)).toBe('2028-02-29')
  })

  it('`new Date(iso)` é o caminho errado, e é por isso que não se usa', () => {
    // Meia-noite UTC lida no fuso local. Em fuso negativo cai no dia anterior;
    // em fuso zero ou positivo coincide. A afirmação que vale nos dois casos é
    // que o `parse` nunca fica **atrás** do dia pedido.
    expect(parse('2026-07-31', WIRE, new Date()).getDate()).toBe(31)
  })

  it('vazio, nulo e lixo não viram data', () => {
    expect(fromWire('')).toBeUndefined()
    expect(fromWire(null)).toBeUndefined()
    expect(fromWire('ontem')).toBeUndefined()
  })

  it('a hora que a API às vezes anexa é ignorada', () => {
    expect(toWire(fromWire('2026-07-31T00:00:00.000Z')!)).toBe('2026-07-31')
  })
})

describe('toDisplay', () => {
  it('mostra a data na forma brasileira', () => {
    expect(toDisplay('2026-07-31')).toBe('31/07/2026')
  })

  it('sem data, o campo fica vazio', () => {
    expect(toDisplay(null)).toBe('')
    expect(toDisplay('')).toBe('')
  })
})

describe('parseDisplay', () => {
  it('lê o que foi digitado por inteiro', () => {
    expect(toWire(parseDisplay('31/07/2026')!)).toBe('2026-07-31')
    expect(toWire(parseDisplay('07/03/1998')!)).toBe('1998-03-07')
  })

  it('recusa dia que não existe no mês', () => {
    // O `date-fns` aceita `31/02` e devolve 3 de março, calado. Sem a
    // conferência de volta, o campo gravaria um dia que ninguém digitou.
    expect(parseDisplay('31/02/2026')).toBeUndefined()
    expect(parseDisplay('29/02/2026')).toBeUndefined()
  })

  it('aceita 29 de fevereiro quando o ano é bissexto', () => {
    expect(toWire(parseDisplay('29/02/2028')!)).toBe('2028-02-29')
  })

  it('espera enquanto a digitação não terminou', () => {
    // É o que impede o campo de piscar de preenchido para vazio a cada tecla.
    expect(parseDisplay('')).toBeUndefined()
    expect(parseDisplay('07')).toBeUndefined()
    expect(parseDisplay('07/03/')).toBeUndefined()
    expect(parseDisplay('07/03/19')).toBeUndefined()
  })

  it('recusa outros formatos', () => {
    expect(parseDisplay('1998-03-07')).toBeUndefined()
    expect(parseDisplay('03/07/1998x')).toBeUndefined()
  })
})

describe('withinRange', () => {
  const start = new Date(1920, 0, 1)
  const end = new Date(2026, 8, 1)

  it('aceita a data entre os limites', () => {
    expect(withinRange(new Date(1998, 2, 7), start, end)).toBe(true)
  })

  it('recusa antes e depois', () => {
    expect(withinRange(new Date(1919, 11, 31), start, end)).toBe(false)
    expect(withinRange(new Date(2026, 9, 1), start, end)).toBe(false)
  })

  it('o mês do limite entra inteiro', () => {
    // A comparação é por mês porque é o que `startMonth`/`endMonth` declaram;
    // cobrar o dia recusaria uma data legítima do próprio mês limite.
    expect(withinRange(new Date(2026, 8, 30), start, end)).toBe(true)
  })

  it('sem limites, qualquer data serve', () => {
    // É o caso da turma: a primeira aula não tem faixa, e inventar uma aqui
    // seria uma regra que o backend não tem.
    expect(withinRange(new Date(1500, 0, 1))).toBe(true)
  })
})
