import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontCourseListUseCase from './paginate.use-case.ts'
import { PaginationValidator } from '#core/validator'

@inject()
export default class StorefrontCourseListController {
  static docs = defineDocs({
    description:
      'Os cursos como o candidato os vê, sem sessão. Só curso `ACTIVE` e não removido, na ' +
      'ordem que a escola definiu para os cards da home.\n\n' +
      'Sem `?trashed` e sem `?status`: a vitrine não tem lixeira nem enxerga rascunho, e ' +
      'aceitar o parâmetro para ignorá-lo prometeria no OpenAPI um filtro que não existe.',
  })

  constructor(private readonly useCase: StorefrontCourseListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await PaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
