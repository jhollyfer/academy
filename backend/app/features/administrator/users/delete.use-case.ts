import User from '#models/user'
import Enrollment from '#models/enrollment'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge } from '#core/entity'
import type { IdentifierPayload } from '#core/validator'

type Payload = Merge<IdentifierPayload, { actor: User }>
type Response = Either<HTTPException, User>

/**
 * Apaga a linha de vez. Só aceita usuário já arquivado - a passagem pela lixeira
 * é o que impede um clique de perder o registro sem escala intermediária.
 *
 * O vínculo de guarda e os tokens de acesso vão junto por `CASCADE`. As
 * matrículas **não**: `enrollments.student_id` é `SET NULL`, e o pedido continua
 * existindo com os dados declarados no ato. Matrícula é registro contábil e de
 * consentimento, e apagar a conta não pode apagá-la.
 */
@inject()
export default class UserDeleteUseCase {
  async execute({ actor, id }: Payload): Promise<Response> {
    try {
      const user = await User.query().where('id', id).first()

      if (!user) return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      if (!new UserPolicy().delete(actor, user))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      if (!user.deletedAt)
        return left(
          HTTPException.Conflict('Usuário não está arquivado', 'USER_NOT_ARCHIVED', {
            id: 'Arquive o usuário antes de apagá-lo',
          })
        )

      // Aviso, não impedimento: a chave é `SET NULL` e o banco aceitaria. O que
      // não dá para desfazer é a ligação entre a matrícula e a pessoa, então a
      // recusa força a decisão a ser consciente - desvincular antes, se for
      // mesmo o caso.
      const enrollments = await Enrollment.query().where('studentId', user.id).count('* as total')

      if (Number(enrollments[0].$extras.total) > 0)
        return left(
          HTTPException.Conflict('Usuário possui matrículas', 'USER_HAS_ENROLLMENTS', {
            id: 'Este usuário está vinculado a matrículas; desvincule antes de apagá-lo',
          })
        )

      await user.delete()

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'USER_DELETE_ERROR')
      )
    }
  }
}
