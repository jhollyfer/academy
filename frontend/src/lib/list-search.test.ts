import { describe, expect, it } from 'vitest'

import { validateListSearch} from './list-search'
import { TrashedModes } from './validator'

/**
 * O recorte de lixeira. Vale um teste próprio porque os valores aceitos são
 * **literais** em `list-search.ts`, e não `TrashedModes.X`: ler o enum ali cria
 * uma aresta entre o chunk do router e o chunk do validator, e num grafo de
 * chunks cíclico ela devolve `undefined` no SSR. A duplicação é intencional, e
 * é aqui que ela é confrontada com a fonte.
 */
describe('validateListSearch, recorte de lixeira', () => {
  it('aceita os dois modos que o enum declara', () => {
    expect(validateListSearch({ trashed: TrashedModes.ONLY })).toEqual({
      trashed: 'only',
    })
    expect(validateListSearch({ trashed: TrashedModes.WITH })).toEqual({
      trashed: 'with',
    })
  })

  it('descarta modo inventado e ausência', () => {
    expect(validateListSearch({ trashed: 'lixo' })).toEqual({})
    expect(validateListSearch({})).toEqual({})
  })
})

/**
 * O parser dos filtros da vitrine.
 *
 * O que está sob teste é o que a URL pode trazer de errado: um `?maxPrice=abc`
 * digitado à mão não pode virar a string `'abc'` numa requisição que o backend
 * recusa com 422, e a ausência de um parâmetro não pode virar filtro.
 */
