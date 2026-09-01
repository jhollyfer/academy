import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class QuizQuestionsController {
  /**
   * @handle
   * @tag Quiz
   * @summary Todas as questões de quiz de um curso
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @responseBody 200 - {"questionCount": 15, "questions": [{"lessonTitulo": "Variáveis", "lessonDescricao": "Aprenda variáveis", "lessonModulo": "Módulo 1", "pergunta": "O que é?", "opcoes": ["A", "B", "C", "D"], "correta": 0, "explicacao": "Porque...", "explicacaoErrada": "Errado porque..."}]}
   * @responseBody 404 - {"message": "Curso não encontrado."}
   */
  async handle({ params, response }: HttpContext) {
    const questions = contentService.getQuizQuestions(params.courseSlug, true)

    if (!questions) {
      return response.notFound({ message: 'Curso não encontrado.' })
    }

    return response.ok({
      questionCount: questions.length,
      questions,
    })
  }
}
