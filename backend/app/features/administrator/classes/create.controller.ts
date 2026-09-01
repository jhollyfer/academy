import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import ClassCreateUseCase from './create.use-case.ts'
import { AdministratorClassCreateValidator } from '#core/validator'

@inject()
export default class ClassCreateController {
  static docs = defineDocs({
    description:
      'Devolve 201 com a turma criada, objeto nu. O `status` aceita apenas `OPEN` ou `CLOSED`: ' +
      '`FULL` é derivado da ocupação e nunca digitado.',
  })

  constructor(private readonly useCase: ClassCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AdministratorClassCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
