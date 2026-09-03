import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { defineDocs } from '#core/openapi/types'
import { ProtocolValidator } from '#core/validator'
import QRCodeService from '#services/qrcode.service'
import StorefrontEnrollmentShowUseCase from './show.use-case.ts'
import PixService from '#services/pix.service'
import HTTPException from '#exceptions/http.exception'

@inject()
export default class StorefrontEnrollmentPixController {
  static docs = defineDocs({
    summary: 'QR do Pix da inscrição',
    description:
      'O PNG do QR de pagamento da inscrição, gerado na hora a partir do BR Code da matrícula.\n\n' +
      'Não vira arquivo em `storages`: o QR é função pura da chave da escola e do valor do ' +
      'curso, e gravar um PNG por matrícula seria manter um cache que a troca da chave ' +
      'invalidaria em silêncio.\n\n' +
      'Público como o resto do grupo, e escopado pelo protocolo - que é o que a pessoa recebeu ' +
      'ao se inscrever. O mesmo código em texto vem no `pixCode` da matrícula, para quem prefere ' +
      'copiar e colar.',
  })

  constructor(
    private readonly useCase: StorefrontEnrollmentShowUseCase,
    private readonly pix: PixService,
    private readonly qrcode: QRCodeService
  ) {}

  async handle(context: HttpContext) {
    const { protocol } = await ProtocolValidator.validate(context.params)

    const result = await this.useCase.execute({ protocol })

    if (result.isLeft()) throw result.value

    const enrollment = result.value
    const fee = enrollment.class?.course?.enrollmentFeeInCents

    if (!fee)
      throw HTTPException.NotFound('Matrícula sem valor de inscrição', 'ENROLLMENT_FEE_MISSING')

    const buffer = await this.qrcode.toBuffer(
      this.pix.payload({ amountInCents: fee, txid: enrollment.protocol })
    )

    // `inline` e não `attachment`: a imagem é mostrada na página, não baixada.
    // Cache curto e privado porque o código carrega o protocolo de uma pessoa -
    // um proxy compartilhado guardando isso entregaria o QR de uma matrícula a
    // quem pedir o de outra.
    return context.response
      .header('content-type', 'image/png')
      .header('content-disposition', 'inline; filename="pix.png"')
      .header('cache-control', 'private, max-age=300')
      .send(buffer)
  }
}
