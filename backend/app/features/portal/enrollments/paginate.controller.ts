import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PortalEnrollmentListUseCase from './paginate.use-case.ts'
import { PaginationValidator } from '#core/validator'

@inject()
export default class PortalEnrollmentListController {
  static docs = defineDocs({
    summary: 'Minhas matrículas',
    description:
      'As matrículas de quem está logado. O aluno vê a própria; o responsável vê aquela em ' +
      'que ele é o responsável registrado e as dos dependentes vinculados a ele.',
  })

  constructor(private readonly useCase: PortalEnrollmentListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await PaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
