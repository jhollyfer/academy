import User from '#models/user'
import InviteService from '#services/invite.service'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import string from '@adonisjs/core/helpers/string'
import { ActiveStatuses } from '#core/entity'
import type { AdministratorUserCreatePayload } from '#core/validator'

type Payload = AdministratorUserCreatePayload
type Response = Either<HTTPException, User>

/**
 * Cria uma conta pelo painel.
 *
 * Dois caminhos, decididos pela presença de `password`:
 *
 * - **Com senha**: a conta nasce pronta e a secretaria informa a credencial.
 *   Serve para a própria equipe, onde a entrega é presencial.
 * - **Sem senha**: nasce um convite, e quem define é o titular pelo link. É o
 *   único caminho aceitável para responsável e aluno - a secretaria não deve
 *   escolher nem conhecer a senha de uma família.
 *
 * Sem senha a coluna não fica vazia: recebe um valor aleatório que ninguém
 * conhece. Uma coluna `notNullable` precisa de algo, e string vazia hasheada
 * seria uma senha real, que alguém adivinharia.
 */
@inject()
export default class UserCreateUseCase {
  constructor(private readonly invite: InviteService) {}

  async execute(payload: Payload): Promise<Response> {
    try {
      const email = payload.email.toLowerCase()

      const existing = await User.query().where('email', email).first()

      if (existing?.deletedAt) {
        // `email` é UNIQUE global e a remoção é lógica: recriar esbarraria no
        // índice. Reativa a linha, preservando `id` - e com ele os vínculos de
        // guarda e as matrículas que apontam para cá.
        existing.merge({
          ...payload,
          email,
          password: payload.password ?? string.random(32),
          deletedAt: null,
          status: payload.status ?? ActiveStatuses.ACTIVE,
        })
        await existing.save()

        if (!payload.password) await this.invite.issue(existing)

        return right(existing)
      }

      if (existing)
        return left(
          HTTPException.Conflict('Usuário já existe', 'USER_ALREADY_EXISTS', {
            email: 'Já existe uma conta com este e-mail',
          })
        )

      const user = await User.create({
        ...payload,
        email,
        password: payload.password ?? string.random(32),
        status: payload.status ?? ActiveStatuses.ACTIVE,
      })

      // Depois do `create`: o convite grava `invited_at` na linha, e precisa
      // dela existindo. A falha do envio não derruba a criação - ver o service.
      if (!payload.password) await this.invite.issue(user)

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'USER_CREATE_ERROR')
      )
    }
  }
}
