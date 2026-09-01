import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import ClassUpdateUseCase from './update.use-case.ts'
import { AdministratorClassUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class ClassUpdateController {
  static docs = defineDocs({
    description:
      'Merge parcial: campo ausente não é tocado. Reduzir a `capacity` abaixo das vagas já ' +
      'ocupadas é recusado com 409 - a turma não pode nascer com mais gente do que cabe.',
  })

  constructor(private readonly useCase: ClassUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorClassUpdateValidator)
    const result = await this.useCase.execute({ id, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
