/**
 * A trilha do painel, derivada das rotas que casaram.
 *
 * Das rotas, e não do `location.pathname` sozinho, por um motivo só: um caminho
 * partido em segmentos produz destinos que não existem - `/administrator/courses/$id` é
 * tela, mas `/administrator/courses/abc-123` só é navegável porque essa rota casou. O
 * conjunto de `pathname` das rotas casadas responde quais prefixos existem de
 * verdade, e só esses viram link.
 *
 * Mora fora de `routes/` para poder ser testado sem que o gerador da árvore
 * trate o arquivo de teste como uma rota - mesmo motivo de `list-search.ts`.
 */

export type Crumb = {
  label: string
  /** Ausente quando o prefixo não é uma rota, ou quando é a página atual. */
  to?: string
}

/**
 * O rótulo de cada segmento do caminho. Lookup object e não uma cadeia de
 * `if`: segmento novo sem rótulo aqui aparece cru, e não some.
 */
const SEGMENT_LABELS: Record<string, string | undefined> = {
  administrator: 'Painel',
  courses: 'Cursos',
  classes: 'Turmas',
  enrollments: 'Matrículas',
  users: 'Usuários',
  new: 'Novo',
  edit: 'Editar',
}

function segments(path: string): Array<string> {
  return path.split('/').filter(Boolean)
}

/** O que o roteador chama de match, reduzido ao que a trilha precisa. */
export type BreadcrumbMatch = {
  /** Com os parâmetros por preencher: `/administrator/classes/$id`. */
  fullPath: string
  /** Com os parâmetros preenchidos: `/administrator/classes/abc-123`. */
  pathname: string
}

/**
 * `fullPath` e `pathname` andam em paralelo: o primeiro diz se o segmento é
 * parâmetro (`$id`) e o segundo diz o valor dele. É o par que permite rotular
 * "Detalhe" onde há um uuid, em vez de imprimir o uuid na trilha.
 */
export function buildBreadcrumbs(
  matches: ReadonlyArray<BreadcrumbMatch>,
): Array<Crumb> {
  const last = matches.at(-1)

  if (!last) return []

  const navigable = new Set(
    matches.map((match) => match.pathname.replace(/\/$/, '')),
  )

  const pattern = segments(last.fullPath)
  const actual = segments(last.pathname)
  const crumbs: Array<Crumb> = []

  for (const [index, value] of actual.entries()) {
    const token = pattern[index] ?? value
    const to = '/'.concat(actual.slice(0, index + 1).join('/'))

    let label = SEGMENT_LABELS[token] ?? value

    // Parâmetro de identificador: o uuid não diz nada a quem lê.
    if (token === '$id') label = 'Detalhe'

    const crumb: Crumb = { label }

    // A página atual nunca é link, e prefixo que não casou com rota nenhuma
    // também não.
    if (index < actual.length - 1 && navigable.has(to)) crumb.to = to

    crumbs.push(crumb)
  }

  return crumbs
}
