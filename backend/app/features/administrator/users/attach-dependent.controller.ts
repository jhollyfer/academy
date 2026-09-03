import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import GuardianshipAttachUseCase from './attach-dependent.use-case.ts'
import { AdministratorGuardianshipValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class GuardianshipAttachController {
  static docs = defineDocs({
    summary: 'Vincular dependente',
    description:
      'Liga um aluno a um responsável. O `:id` da URL precisa ser um `RESPONSIBLE` e o ' +
      '`studentId` do corpo um `STUDENT` - vincular é conceder leitura sobre os dados de ' +
      'outra pessoa, então os dois papéis são conferidos. Repetir o vínculo é idempotente.',
  })

  constructor(private readonly useCase: GuardianshipAttachUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorGuardianshipValidator)
    const result = await this.useCase.execute({ ...payload, id, actor: context.auth.user! })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
