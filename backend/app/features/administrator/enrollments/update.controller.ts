import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentUpdateUseCase from './update.use-case.ts'
import { AdministratorEnrollmentUpdateValidator, IdentifierValidator } from '#core/validator'

@inject()
export default class EnrollmentUpdateController {
  static docs = defineDocs({
    description:
      'Move o estado e anota. Os dados do candidato **não** são editáveis aqui: são dele, e ' +
      'corrigi-los pelo painel apagaria o que ele declarou sem deixar rastro.\n\n' +
      'A transição é conferida contra o mapa de estados: `PENDING` vai a `CONFIRMED` ou ' +
      '`CANCELLED`, `WAITLIST` vai a `PENDING` (a promoção quando abre vaga) ou `CANCELLED`, ' +
      '`CONFIRMED` só a `CANCELLED`, e `CANCELLED` não vai a lugar nenhum. Transição inválida ' +
      'é 409.\n\n' +
      'Confirmar exige comprovante anexado - não há gateway, então a única prova é o arquivo.',
  })

  constructor(private readonly useCase: EnrollmentUpdateUseCase) {}

  async handle(context: HttpContext) {
    const { id } = await IdentifierValidator.validate(context.params)
    const payload = await context.request.validateUsing(AdministratorEnrollmentUpdateValidator)
    const result = await this.useCase.execute({ id, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
