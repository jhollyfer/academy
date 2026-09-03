import * as abilities from '#abilities/main'
import { policies } from '#generated/policies'

import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Cria a instância do Bouncer para a requisição.
 *
 * O bloco de Edge que o instalador escreve foi retirado: este projeto é API
 * pura, não tem `edge.js` instalado, e `ctx.view` não existe - o compilador
 * reclamava de `unknown` a cada build.
 */
export default class InitializeBouncerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Create bouncer instance for the ongoing HTTP request.
     * We will pull the user from the HTTP context.
     */
    ctx.bouncer = new Bouncer(
      () => ctx.auth.user || null,
      abilities,
      policies
    ).setContainerResolver(ctx.containerResolver)

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    bouncer: Bouncer<
      Exclude<HttpContext['auth']['user'], undefined>,
      typeof abilities,
      typeof policies
    >
  }
}
