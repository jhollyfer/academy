import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentArchiveUseCase from './archive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class EnrollmentArchiveController {
  static docs = defineDocs({
    description:
      'Envia para a lixeira. Responde 204 sem corpo. Matrícula arquivada **não ocupa vaga**: a ' +
      'turma é reconciliada logo depois.',
  })

  constructor(private readonly useCase: EnrollmentArchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
