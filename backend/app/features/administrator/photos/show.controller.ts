import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoShowUseCase from './show.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class PhotoShowController {
  static docs = defineDocs({
    description:
      'Devolve o objeto nu, sem envelope, com a imagem aninhada. Foto arquivada não é ' +
      'encontrada aqui - para alcançá-la, liste com `?trashed`.',
  })

  constructor(private readonly useCase: PhotoShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
