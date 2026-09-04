import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerArchiveUseCase from './archive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PartnerArchiveController {
  static docs = defineDocs({
    description:
      'Envia para a lixeira. Reversível por `PATCH /:id/unarchive`. Responde 204 sem corpo. ' +
      'Parceiro já arquivado é 404 aqui, pelo mesmo filtro que toda leitura aplica.',
  })

  constructor(private readonly useCase: PartnerArchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
