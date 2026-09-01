import CourseFaq from '#models/course_faq'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { Paginated } from '#core/entity'
import type { ModelObject } from '@adonisjs/lucid/types/model'
import type { PaginationPayload } from '#core/validator'

type Payload = PaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

/**
 * O FAQ da escola, o que a home mostra.
 *
 * `courseId` nulo é o recorte inteiro: pergunta com curso é do curso, e a
 * página dele já a carrega pela relação. Sem este endpoint as perguntas gerais
 * existiam no banco e não tinham por onde sair - `faqs` é `hasMany` por
 * `courseId`, então linha com `courseId` nulo não pertence a curso nenhum e
 * nenhuma relação a alcança.
 *
 * Pagina como toda listagem, mesmo sendo menos de dez perguntas: o formato da
 * resposta é o mesmo de `/storefront/courses`, e quem consome não precisa
 * lembrar qual endpoint devolve envelope e qual devolve array solto.
 */
@inject()
export default class StorefrontFaqPaginateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const faqs = await CourseFaq.query()
        .whereNull('courseId')
        // A ordem é decisão de quem escreveu o FAQ: a pergunta que mais chega
        // no WhatsApp vem primeiro.
        .orderBy('position', 'asc')
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({
        meta: faqs.getMeta(),
        // `courseId` fica de fora: é sempre nulo neste recorte, e mandá-lo
        // convidaria a tela a filtrar de novo o que a consulta já filtrou.
        data: faqs
          .all()
          .map((faq) =>
            faq.serialize({ fields: { pick: ['id', 'position', 'question', 'answer'] } })
          ),
      })
    } catch (error) {
      logger.error({ err: error }, '[storefront > faqs > list][error]')

      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'STOREFRONT_FAQ_LIST_ERROR')
      )
    }
  }
}
