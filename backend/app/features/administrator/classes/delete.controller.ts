import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import ClassDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class ClassDeleteController {
  static docs = defineDocs({
    summary: 'Apagar turma',
    description:
      '**Irreversível**. Só aceita turma já arquivada, e recusa quando existe matrícula nela - ' +
      'inclusive cancelada, porque a linha continua no banco. Privilégio exclusivo do dono.',
  })

  constructor(private readonly useCase: ClassDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
