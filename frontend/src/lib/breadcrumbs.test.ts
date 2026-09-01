import { describe, expect, it } from 'vitest'

import { buildBreadcrumbs } from './breadcrumbs'
import type { BreadcrumbMatch } from './breadcrumbs'

function match(fullPath: string, pathname: string): BreadcrumbMatch {
  return { fullPath, pathname }
}

describe('buildBreadcrumbs', () => {
  it('devolve vazio sem match nenhum', () => {
    expect(buildBreadcrumbs([])).toEqual([])
  })

  it('a página atual nunca é link', () => {
    const crumbs = buildBreadcrumbs([match('/admin', '/admin')])

    expect(crumbs).toEqual([{ label: 'Painel' }])
  })

  it('o prefixo vira link quando alguma rota casou com ele', () => {
    const crumbs = buildBreadcrumbs([
      match('/admin', '/admin'),
      match('/admin/turmas', '/admin/turmas'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel', to: '/admin' },
      { label: 'Turmas' },
    ])
  })

  it('troca o uuid do parâmetro por "Detalhe"', () => {
    const crumbs = buildBreadcrumbs([
      match('/admin', '/admin'),
      match('/admin/matriculas', '/admin/matriculas'),
      match('/admin/matriculas/$id', '/admin/matriculas/abc-123'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel', to: '/admin' },
      { label: 'Matrículas', to: '/admin/matriculas' },
      { label: 'Detalhe' },
    ])
  })

  it('prefixo que não casou com rota nenhuma não vira link', () => {
    const crumbs = buildBreadcrumbs([
      match('/admin/turmas/nova', '/admin/turmas/nova'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel' },
      { label: 'Turmas' },
      { label: 'Nova' },
    ])
  })

  it('segmento sem rótulo aparece cru em vez de sumir', () => {
    const crumbs = buildBreadcrumbs([
      match('/admin/relatorios', '/admin/relatorios'),
    ])

    expect(crumbs.at(-1)).toEqual({ label: 'relatorios' })
  })
})
