import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserUpdateUseCase from './update.use-case.ts'
import { AdministratorUserUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class UserUpdateController {
  static docs = defineDocs({
    description:
      'Não aceita `password`: trocar a própria senha é `/account`, e redefinir a de outra ' +
      'pessoa é emitir convite. `role` não aceita `OWNER`, e ninguém edita o próprio cadastro ' +
      'por aqui - as duas coisas juntas são o que fecha a auto-promoção.',
  })

  constructor(private readonly useCase: UserUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorUserUpdateValidator)
    const result = await this.useCase.execute({ ...payload, id, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
