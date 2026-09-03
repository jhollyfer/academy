import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import { AuthenticationInviteAcceptValidator } from '#core/validator'
import CookieService, { issueSessionTokens } from '#services/cookie.service'
import AuthenticationInviteAcceptUseCase from './invite-accept.use-case.ts'

@inject()
export default class AuthenticationInviteAcceptController {
  static docs = defineDocs({
    summary: 'Define a senha pelo convite',
    description:
      'Fecha o convite: grava a senha escolhida pelo titular, marca o link como usado e **abre a ' +
      'sessão na mesma resposta**, com o mesmo par de cookies `httpOnly` do `sign-in`. Quem ' +
      'acabou de definir a senha não é mandado para a tela de login digitá-la de novo.\n\n' +
      'Responde `204` sem corpo. O link vale uma vez só: repetir devolve ' +
      '`INVITE_ALREADY_USED`.',
    responses: { 204: 'no-content' },
  })

  constructor(
    private readonly cookie: CookieService,
    private readonly useCase: AuthenticationInviteAcceptUseCase
  ) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AuthenticationInviteAcceptValidator, {
      data: { ...context.request.body(), ...context.params },
    })
    const result = await this.useCase.execute(payload)

    if (result.isLeft()) throw result.value

    const tokens = await issueSessionTokens(result.value)
    this.cookie.set(context, tokens)

    return context.response.noContent()
  }
}
