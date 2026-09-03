import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import { AuthenticationInviteShowValidator } from '#core/validator'
import AuthenticationInviteShowUseCase from './invite-show.use-case.ts'

@inject()
export default class AuthenticationInviteShowController {
  static docs = defineDocs({
    summary: 'Confere um convite',
    description:
      'Diz se o link de convite ainda serve, para a tela não pedir uma senha que será recusada ' +
      'no envio. Responde `204` **sem corpo**: quem tem o token é quem pergunta, e devolver a ' +
      'conta aqui entregaria o e-mail do titular a qualquer um com o link.\n\n' +
      'A recusa é que carrega a informação, no `code`: `INVITE_NOT_FOUND`, `INVITE_ALREADY_USED` ' +
      '(a conta já foi ativada, o caminho é entrar), `INVITE_EXPIRED` e ' +
      '`INVITE_ACCOUNT_UNAVAILABLE`.',
    responses: { 204: 'no-content' },
  })

  constructor(private readonly useCase: AuthenticationInviteShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AuthenticationInviteShowValidator.validate(context.params)
    const result = await this.useCase.execute(payload)

    if (result.isLeft()) throw result.value

    return context.response.noContent()
  }
}
