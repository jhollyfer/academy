import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoUnarchiveUseCase from './unarchive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PhotoUnarchiveController {
  static docs = defineDocs({
    description:
      'Tira da lixeira. Responde 204 sem corpo. Foto viva é 404 aqui, pelo espelho de `archive`.',
  })

  constructor(private readonly useCase: PhotoUnarchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
