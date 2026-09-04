import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoListUseCase from './paginate.use-case.ts'
import { AdministratorPhotoPaginationValidator } from '#core/validator'

@inject()
export default class PhotoListController {
  static docs = defineDocs({
    description:
      'As fotos da escola, na ordem em que a galeria as mostra. Aceita `?trashed` para ' +
      'alcançar a lixeira e `?status` para separar o que está no ar do que saiu.',
  })

  constructor(private readonly useCase: PhotoListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorPhotoPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
