import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontFaqPaginateUseCase from './paginate.use-case.ts'
import { PaginationValidator } from '#core/validator'

@inject()
export default class StorefrontFaqPaginateController {
  static docs = defineDocs({
    description:
      'As perguntas frequentes da escola, as que valem para a home. Sem sessão.\n\n' +
      'Só as de `courseId` nulo: pergunta de um curso sai junto do curso, em ' +
      '`GET /storefront/courses/:slug`.',
  })

  constructor(private readonly useCase: StorefrontFaqPaginateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await PaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
