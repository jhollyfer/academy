import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentUnarchiveUseCase from './unarchive.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class EnrollmentUnarchiveController {
  static docs = defineDocs({
    description:
      'Tira da lixeira. Responde 204 sem corpo. Se a turma tiver lotado enquanto isso, a ' +
      'matrícula volta como `WAITLIST` em vez de estourar a capacidade.',
  })

  constructor(private readonly useCase: EnrollmentUnarchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
