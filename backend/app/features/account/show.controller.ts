import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { defineDocs } from '#core/openapi/types'
import AccountShowUseCase from './show.use-case.ts'

@inject()
export default class ProfileController {
  static docs = defineDocs({
    description:
      'A própria conta. O usuário vem sempre da sessão: não há identificador no caminho, e não ' +
      'teria como haver - o escopo é quem está autenticado, nunca quem o payload disser.',
  })

  constructor(private readonly useCase: AccountShowUseCase) {}

  async handle(context: HttpContext) {
    const result = await this.useCase.execute({ id: context.auth.user!.id })

    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
