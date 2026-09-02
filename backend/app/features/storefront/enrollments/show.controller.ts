import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontEnrollmentShowUseCase from './show.use-case.ts'
import { ProtocolValidator } from '#core/validator'
import { publicEnrollmentView } from '#features/_shared.storefront'

@inject()
export default class StorefrontEnrollmentShowController {
  static docs = defineDocs({
    description:
      'Acompanhamento pelo `protocol`. Sem sessão de propósito: o protocolo **é** a ' +
      'credencial - um uuid que só quem se inscreveu recebeu, e que não se adivinha.\n\n' +
      'Devolve uma **projeção mínima**, não o cadastro: curso, turma, situação e o primeiro ' +
      'nome do candidato. CPF, e-mail, telefone, data de nascimento e os dados do responsável ' +
      'legal não saem por aqui - o link chega por WhatsApp, é encaminhado e fica no histórico ' +
      'da conversa, e nada disso precisa viajar junto para a tela fazer o que faz.\n\n' +
      'Também não devolve as anotações internas da secretaria: elas são sobre o candidato, ' +
      'não para ele.',
  })

  constructor(private readonly useCase: StorefrontEnrollmentShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await ProtocolValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(publicEnrollmentView(result.value))
  }
}
