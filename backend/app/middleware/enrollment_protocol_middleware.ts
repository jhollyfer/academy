import Enrollment from '#models/enrollment'
import HTTPException from '#exceptions/http.exception'
import { EnrollmentStatuses } from '#core/entity'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * A credencial de quem não tem conta.
 *
 * O candidato precisa subir o comprovante do Pix e não tem sessão - nem vai ter,
 * porque matrícula não cria login. O que ele tem é o `protocol`: um uuid que só
 * chegou a ele, na resposta do próprio envio.
 *
 * Aplicado no **grupo**, como `auth` e `role`: é o mesmo papel que eles cumprem,
 * num público diferente. Atrás dele ficam os controllers de `storages` **sem
 * nenhuma alteração** - o upload presigned multipart é um só, e duplicá-lo para
 * o público seria dois caminhos de código para o mesmo problema, com um deles
 * recebendo correção e o outro não.
 *
 * Protocolo inexistente, arquivado ou de matrícula cancelada respondem o mesmo
 * `404`: para quem está do lado de fora, os três significam "este protocolo não
 * serve", e distinguir só confirmaria a um curioso o que existe no banco.
 */
export default class EnrollmentProtocolMiddleware {
  async handle(context: HttpContext, next: NextFn) {
    const protocol = context.params.protocol

    if (typeof protocol !== 'string')
      throw HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND')

    const enrollment = await Enrollment.query()
      .where('protocol', protocol)
      .whereNull('deletedAt')
      .whereNot('status', EnrollmentStatuses.CANCELLED)
      .first()

    if (!enrollment)
      throw HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND')

    return next()
  }
}
