import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import PhotoUpdateUseCase from './update.use-case.ts'
import { AdministratorPhotoUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class PhotoUpdateController {
  static docs = defineDocs({
    description: 'Merge parcial: campo ausente não é tocado.',
  })

  constructor(private readonly useCase: PhotoUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorPhotoUpdateValidator)
    const result = await this.useCase.execute({ id, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
