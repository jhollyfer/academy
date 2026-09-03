import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserCreateUseCase from './create.use-case.ts'
import { AdministratorUserCreateValidator } from '#core/validator'

@inject()
export default class UserCreateController {
  static docs = defineDocs({
    description:
      'A senha é opcional, e é ela que decide o caminho: **com senha** a conta nasce pronta; ' +
      '**sem senha** sai um convite por e-mail e quem define a credencial é o titular. Use o ' +
      'segundo para responsável e aluno. `role` não aceita `OWNER`.',
  })

  constructor(private readonly useCase: UserCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AdministratorUserCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
