import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class LessonQuizQuestionsController {
  /**
   * @handle
   * @tag Quiz
   * @summary Questões de quiz de uma aula específica
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @paramPath lessonSlug - Slug da aula - @type(string) @required
   * @responseBody 200 - {"questionCount": 3, "questions": [{"lessonTitulo": "Variáveis", "lessonDescricao": "Aprenda variáveis", "lessonModulo": "Módulo 1", "pergunta": "O que é?", "opcoes": ["A", "B", "C", "D"], "correta": 0, "explicacao": "Porque...", "explicacaoErrada": "Errado porque..."}]}
   * @responseBody 404 - {"message": "Aula não encontrada."}
   */
  async handle({ params, response }: HttpContext) {
    const questions = contentService.getLessonQuizQuestions(params.courseSlug, params.lessonSlug)

    if (!questions) {
      return response.notFound({ message: 'Aula não encontrada.' })
    }

    return response.ok({
      questionCount: questions.length,
      questions,
    })
  }
}
