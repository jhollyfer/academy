import type { TrashedMode } from './validator'

/**
 * Os filtros de qualquer listagem do painel, na URL.
 *
 * Na URL, e não em `useState`, porque é o que sobrevive ao F5 e ao link
 * compartilhado - a tabela na página 2 com um filtro aplicado tem que voltar
 * igual.
 *
 * À mão, e não com `lib/validator.ts`: o `validateSearch` do roteador é
 * síncrono e o `validate` do VineJS devolve promessa. Mesmo motivo, e mesmo
 * formato, de `redirect-search.ts`.
 *
 * Mora fora de `routes/` para poder ser testado sem que o gerador da árvore
 * trate o arquivo de teste como uma rota.
 */
/**
 * O sentido da ordenação. Espelha `SortDirections` de `backend/app/core/entity.ts`
 * - mesma expressão dos dois lados, como os validators.
 */
export const SortDirections = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export type SortDirection = (typeof SortDirections)[keyof typeof SortDirections]

const SORT_DIRECTIONS: Record<string, SortDirection | undefined> = {
  asc: SortDirections.ASC,
  desc: SortDirections.DESC,
}

export type ListSearch = {
  page?: number
  perPage?: number
  search?: string
  trashed?: TrashedMode
  /**
   * A coluna da ordem. **Não** é validada contra uma lista aqui: cada recurso
   * aceita as suas, quem fecha a lista é o `sortFields()` do backend, e repetir
   * as dez listas no cliente seria garantir que as duas divergissem. Coluna
   * inválida volta 422 apontando o campo.
   */
  sort?: string
  direction?: SortDirection
}

/**
 * Os valores são literais, e o `TrashedModes` de `validator.ts` entra só como
 * **tipo**. Não é descuido: este arquivo é importado por toda rota que declara
 * `validateSearch`, então ele cai no chunk do router, enquanto o enum mora no
 * chunk do validator. Ler o enum aqui, em escopo de módulo, cria uma aresta
 * entre os dois chunks - e o Rolldown não garante que o grafo de chunks seja
 * acíclico. Num ciclo, o chunk do validator ainda não terminou de avaliar
 * quando esta linha roda, e `TrashedModes` vale `undefined`:
 *
 *     TypeError: Cannot read properties of undefined (reading 'ONLY')
 *
 * O build passa verde e só o primeiro SSR em produção descobre. `import type`
 * some no build e a aresta com ele. A anotação é o que segura a duplicação: se
 * `TrashedModes.ONLY` mudar de valor, `'only'` deixa de ser atribuível a
 * `TrashedMode` e o `tsc` acusa. `scripts/check-chunk-cycles.mjs` guarda o
 * resto do `.output/`.
 */
const TRASHED_MODES: Record<string, TrashedMode | undefined> = {
  only: 'only',
  with: 'with',
}

/** Search param chega como string na URL e como número na navegação tipada. */
function positive(value: unknown): number | undefined {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) return undefined

  return parsed
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined

  return value
}

export function validateListSearch(
  search: Record<string, unknown>,
): ListSearch {
  const result: ListSearch = {}

  const page = positive(search.page)
  if (page) result.page = page

  const perPage = positive(search.perPage)
  // O backend recusa acima de 100; deixar passar viraria 422 numa navegação.
  if (perPage && perPage <= 100) result.perPage = perPage

  const term = text(search.search)
  if (term) result.search = term

  const trashed = TRASHED_MODES[String(search.trashed)]
  if (trashed) result.trashed = trashed

  const sort = text(search.sort)
  if (sort) result.sort = sort

  // `direction` sem `sort` não ordena nada; deixá-la passar sozinha só sujaria
  // a URL com um parâmetro sem efeito.
  const direction = SORT_DIRECTIONS[String(search.direction)]
  if (sort && direction) result.direction = direction

  return result
}

/**
 * As listagens que somam um filtro próprio ao conjunto padrão - `?status` em
 * empresas, `?companyId` em produtos, `?userId` em endereços. O extra é sempre
 * texto: uuid e enum chegam como string na URL, e quem recusa valor inválido é
 * a API, com 422 apontando o campo.
 */
export function withExtra<TKey extends string, TNumeric extends string = never>(
  keys: ReadonlyArray<TKey>,
  /**
   * As chaves que são número na URL - hoje só a faixa de preço, em centavos.
   * Separadas porque `?minPrice=abc` tem de sumir, e não virar a string `'abc'`
   * numa requisição que o backend recusaria com 422.
   */
  numericKeys: ReadonlyArray<TNumeric> = [],
) {
  return (search: Record<string, unknown>) => {
    const extra: Partial<Record<TKey, string>> = {}

    for (const key of keys) {
      const value = text(search[key])
      if (value) extra[key] = value
    }

    const numeric: Partial<Record<TNumeric, number>> = {}

    for (const key of numericKeys) {
      const parsed = Number(search[key])
      // `0` é filtro legítimo ("a partir de R$ 0"), então a condição é sobre
      // ser inteiro não-negativo, e não sobre ser verdadeiro.
      if (Number.isInteger(parsed) && parsed >= 0) numeric[key] = parsed
    }

    // Os extras são montados à parte e espalhados: escrever direto no objeto
    // combinado exigiria uma asserção para provar ao compilador que a chave
    // genérica cabe ali, e asserção é o que este projeto não usa.
    return { ...validateListSearch(search), ...extra, ...numeric }
  }
}
