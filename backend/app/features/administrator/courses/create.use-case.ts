import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import SlugService from '#services/slug.service'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorCourseCreatePayload } from '#core/validator'

type Payload = AdministratorCourseCreatePayload
type Response = Either<HTTPException, Course>

@inject()
export default class CourseCreateUseCase {
  constructor(private readonly slug: SlugService) {}

  async execute(payload: Payload): Promise<Response> {
    try {
      // O formulário tem input de slug. Quando vem preenchido ele vence, mas
      // passa pelo mesmo `normalize` - aceitar o valor cru deixaria a URL
      // pública quebrada.
      const slug = this.slug.normalize(payload.slug ?? payload.name)

      const course = await Course.query().where('slug', slug).first()

      if (course?.deletedAt) {
        // `slug` é UNIQUE global e a remoção é lógica: criar de novo esbarraria
        // no índice. Reativa a linha existente com os dados novos, preservando
        // `id` e `created_at` - e com eles a grade e o FAQ, que apontam para o
        // `id`.
        course.merge({ ...payload, slug, deletedAt: null })
        await course.save()
        return right(course)
      }

      if (course)
        return left(
          HTTPException.Conflict('Curso já existe', 'COURSE_ALREADY_EXISTS', {
            // A busca é por slug, mas o slug pode ter saído do nome. Marcar o
            // campo que a pessoa não preencheu põe o erro sob um input vazio, e
            // quem digitou só o nome não vê o que corrigir.
            [payload.slug ? 'slug' : 'name']: 'Já existe um curso com este endereço',
          })
        )

      const created = await Course.create({ ...payload, slug })

      // `status` e `position` são preenchidos por DEFAULT no banco, e o INSERT
      // do Lucid só devolve a chave primária - sem o refresh a resposta sairia
      // com eles indefinidos.
      await created.refresh()

      return right(created)
    } catch (error) {
      logger.error({ err: error }, '[courses > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_CREATE_ERROR')
      )
    }
  }
}
