import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoCreateUseCase from './create.use-case.ts'
import { AdministratorPhotoCreateValidator } from '#core/validator'

@inject()
export default class PhotoCreateController {
  static docs = defineDocs({
    description:
      'Devolve 201 com a foto criada, objeto nu e sem envelope. `imageId` é um arquivo já ' +
      'confirmado em `/storages`, e a legenda é obrigatória.',
  })

  constructor(private readonly useCase: PhotoCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AdministratorPhotoCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
