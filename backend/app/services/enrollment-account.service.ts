import User from '#models/user'
import InviteService from '#services/invite.service'
import type Enrollment from '#models/enrollment'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import string from '@adonisjs/core/helpers/string'
import { ActiveStatuses, UserRoles } from '#core/entity'

/**
 * Transforma uma matrícula confirmada em acesso.
 *
 * **Quem recebe a conta depende da idade na data do envio**, que é o mesmo
 * critério que já decide se o responsável legal é obrigatório:
 *
 * - **Maior de 18**: a conta é do próprio aluno (`STUDENT`).
 * - **Menor de 18**: a conta é do responsável (`RESPONSIBLE`), e o aluno não
 *   recebe login. O formulário público coleta um e-mail só, e num cadastro de
 *   menor esse e-mail é do adulto que preencheu - criar a conta em nome da
 *   criança com o endereço do pai seria registrar a pessoa errada.
 *
 * Por isso `enrollments` tem as duas colunas: a matrícula aponta para a conta
 * que existe, e é ela que o portal usa para responder "o que é meu".
 *
 * Idempotente: rodar de novo sobre uma matrícula que já tem conta não cria
 * segunda nem reenvia convite. Confirmar duas vezes é um clique repetido, não um
 * pedido de novo acesso.
 */
@inject()
export default class EnrollmentAccountService {
  constructor(private readonly invite: InviteService) {}

  async ensureFor(enrollment: Enrollment): Promise<void> {
    try {
      if (enrollment.studentId || enrollment.responsibleId) return

      const guardian = enrollment.requiresGuardian
      const role = guardian ? UserRoles.RESPONSIBLE : UserRoles.STUDENT
      const name = guardian
        ? (enrollment.guardianName ?? enrollment.studentName)
        : enrollment.studentName
      const email = enrollment.email.toLowerCase()

      // Reusa a conta quando o e-mail já existe: é o caso do segundo filho, e
      // do aluno que voltou para outro curso. Criar de novo estouraria o índice
      // único, e o papel de quem já está cadastrado não é rebaixado aqui - um
      // administrador que se matricula continua administrador.
      const existing = await User.query().where('email', email).first()

      const user =
        existing ??
        (await User.create({
          name,
          email,
          phone: guardian ? (enrollment.guardianPhone ?? enrollment.phone) : enrollment.phone,
          // Aleatória e descartada: a coluna é `notNullable`, e quem define a
          // senha de verdade é o titular, pelo link do convite.
          password: string.random(32),
          role,
          status: ActiveStatuses.ACTIVE,
        }))

      if (guardian) enrollment.responsibleId = user.id
      else enrollment.studentId = user.id

      await enrollment.save()

      // Convite só para conta nova. Quem já tinha acesso não precisa de link
      // para definir uma senha que já existe - e receber esse e-mail passaria a
      // impressão de que a senha antiga foi perdida.
      if (!existing) await this.invite.issue(user)
    } catch (error) {
      // Engolido como no `notification.service.ts`: a confirmação da matrícula
      // já aconteceu e é o que a secretaria precisa que valha. Uma conta não
      // criada é recuperável pelo painel; uma confirmação recusada porque o
      // e-mail falhou manda a secretaria repetir o trabalho.
      logger.error({ err: error, enrollmentId: enrollment.id }, '[enrollment > account][error]')
    }
  }
}
