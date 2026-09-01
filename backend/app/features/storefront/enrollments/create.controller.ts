import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontEnrollmentCreateUseCase from './create.use-case.ts'
import { StorefrontEnrollmentCreateValidator } from '#core/validator'

@inject()
export default class StorefrontEnrollmentCreateController {
  static docs = defineDocs({
    summary: 'Enviar matrícula',
    description:
      'A matrícula virtual, sem sessão - quem se inscreve não tem conta e não vai ter.\n\n' +
      'Devolve 201 com o `protocol`, que é a **única** credencial do candidato: é por ele que ' +
      'ele acompanha o pedido e anexa o comprovante depois.\n\n' +
      'Candidato menor de 18 anos exige nome, CPF e telefone do responsável legal - `422` com ' +
      'um erro por campo faltante. Turma lotada **não** recusa a inscrição: ela entra como ' +
      '`WAITLIST`, e o 201 diz isso no `status`.',
  })

  constructor(private readonly useCase: StorefrontEnrollmentCreateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(StorefrontEnrollmentCreateValidator)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.created(result.value)
  }
}
