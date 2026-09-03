import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { defineDocs } from '#core/openapi/types'
import CookieService, { COOKIE_TOKEN, issueSessionTokens } from '#services/cookie.service'
import AuthenticationRefreshUseCase from './refresh.use-case.ts'

@inject()
export default class AuthenticationRefreshController {
  static docs = defineDocs({
    description:
      'Renova a sessão a partir do cookie de refresh, e responde `204` **sem corpo**: o que ' +
      'importa é o `Set-Cookie` com o par novo.\n\n' +
      'Fica **fora** do grupo autenticado de propósito. É justamente o token de acesso vencido ' +
      'que traz alguém até aqui, então exigir sessão válida tornaria a rota inalcançável. Quem ' +
      'autoriza é o cookie de refresh, e nada mais.\n\n' +
      '**Rotaciona**: o refresh usado é apagado ao emitir o novo. Duas renovações simultâneas ' +
      'com o mesmo token gastam-no duas vezes, e a segunda cai - o cliente deduplica para que ' +
      'isso não aconteça no caminho comum.\n\n' +
      'A falha é **indistinguível por causa**: cookie ausente, ilegível, que não seja de refresh ' +
      'ou de conta desativada devolvem o mesmo `401`.',
  })

  constructor(
    private readonly cookie: CookieService,
    private readonly useCase: AuthenticationRefreshUseCase
  ) {}

  async handle(context: HttpContext) {
    const refreshToken = context.request.cookie(COOKIE_TOKEN.REFRESH)

    const result = await this.useCase.execute({ refreshToken })

    if (result.isLeft()) throw result.value

    const tokens = await issueSessionTokens(result.value)
    this.cookie.set(context, tokens)

    return context.response.noContent()
  }
}
