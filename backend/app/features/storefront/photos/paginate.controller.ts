import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontPhotoListUseCase from './paginate.use-case.ts'
import { PaginationValidator } from '#core/validator'

@inject()
export default class StorefrontPhotoListController {
  static docs = defineDocs({
    description:
      'A galeria como o visitante a vê, sem sessão. Só foto `ACTIVE` e não removida, na ordem ' +
      'que a escola definiu.\n\n' +
      'Devolve lista vazia enquanto não houver acervo, e a seção some do site nesse caso.',
  })

  constructor(private readonly useCase: StorefrontPhotoListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await PaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
