import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontPartnerListUseCase from './paginate.use-case.ts'
import { PaginationValidator } from '#core/validator'

@inject()
export default class StorefrontPartnerListController {
  static docs = defineDocs({
    description:
      'Os parceiros como o visitante os vê, sem sessão. Só parceiro `ACTIVE` e não removido, ' +
      'na ordem que a escola definiu para a faixa da home.\n\n' +
      'Sem `?trashed` e sem `?status`, pela mesma razão da vitrine de cursos: o site não tem ' +
      'lixeira nem enxerga rascunho, e aceitar o parâmetro para ignorá-lo prometeria no ' +
      'OpenAPI um filtro que não existe.',
  })

  constructor(private readonly useCase: StorefrontPartnerListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await PaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
