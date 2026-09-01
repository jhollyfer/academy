import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontEnrollmentAttachUseCase from './attach.use-case.ts'
import { ProtocolValidator, StorefrontEnrollmentAttachmentValidator } from '#core/validator'

@inject()
export default class StorefrontEnrollmentAttachController {
  static docs = defineDocs({
    summary: 'Anexar comprovante à matrícula',
    description:
      'Recebe o `id` de um arquivo já enviado, **não** o binário: o upload é presigned ' +
      'multipart e o arquivo vai do navegador direto ao bucket.\n\n' +
      'Só aceita arquivo já confirmado (`UPLOADED`) - anexar um upload pela metade deixaria a ' +
      'secretaria olhando um comprovante truncado.\n\n' +
      'Reenviar é permitido e não substitui: o histórico do que foi mandado importa numa ' +
      'conferência manual, e a secretaria pode ter recusado o primeiro.',
  })

  constructor(private readonly useCase: StorefrontEnrollmentAttachUseCase) {}

  async handle(context: HttpContext) {
    const { protocol } = await ProtocolValidator.validate(context.params)
    const payload = await context.request.validateUsing(StorefrontEnrollmentAttachmentValidator)
    const result = await this.useCase.execute({ protocol, ...payload })
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
