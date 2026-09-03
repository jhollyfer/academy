import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge, UserRoles } from '#core/entity'
import type { AdministratorGuardianshipPayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorGuardianshipPayload, Merge<IdentifierPayload, { actor: User }>>
type Response = Either<HTTPException, User>

/**
 * Liga um dependente a um responsável.
 *
 * Conceder este vínculo é conceder leitura sobre os dados de outra pessoa, então
 * as duas pontas são conferidas: papel certo dos dois lados, e a policy sobre o
 * responsável. Um `attach` sem essas checagens transformaria qualquer par de
 * uuids numa autorização.
 */
@inject()
export default class GuardianshipAttachUseCase {
  async execute({ actor, id, studentId }: Payload): Promise<Response> {
    try {
      const responsible = await User.query().where('id', id).whereNull('deletedAt').first()

      if (!responsible)
        return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      if (!new UserPolicy().manageGuardianship(actor, responsible))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      if (responsible.role !== UserRoles.RESPONSIBLE)
        return left(
          HTTPException.UnprocessableEntity('Papel inválido', 'INVALID_ROLE', {
            id: 'Só um responsável pode ter dependentes',
          })
        )

      const student = await User.query().where('id', studentId).whereNull('deletedAt').first()

      if (!student)
        return left(
          HTTPException.UnprocessableEntity('Dependente inválido', 'INVALID_DEPENDENT', {
            studentId: 'Aluno não encontrado',
          })
        )

      if (student.role !== UserRoles.STUDENT)
        return left(
          HTTPException.UnprocessableEntity('Papel inválido', 'INVALID_ROLE', {
            studentId: 'O dependente precisa ser um aluno',
          })
        )

      // Barrado pelos papéis acima - ninguém é responsável e aluno na mesma
      // linha -, mas a checagem fica porque é ela que expressa a intenção: um
      // vínculo consigo mesmo é um ciclo, não um caso de borda de papel.
      if (responsible.id === student.id)
        return left(
          HTTPException.UnprocessableEntity('Dependente inválido', 'INVALID_DEPENDENT', {
            studentId: 'Um usuário não pode ser dependente de si mesmo',
          })
        )

      // `attach` e não `sync`: a chamada liga um dependente, e `sync` desligaria
      // todos os outros. O par é UNIQUE, então ligar duas vezes estouraria o
      // índice - daí a checagem antes.
      const linked = await responsible
        .related('dependents')
        .query()
        .where('users.id', student.id)
        .first()

      if (!linked) await responsible.related('dependents').attach([student.id])

      await responsible.load('dependents')

      return right(responsible)
    } catch (error) {
      logger.error({ err: error }, '[users > guardianship > attach][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'GUARDIANSHIP_ATTACH_ERROR')
      )
    }
  }
}
