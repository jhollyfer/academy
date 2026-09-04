import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerListUseCase from './paginate.use-case.ts'
import { AdministratorPartnerPaginationValidator } from '#core/validator'

@inject()
export default class PartnerListController {
  static docs = defineDocs({
    description:
      'Os parceiros da escola, na ordem em que a vitrine os mostra. Aceita `?trashed` para ' +
      'alcançar a lixeira e `?status` para separar o que está no ar do que saiu.',
  })

  constructor(private readonly useCase: PartnerListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorPartnerPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
