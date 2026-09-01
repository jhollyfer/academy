import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import SlugService from '#services/slug.service'
import { saveWithSyllabus } from '#features/_shared.syllabus'
import type { Merge } from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorCourseUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorCourseUpdatePayload, IdentifierPayload>
type Response = Either<HTTPException, Course>

@inject()
export default class CourseUpdateUseCase {
  constructor(private readonly slug: SlugService) {}

  async execute({ id, modules, faqs, ...payload }: Payload): Promise<Response> {
    try {
      const course = await Course.query().where('id', id).whereNull('deletedAt').first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      // O slug enviado vence o derivado do nome, e os dois passam pelo mesmo
      // `normalize`. Reenviar o valor que já está gravado não conta como troca.
      const { slug: providedSlug, ...rest } = payload
      const slugSource = providedSlug ?? payload.name

      if (slugSource) {
        const slug = this.slug.normalize(slugSource)

        if (slug !== course.slug) {
          const exist = await Course.query().where('slug', slug).whereNot('id', id).first()

          if (exist)
            return left(
              HTTPException.Conflict('Curso já existe', 'COURSE_ALREADY_EXISTS', {
                // A busca é por slug, mas o slug pode ter saído do nome. Marcar
                // o campo que a pessoa não preencheu põe o erro sob um input
                // vazio, e quem digitou só o nome não vê o que corrigir.
                [providedSlug ? 'slug' : 'name']: 'Já existe um curso com este endereço',
              })
            )

          course.slug = slug
        }
      }

      // `rest` em vez de `payload`: o slug já foi normalizado acima e o merge
      // regravaria o valor cru por cima.
      course.merge(rest)

      // O curso, a grade e o FAQ numa transação só: uma falha no meio deixaria
      // o curso salvo e a ementa na versão anterior, e a página pública
      // mostraria as duas metades de edições diferentes.
      await saveWithSyllabus(course, modules, faqs)
      await course.load('modules', (query) => query.orderBy('position', 'asc'))
      await course.load('faqs', (query) => query.orderBy('position', 'asc'))

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[courses > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_UPDATE_ERROR')
      )
    }
  }
}
