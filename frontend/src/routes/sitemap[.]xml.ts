import { createFileRoute } from '@tanstack/react-router'
import { BASE_URL } from '#/integrations/tanstack-query/http'
import { buildSitemap, STATIC_ENTRIES } from '#/lib/sitemap'
import type { SitemapEntry } from '#/lib/sitemap'
import { SITE_URL } from '#/lib/site'

/**
 * O sitemap, servido em `/sitemap.xml`.
 *
 * Rota de servidor e não server function: quem consome é o rastreador do
 * buscador, que é um terceiro e precisa de `Content-Type` e status próprios -
 * exatamente a linha que separa as duas coisas em `_doc-lib/tanstack-start.md`.
 *
 * As páginas de curso vêm da API porque são as únicas que dependem do banco.
 * Duas hoje, e o número muda sem deploy: uma lista escrita à mão aqui
 * envelheceria em silêncio no dia em que a secretaria cadastrasse a terceira.
 *
 * `process.env.SERVER_API_URL` direto, e não o `baseUrl()` de `http.ts`: aquele
 * é um `createIsomorphicFn` e este arquivo só roda no servidor. A leitura fica
 * dentro do handler, e não no escopo do módulo, porque em runtime de borda as
 * variáveis são injetadas por requisição.
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Array<SitemapEntry> = [...STATIC_ENTRIES]

        try {
          const api = process.env.SERVER_API_URL ?? BASE_URL
          const response = await fetch(`${api}/storefront/courses?perPage=100`)

          if (response.ok) {
            const payload: {
              data?: Array<{ slug?: string; updatedAt?: string }>
            } = await response.json()

            for (const course of payload.data ?? []) {
              if (!course.slug) continue

              entries.push({
                path: `/courses/${course.slug}`,
                lastModified: course.updatedAt?.slice(0, 10),
                priority: 0.8,
              })
            }
          }
        } catch {
          // API fora do ar devolve o sitemap só com as páginas estáticas, em vez
          // de 500. Um sitemap parcial é lido e aproveitado; um que falha faz o
          // buscador desistir do arquivo até a próxima visita.
        }

        return new Response(buildSitemap(SITE_URL, entries), {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            // Uma hora: o conteúdo muda quando um curso entra ou sai, o que
            // acontece poucas vezes por ano.
            'cache-control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
