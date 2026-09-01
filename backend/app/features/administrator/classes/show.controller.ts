import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import ClassShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class ClassShowController {
  static docs = defineDocs({
    description:
      'Devolve o objeto nu, com o curso aninhado e a ocupação calculada. Turma arquivada não ' +
      'é encontrada aqui - para alcançá-la, liste com `?trashed`.',
  })

  constructor(private readonly useCase: ClassShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
