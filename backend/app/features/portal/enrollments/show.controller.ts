import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PortalEnrollmentShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PortalEnrollmentShowController {
  static docs = defineDocs({
    description:
      'Matrícula fora do escopo de quem pergunta responde **404, e não 403**: confirmar que o ' +
      'id existe entregaria justamente o que o recorte esconde.',
  })

  constructor(private readonly useCase: PortalEnrollmentShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
