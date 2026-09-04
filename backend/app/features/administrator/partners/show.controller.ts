import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PartnerShowController {
  static docs = defineDocs({
    description:
      'Devolve o objeto nu, sem envelope, com a logomarca aninhada. Parceiro arquivado não é ' +
      'encontrado aqui - para alcançá-lo, liste com `?trashed`.',
  })

  constructor(private readonly useCase: PartnerShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
