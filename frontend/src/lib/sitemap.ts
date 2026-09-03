/**
 * O XML do sitemap, montado a partir de uma lista de caminhos.
 *
 * Função pura e separada da rota de propósito: o que quebra num sitemap é o
 * escape e a montagem da URL absoluta, e os dois são testáveis sem servidor, sem
 * rede e sem API no ar. A rota fica só com o que ela é - buscar a lista de
 * cursos e devolver a resposta com o cabeçalho certo.
 */

export type SitemapEntry = {
  /** Caminho absoluto dentro do site, começando por `/`. */
  path: string
  /** Data da última alteração, `YYYY-MM-DD`. Omitida quando não se sabe. */
  lastModified?: string
  /**
   * Peso relativo entre as páginas do próprio site, de 0 a 1. Não muda posição
   * em buscador nenhum - só diz por onde começar quando o rastreador tem
   * orçamento curto.
   */
  priority?: number
}

/**
 * Escapa os cinco caracteres que o XML reserva.
 *
 * Um `&` cru numa query string quebra o documento inteiro, e o buscador descarta
 * o arquivo sem avisar - falha silenciosa, que é a pior forma de errar isto.
 */
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/**
 * Junta a origem ao caminho sem duplicar nem comer a barra.
 *
 * A origem vem de configuração e pode chegar com barra no fim; o caminho é
 * escrito no código e começa com uma. Concatenar direto daria `//courses`, que é
 * outra URL para o rastreador.
 */
function absolute(origin: string, path: string): string {
  return (
    `${origin.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`.replace(
      /\/$/,
      '',
    ) || origin
  )
}

export function buildSitemap(
  origin: string,
  entries: Array<SitemapEntry>,
): string {
  const urls = entries.map(function (entry) {
    const parts = [`    <loc>${escapeXml(absolute(origin, entry.path))}</loc>`]

    if (entry.lastModified)
      parts.push(`    <lastmod>${entry.lastModified}</lastmod>`)
    if (entry.priority !== undefined)
      parts.push(`    <priority>${entry.priority}</priority>`)

    return `  <url>\n${parts.join('\n')}\n  </url>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

/**
 * As páginas que existem sem depender do banco.
 *
 * A home vem com peso maior porque é a que recebe o link do material impresso e
 * do anúncio; as legais entram com peso baixo porque precisam ser indexáveis,
 * mas não competem por ninguém.
 */
export const STATIC_ENTRIES: Array<SitemapEntry> = [
  { path: '/', priority: 1 },
  { path: '/enrollment', priority: 0.9 },
  { path: '/about', priority: 0.5 },
  { path: '/terms', priority: 0.2 },
  { path: '/privacy', priority: 0.2 },
]
