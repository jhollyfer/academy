import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerUnarchiveUseCase from './unarchive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PartnerUnarchiveController {
  static docs = defineDocs({
    description:
      'Tira da lixeira. Responde 204 sem corpo. Parceiro vivo é 404 aqui, pelo espelho exato ' +
      'da razão que faz parceiro arquivado ser 404 em `archive`.',
  })

  constructor(private readonly useCase: PartnerUnarchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
