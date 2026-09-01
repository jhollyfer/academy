import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import CourseUpdateUseCase from './update.use-case.ts'
import { AdministratorCourseUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class CourseUpdateController {
  static docs = defineDocs({
    description:
      'Merge parcial: campo ausente não é tocado, `null` explícito limpa. Reenviar o `slug` ' +
      'que já está gravado não conta como troca e não dispara conflito.',
  })

  constructor(private readonly useCase: CourseUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorCourseUpdateValidator)
    const result = await this.useCase.execute({ id, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
