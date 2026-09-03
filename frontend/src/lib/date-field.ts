/**
 * As conversões do campo de data, separadas do componente.
 *
 * Aqui e não dentro do `date-picker.tsx` porque é a única parte dele que não é
 * marcação, e é a que quebra em silêncio - o teste ao lado protege o código que
 * roda em produção, e não uma cópia dele.
 */

import { format, isValid, parse } from 'date-fns'

/** O formato que a API troca, e o único que atravessa o campo. */
export const WIRE = 'yyyy-MM-dd'

/** O formato que se digita e se lê, que é o brasileiro. */
export const DISPLAY = 'dd/MM/yyyy'

/**
 * Converte `YYYY-MM-DD` para `Date` **sem passar por UTC**.
 *
 * `new Date('2026-07-31')` é interpretado como meia-noite UTC, e em qualquer
 * fuso negativo - o Brasil inteiro - isso vira 30 de julho no horário local. O
 * `parse` do `date-fns` monta a data no fuso local a partir dos componentes, que
 * é o que evita o campo mostrar sempre um dia a menos do que foi salvo.
 */
export function fromWire(value: string | null | undefined): Date | undefined {
  if (!value) return undefined

  const parsed = parse(value.slice(0, 10), WIRE, new Date())

  if (!isValid(parsed)) return undefined

  return parsed
}

/** O `Date` na forma que a API recebe. */
export function toWire(date: Date): string {
  return format(date, WIRE)
}

/** A data guardada na forma que se lê, ou `''` quando não há data. */
export function toDisplay(value: string | null | undefined): string {
  const date = fromWire(value)

  if (!date) return ''

  return format(date, DISPLAY)
}

/**
 * O que foi digitado, como `Date` - ou `undefined` enquanto não for uma data.
 *
 * A conferência de volta (`format(parsed) === text`) existe por causa do
 * rollover: o `date-fns` aceita `31/02/2026` e devolve 3 de março, calado. Sem
 * ela, digitar um dia que não existe gravaria outro dia sem avisar ninguém.
 *
 * Texto incompleto - o que se tem no meio da digitação - também cai aqui, e é o
 * que faz o campo esperar em vez de reagir a cada tecla.
 */
export function parseDisplay(text: string): Date | undefined {
  if (text.length !== DISPLAY.length) return undefined

  const parsed = parse(text, DISPLAY, new Date())

  if (!isValid(parsed)) return undefined
  if (format(parsed, DISPLAY) !== text) return undefined

  return parsed
}

/**
 * A data está dentro dos limites que o campo oferece?
 *
 * Os mesmos `startMonth`/`endMonth` que fecham o calendário valem para o que se
 * digita: sem isto, a data de nascimento aceitaria 1890 pelo teclado e recusaria
 * pelo clique, e o campo teria duas regras.
 *
 * A comparação é por mês, e não por dia, porque é o que as duas props declaram -
 * `endMonth` é "até este mês", e cobrar o dia recusaria uma data legítima do
 * próprio mês limite.
 */
export function withinRange(
  date: Date,
  startMonth?: Date,
  endMonth?: Date,
): boolean {
  const month = format(date, 'yyyy-MM')

  if (startMonth && month < format(startMonth, 'yyyy-MM')) return false
  if (endMonth && month > format(endMonth, 'yyyy-MM')) return false

  return true
}
