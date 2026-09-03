import { describe, expect, it } from 'vitest'

import { filenameFromContentDisposition } from './download'

describe('filenameFromContentDisposition', () => {
  it('lê o nome entre aspas', () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="matriculas-2026-09-03.csv"',
      ),
    ).toBe('matriculas-2026-09-03.csv')
  })

  it('lê o nome sem aspas', () => {
    expect(
      filenameFromContentDisposition('attachment; filename=matriculas.csv'),
    ).toBe('matriculas.csv')
  })

  it('prefere o `filename*`, que é quem carrega acento', () => {
    // As duas formas no mesmo header é o caso comum: a simples existe para
    // cliente antigo, e quem entende as duas tem de ficar com a codificada.
    expect(
      filenameFromContentDisposition(
        'attachment; filename="matriculas.csv"; filename*=UTF-8\'\'matr%C3%ADculas.csv',
      ),
    ).toBe('matrículas.csv')
  })

  it('volta para o nome simples quando o `filename*` está quebrado', () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="matriculas.csv"; filename*=UTF-8\'\'%E0%A4%A',
      ),
    ).toBe('matriculas.csv')
  })

  it('devolve indefinido sem header', () => {
    expect(filenameFromContentDisposition(null)).toBeUndefined()
    expect(filenameFromContentDisposition('')).toBeUndefined()
  })

  it('devolve indefinido quando o header não declara nome', () => {
    // `inline` sem nome é resposta válida, e o fallback é de quem chama.
    expect(filenameFromContentDisposition('attachment')).toBeUndefined()
  })
})
