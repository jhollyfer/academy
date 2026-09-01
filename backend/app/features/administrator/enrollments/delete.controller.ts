import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentDeleteUseCase from './delete.use-case.ts'
import { IdentifierValidator } from '#core/validator'

@inject()
export default class EnrollmentDeleteController {
  static docs = defineDocs({
    summary: 'Apagar matrícula',
    description:
      '**Irreversível**: apaga a linha e os vínculos de arquivo por cascata. Só aceita ' +
      'matrícula já arquivada. Privilégio exclusivo do dono.\n\n' +
      'É também o caminho do direito de exclusão da LGPD: apagar de vez o dado pessoal de quem ' +
      'pediu. O binário no bucket segue a rotina de arquivo, que é outra.',
  })

  constructor(private readonly useCase: EnrollmentDeleteUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
