import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerUpdateUseCase from './update.use-case.ts'
import { AdministratorPartnerUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class PartnerUpdateController {
  static docs = defineDocs({
    description:
      'Merge parcial: campo ausente não é tocado, `null` explícito limpa. Reenviar o `name` ' +
      'que já está gravado não conta como troca e não dispara conflito.',
  })

  constructor(private readonly useCase: PartnerUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorPartnerUpdateValidator)
    const result = await this.useCase.execute({ id, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
