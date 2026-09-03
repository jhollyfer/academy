import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class UserDeleteController {
  static docs = defineDocs({
    summary: 'Apagar usuário',
    description:
      '**Irreversível**: apaga a linha, e o vínculo de guarda e os tokens vão junto por ' +
      'cascata. As matrículas ficam, sem dono. Só aceita usuário já arquivado, recusa quando ' +
      'há matrícula vinculada, e ninguém apaga a si mesmo. Privilégio exclusivo do dono.',
  })

  constructor(private readonly useCase: UserDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
