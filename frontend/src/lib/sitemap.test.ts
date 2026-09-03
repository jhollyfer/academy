import { describe, expect, it } from 'vitest'
import { buildSitemap, STATIC_ENTRIES } from './sitemap'

describe('buildSitemap', () => {
  it('monta URL absoluta sem barra dobrada', () => {
    const xml = buildSitemap('https://academy.maiyu.com.br/', [
      { path: '/courses/robotics' },
    ])

    expect(xml).toContain(
      '<loc>https://academy.maiyu.com.br/courses/robotics</loc>',
    )
    expect(xml).not.toContain('//courses')
  })

  it('a raiz sai sem barra no fim, e não como origem duplicada', () => {
    const xml = buildSitemap('https://academy.maiyu.com.br', [{ path: '/' }])

    expect(xml).toContain('<loc>https://academy.maiyu.com.br</loc>')
  })

  it('escapa o que o XML reserva', () => {
    const xml = buildSitemap('https://exemplo.com', [
      { path: '/busca?a=1&b=2' },
    ])

    // `&` cru quebraria o documento inteiro, e o buscador descarta sem avisar.
    expect(xml).toContain('a=1&amp;b=2')
    expect(xml).not.toMatch(/&(?!amp;)/)
  })

  it('omite lastmod e priority quando não vêm', () => {
    const xml = buildSitemap('https://exemplo.com', [{ path: '/about' }])

    expect(xml).not.toContain('<lastmod>')
    expect(xml).not.toContain('<priority>')
  })

  it('inclui lastmod e priority quando vêm', () => {
    const xml = buildSitemap('https://exemplo.com', [
      { path: '/about', lastModified: '2026-01-31', priority: 0.5 },
    ])

    expect(xml).toContain('<lastmod>2026-01-31</lastmod>')
    expect(xml).toContain('<priority>0.5</priority>')
  })

  it('a lista estática cobre a home, a matrícula e as páginas legais', () => {
    const paths = STATIC_ENTRIES.map((entry) => entry.path)

    expect(paths).toEqual(['/', '/enrollment', '/about', '/terms', '/privacy'])
  })
})
