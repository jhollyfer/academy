import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import CourseCreateUseCase from './create.use-case.ts'
import { AdministratorCourseCreateValidator } from '#core/validator'

@inject()
export default class CourseCreateController {
  static docs = defineDocs({
    description:
      'O `slug` é opcional: sem ele, sai do nome. Devolve 201 com o curso criado, objeto nu ' +
      'e sem envelope. A grade e o FAQ entram depois, pelos endpoints aninhados.',
  })

  constructor(private readonly useCase: CourseCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AdministratorCourseCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
