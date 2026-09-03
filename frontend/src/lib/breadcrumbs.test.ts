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
    const crumbs = buildBreadcrumbs([match('/administrator', '/administrator')])

    expect(crumbs).toEqual([{ label: 'Painel' }])
  })

  it('o prefixo vira link quando alguma rota casou com ele', () => {
    const crumbs = buildBreadcrumbs([
      match('/administrator', '/administrator'),
      match('/administrator/classes', '/administrator/classes'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel', to: '/administrator' },
      { label: 'Turmas' },
    ])
  })

  it('troca o uuid do parâmetro por "Detalhe"', () => {
    const crumbs = buildBreadcrumbs([
      match('/administrator', '/administrator'),
      match('/administrator/enrollments', '/administrator/enrollments'),
      match(
        '/administrator/enrollments/$id',
        '/administrator/enrollments/abc-123',
      ),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel', to: '/administrator' },
      { label: 'Matrículas', to: '/administrator/enrollments' },
      { label: 'Detalhe' },
    ])
  })

  it('prefixo que não casou com rota nenhuma não vira link', () => {
    const crumbs = buildBreadcrumbs([
      match('/administrator/classes/new', '/administrator/classes/new'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel' },
      { label: 'Turmas' },
      { label: 'Novo' },
    ])
  })

  it('usuários é rotulado como os outros recursos do painel', () => {
    // A rota nasceu depois das três primeiras e o rótulo ficou para trás, então
    // a trilha dizia "Painel > users". O teste abaixo é o que deixava isso
    // passar sem quebrar nada - a falta de rótulo é silenciosa de propósito.
    const crumbs = buildBreadcrumbs([
      match('/administrator', '/administrator'),
      match('/administrator/users', '/administrator/users'),
    ])

    expect(crumbs).toEqual([
      { label: 'Painel', to: '/administrator' },
      { label: 'Usuários' },
    ])
  })

  it('segmento sem rótulo aparece cru em vez de sumir', () => {
    const crumbs = buildBreadcrumbs([
      match('/administrator/relatorios', '/administrator/relatorios'),
    ])

    expect(crumbs.at(-1)).toEqual({ label: 'relatorios' })
  })
})
