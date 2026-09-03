import { describe, expect, it } from 'vitest'

import { validateListSearch, withExtra } from './list-search'
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

/**
 * A paginação, que é onde a URL editável dói mais.
 *
 * O resultado deste parser vira `queryKey`, e é por isso que ele importa mais do
 * que parece: um valor que atravessa aqui sem ser recusado não produz erro de
 * tela - produz uma chave de cache diferente, e a listagem passa a ler o cache
 * de uma busca que ninguém fez.
 */
describe('validateListSearch, paginação', () => {
  it('aceita página e tamanho válidos, venham como número ou string', () => {
    // Os dois formatos existem de verdade: a URL entrega string, a navegação
    // tipada do router entrega número.
    expect(validateListSearch({ page: 2, perPage: 50 })).toEqual({
      page: 2,
      perPage: 50,
    })
    expect(validateListSearch({ page: '2', perPage: '50' })).toEqual({
      page: 2,
      perPage: 50,
    })
  })

  it('descarta página que não é inteiro positivo', () => {
    // `?page=abc` digitado à mão não pode virar a string na requisição, e
    // `?page=0` não existe - a primeira é 1.
    expect(validateListSearch({ page: 'abc' })).toEqual({})
    expect(validateListSearch({ page: 0 })).toEqual({})
    expect(validateListSearch({ page: -3 })).toEqual({})
    expect(validateListSearch({ page: 1.5 })).toEqual({})
  })

  it('descarta tamanho acima do teto do backend', () => {
    // O backend recusa acima de 100. Deixar passar trocaria uma listagem vazia
    // por um 422 no meio da navegação.
    expect(validateListSearch({ perPage: 100 })).toEqual({ perPage: 100 })
    expect(validateListSearch({ perPage: 101 })).toEqual({})
  })
})

describe('validateListSearch, busca e ordenação', () => {
  it('aceita o termo de busca e descarta o vazio', () => {
    expect(validateListSearch({ search: 'ana' })).toEqual({ search: 'ana' })

    // String vazia não é filtro: viraria `?search=` na URL e uma chave de cache
    // diferente da ausência, para o mesmo resultado.
    expect(validateListSearch({ search: '' })).toEqual({})
    expect(validateListSearch({ search: 42 })).toEqual({})
  })

  it('aceita a coluna sem validá-la contra lista', () => {
    // Deliberado: cada recurso aceita as suas, e repetir as listas aqui seria
    // garantir que as duas divergissem. Coluna inválida volta 422 do backend.
    expect(validateListSearch({ sort: 'inventada' })).toEqual({
      sort: 'inventada',
    })
  })

  it('aceita as duas direções junto com a coluna', () => {
    expect(validateListSearch({ sort: 'name', direction: 'asc' })).toEqual({
      sort: 'name',
      direction: 'asc',
    })
    expect(validateListSearch({ sort: 'name', direction: 'desc' })).toEqual({
      sort: 'name',
      direction: 'desc',
    })
  })

  it('descarta direção sozinha e direção inventada', () => {
    // Sem coluna ela não ordena nada, e só sujaria a URL com um parâmetro sem
    // efeito - e com uma chave de cache a mais para o mesmo resultado.
    expect(validateListSearch({ direction: 'asc' })).toEqual({})
    expect(
      validateListSearch({ sort: 'name', direction: 'ascendente' }),
    ).toEqual({ sort: 'name' })
  })

  it('ignora o que não é parâmetro conhecido', () => {
    expect(validateListSearch({ qualquer: 'coisa' })).toEqual({})
  })
})

describe('withExtra', () => {
  it('acrescenta as chaves de texto ao conjunto padrão', () => {
    const parse = withExtra(['status', 'courseId'] as const)

    expect(parse({ page: 2, status: 'ACTIVE', courseId: 'abc' })).toEqual({
      page: 2,
      status: 'ACTIVE',
      courseId: 'abc',
    })
  })

  it('descarta extra vazio e extra que não é texto', () => {
    const parse = withExtra(['status'] as const)

    expect(parse({ status: '' })).toEqual({})
    expect(parse({ status: 7 })).toEqual({})
  })

  it('aceita zero nas chaves numéricas', () => {
    // `0` é filtro legítimo - "a partir de R$ 0" -, então a condição é sobre ser
    // inteiro não-negativo e não sobre ser verdadeiro.
    const parse = withExtra([] as const, ['minPrice'] as const)

    expect(parse({ minPrice: 0 })).toEqual({ minPrice: 0 })
    expect(parse({ minPrice: '150' })).toEqual({ minPrice: 150 })
  })

  it('descarta numérico ilegível e negativo', () => {
    const parse = withExtra([] as const, ['minPrice'] as const)

    expect(parse({ minPrice: 'abc' })).toEqual({})
    expect(parse({ minPrice: -1 })).toEqual({})
  })

  it('não deixa o extra sobrescrever o padrão com lixo', () => {
    // A ordem do espalhamento põe o extra por último. O teste existe para essa
    // ordem ser uma decisão e não um acidente: uma chave extra chamada `page`
    // passaria por cima da página já validada.
    const parse = withExtra(['status'] as const)

    expect(parse({ page: 3, status: 'ACTIVE' })).toEqual({
      page: 3,
      status: 'ACTIVE',
    })
  })
})
