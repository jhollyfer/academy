import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PartnerDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PartnerDeleteController {
  static docs = defineDocs({
    summary: 'Apagar parceiro',
    description:
      '**Irreversível**: apaga a linha do banco. Só aceita parceiro já arquivado. A logomarca ' +
      'não vai junto - o arquivo é neutro e continua em `/storages`, livre para ser apagado ' +
      'de lá. Privilégio exclusivo do dono.',
  })

  constructor(private readonly useCase: PartnerDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
