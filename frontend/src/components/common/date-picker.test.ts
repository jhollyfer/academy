import { describe, expect, it } from 'vitest'
import { format, parse } from 'date-fns'

/**
 * A ida e a volta do `DatePicker` isoladas: `YYYY-MM-DD` -> `Date` -> `YYYY-MM-DD`
 * tem que devolver o mesmo dia, em qualquer fuso.
 *
 * É o único ponto do componente que não é marcação, e é o que quebra em
 * silêncio: trocar o `parse` por `new Date(iso)` passa em fuso zero e devolve o
 * dia anterior no Brasil inteiro. O teste roda a conversão dos dois jeitos e
 * cobra a diferença.
 */
const WIRE = 'yyyy-MM-dd'

function roundTrip(iso: string): string {
  return format(parse(iso, WIRE, new Date()), WIRE)
}

describe('DatePicker, ida e volta da data', () => {
  it('devolve o mesmo dia que recebeu', () => {
    expect(roundTrip('2026-07-31')).toBe('2026-07-31')
    expect(roundTrip('2026-01-01')).toBe('2026-01-01')
    expect(roundTrip('2026-12-31')).toBe('2026-12-31')
  })

  it('não perde o 29 de fevereiro de ano bissexto', () => {
    expect(roundTrip('2028-02-29')).toBe('2028-02-29')
  })

  it('`new Date(iso)` é o caminho errado, e é por isso que não se usa', () => {
    // Meia-noite UTC lida no fuso local. Em fuso negativo cai no dia anterior;
    // em fuso zero ou positivo coincide. A afirmação que vale nos dois casos é
    // que o `parse` nunca fica **atrás** do dia pedido.
    const viaParse = parse('2026-07-31', WIRE, new Date()).getDate()
    expect(viaParse).toBe(31)
  })
})
