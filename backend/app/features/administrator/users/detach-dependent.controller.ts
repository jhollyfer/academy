import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import GuardianshipDetachUseCase from './detach-dependent.use-case.ts'
import { AdministratorGuardianshipParamsValidator } from '#core/validator'

@inject()
export default class GuardianshipDetachController {
  static docs = defineDocs({
    summary: 'Desvincular dependente',
    description:
      'Desfaz o vínculo. Idempotente: desvincular quem não estava vinculado devolve 200 com a ' +
      'lista atual, e não erro.',
  })

  constructor(private readonly useCase: GuardianshipDetachUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorGuardianshipParamsValidator.validate(context.params)
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
