import User from '#models/user'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge, TrashedModes, UserRoles, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorUserPaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = Merge<AdministratorUserPaginationPayload, { actor: User }>
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class UserListUseCase {
  async execute({ actor, ...payload }: Payload): Promise<Response> {
    try {
      const query = User.query().preload('avatar')

      // O dono não aparece para o operador.
      //
      // Filtrar aqui, e não só recusar no `show`, é o que impede o 403 de
      // acontecer por acidente: quem não pode vê-lo também não o encontra numa
      // busca por e-mail. A `UserPolicy` continua sendo a barreira de quem
      // montar a URL à mão.
      if (actor.role !== UserRoles.OWNER) query.whereNot('role', UserRoles.OWNER)

      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.role) query.where('role', payload.role)
      if (payload.status) query.where('status', payload.status)

      // Nome e e-mail juntos: a secretaria procura pelos dois, e obrigar a
      // escolher qual campo seria um filtro a mais na tela para nada.
      if (payload.search) {
        const term = `%${payload.search}%`
        query.where(function (scope) {
          scope.whereILike('name', term).orWhereILike('email', term)
        })
      }

      const users = await query
        .orderBy(...sortOrder(payload, 'name'))
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: users.getMeta(), data: users.all() })
    } catch (error) {
      logger.error({ err: error }, '[users > list][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'USER_LIST_ERROR'))
    }
  }
}
