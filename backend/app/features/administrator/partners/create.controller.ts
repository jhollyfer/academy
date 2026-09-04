import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerCreateUseCase from './create.use-case.ts'
import { AdministratorPartnerCreateValidator } from '#core/validator'

@inject()
export default class PartnerCreateController {
  static docs = defineDocs({
    description:
      'Devolve 201 com o parceiro criado, objeto nu e sem envelope. O `name` é único: ' +
      'cadastrar de novo um parceiro arquivado reativa a linha existente em vez de duplicá-la.',
  })

  constructor(private readonly useCase: PartnerCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AdministratorPartnerCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
