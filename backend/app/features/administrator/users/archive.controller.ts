import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserArchiveUseCase from './archive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class UserArchiveController {
  static docs = defineDocs({
    description:
      'Manda para a lixeira, de onde `PATCH /:id/unarchive` traz de volta. O acesso cai na ' +
      'hora: o token já emitido deixa de valer na requisição seguinte. Ninguém arquiva a si ' +
      'mesmo.',
  })

  constructor(private readonly useCase: UserArchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
