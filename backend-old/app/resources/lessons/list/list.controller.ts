import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class ListLessonsController {
  /**
   * @handle
   * @tag Lessons
   * @summary Lista aulas de um curso
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @responseBody 200 - {"lessons": [{"slug": "variaveis", "modulo": "Módulo 1", "titulo": "Variáveis", "subtitulo": "", "descricao": "Aprenda sobre variáveis", "ordem": 1, "quizCount": 3}]}
   * @responseBody 404 - {"message": "Curso não encontrado."}
   */
  async handle({ params, response }: HttpContext) {
    const lessons = contentService.getLessons(params.courseSlug)

    if (!lessons) {
      return response.notFound({ message: 'Curso não encontrado.' })
    }

    return response.ok({
      lessons: lessons.map((l) => ({
        slug: l.slug,
        modulo: l.modulo,
        titulo: l.titulo,
        subtitulo: l.subtitulo,
        descricao: l.descricao,
        ordem: l.ordem,
        quizCount: l.quiz.length,
      })),
    })
  }
}
