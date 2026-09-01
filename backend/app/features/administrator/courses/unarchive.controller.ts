import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import CourseUnarchiveUseCase from './unarchive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class CourseUnarchiveController {
  static docs = defineDocs({
    description:
      'Tira da lixeira. Responde 204 sem corpo. Curso vivo é 404 aqui, pelo espelho exato da ' +
      'razão que faz curso arquivado ser 404 em `archive`.',
  })

  constructor(private readonly useCase: CourseUnarchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
