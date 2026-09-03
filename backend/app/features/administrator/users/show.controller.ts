import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class UserShowController {
  static docs = defineDocs({
    description:
      'Devolve o objeto nu, com o avatar e os dois lados do vínculo de guarda aninhados. ' +
      'Usuário arquivado não é encontrado aqui, e o dono responde 404 para quem não é dono - ' +
      'não 403, para não confirmar que o id existe.',
  })

  constructor(private readonly useCase: UserShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
