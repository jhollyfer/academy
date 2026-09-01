import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class EnrollmentShowController {
  static docs = defineDocs({
    description:
      'A matrícula com a turma, o curso e os arquivos enviados. É a tela de conferência do ' +
      'comprovante do Pix.',
  })

  constructor(private readonly useCase: EnrollmentShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
