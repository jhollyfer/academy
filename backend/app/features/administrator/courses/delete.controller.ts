import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import CourseDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class CourseDeleteController {
  static docs = defineDocs({
    summary: 'Apagar curso',
    description:
      '**Irreversível**: apaga a linha do banco, e a grade e o FAQ vão junto por cascata. Só ' +
      'aceita curso já arquivado, e recusa quando existe turma no curso. Privilégio exclusivo ' +
      'do dono.',
  })

  constructor(private readonly useCase: CourseDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
