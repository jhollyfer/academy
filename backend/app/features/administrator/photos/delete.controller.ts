import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PhotoDeleteController {
  static docs = defineDocs({
    summary: 'Apagar foto',
    description:
      '**Irreversível**: apaga a linha do banco. Só aceita foto já arquivada. O arquivo em si ' +
      'continua em `/storages`, e passa a poder ser apagado de lá. Privilégio exclusivo do dono.',
  })

  constructor(private readonly useCase: PhotoDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
