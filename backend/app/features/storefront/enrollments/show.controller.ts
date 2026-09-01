import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontEnrollmentShowUseCase from './show.use-case.ts'
import { ProtocolValidator } from '#core/validator'

@inject()
export default class StorefrontEnrollmentShowController {
  static docs = defineDocs({
    description:
      'Acompanhamento pelo `protocol`. Sem sessão de propósito: o protocolo **é** a ' +
      'credencial - um uuid que só quem se inscreveu recebeu, e que não se adivinha.\n\n' +
      'Não devolve as anotações internas da secretaria: elas são sobre o candidato, não para ' +
      'ele.',
  })

  constructor(private readonly useCase: StorefrontEnrollmentShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await ProtocolValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
