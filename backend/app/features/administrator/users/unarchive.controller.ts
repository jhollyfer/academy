import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserUnarchiveUseCase from './unarchive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class UserUnarchiveController {
  static docs = defineDocs({
    description: 'Tira da lixeira e devolve o acesso. Recusa quando o usuário já está ativo.',
  })

  constructor(private readonly useCase: UserUnarchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
