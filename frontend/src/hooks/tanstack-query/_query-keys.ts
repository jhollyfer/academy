import type { ListSearch } from '#/lib/list-search'

/**
 * As chaves de cache, num lugar só.
 *
 * `list` é a tabela (paginação clássica, filtro na URL) e `detail` é um registro
 * só. São formatos diferentes de cache para o mesmo recurso, e ambos começam
 * pelo mesmo prefixo - invalidar por ele cobre os dois de uma vez.
 *
 * Centralizadas porque o loader da rota e o componente têm de chegar
 * **exatamente** à mesma chave: se divergirem, o loader enche um cache e o
 * componente lê outro, a tela pisca em `pending` e ninguém entende por quê.
 */
export const queryKeys = {
  /**
   * A sessão. Fica aqui, e não solta em `queries.ts`, porque tem dois donos: o
   * `beforeLoad` que enche o cache e o `onSuccess` do sign-in que o invalida.
   * Escrita literal nos dois, renomear um sem o outro faz o guard reusar a
   * ausência de sessão de um segundo atrás - e o sintoma é login que "não
   * funciona" sem erro nenhum.
   */
  account: {
    all: ['account'] as const,
  },

  courses: {
    all: ['courses'] as const,
    list: (params: ListSearch) => ['courses', 'list', params] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
  },

  classes: {
    all: ['classes'] as const,
    list: (params: ListSearch & { courseId?: string }) =>
      ['classes', 'list', params] as const,
    detail: (id: string) => ['classes', 'detail', id] as const,
  },

  enrollments: {
    all: ['enrollments'] as const,
    list: (
      params: ListSearch & {
        courseId?: string
        classId?: string
        status?: string
      },
    ) => ['enrollments', 'list', params] as const,
    detail: (id: string) => ['enrollments', 'detail', id] as const,
  },

  /**
   * A vitrine. Prefixo próprio e não um recorte de `courses`: são caches
   * diferentes do mesmo dado - o painel enxerga rascunho e lixeira, o site só o
   * que está no ar. Compartilhar o prefixo faria uma edição no painel invalidar
   * a home, e a home é justamente a que não deve piscar.
   */
  storefront: {
    all: ['storefront'] as const,
    courses: () => ['storefront', 'courses'] as const,
    course: (slug: string) => ['storefront', 'courses', slug] as const,
    /**
     * O FAQ da escola, o de `courseId` nulo. Chave própria e não derivada de
     * `courses`: são recursos diferentes, e uma edição de curso no painel não
     * tem por que invalidar as perguntas gerais.
     */
    faqs: () => ['storefront', 'faqs'] as const,
    /**
     * O acompanhamento por protocolo. Não é `enrollments.detail`: a chave lá é
     * o `id`, que o candidato não tem - e o corpo é outro, sem as anotações da
     * secretaria.
     */
    enrollment: (protocol: string) =>
      ['storefront', 'enrollments', protocol] as const,
  },
}
