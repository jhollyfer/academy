import Class from '#models/class'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Class>

/**
 * Envia para a lixeira. Turma já arquivada é indistinguível de inexistente
 * (404), porque o filtro é o mesmo que toda leitura aplica.
 *
 * As matrículas ficam. Elas apontam para a turma por `RESTRICT`, e arquivar é
 * remoção lógica - o candidato não perde o pedido porque a secretaria tirou a
 * turma da tela.
 */
@inject()
export default class ClassArchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const entity = await Class.query().where('id', payload.id).whereNull('deletedAt').first()

      if (!entity) return left(HTTPException.NotFound('Turma não encontrada', 'CLASS_NOT_FOUND'))

      entity.deletedAt = DateTime.now()
      await entity.save()

      return right(entity)
    } catch (error) {
      logger.error({ err: error }, '[classes > archive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_ARCHIVE_ERROR')
      )
    }
  }
}
