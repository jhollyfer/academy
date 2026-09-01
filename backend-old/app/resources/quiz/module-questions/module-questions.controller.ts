import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class ModuleQuizQuestionsController {
  /**
   * @handle
   * @tag Quiz
   * @summary Questões de quiz de um módulo específico
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @paramPath moduleName - Nome do módulo (URL encoded) - @type(string) @required
   * @responseBody 200 - {"questionCount": 5, "questions": [{"lessonTitulo": "Variáveis", "lessonDescricao": "Aprenda variáveis", "lessonModulo": "Módulo 1", "pergunta": "O que é?", "opcoes": ["A", "B", "C", "D"], "correta": 0, "explicacao": "Porque...", "explicacaoErrada": "Errado porque..."}]}
   * @responseBody 404 - {"message": "Módulo não encontrado."}
   */
  async handle({ params, response }: HttpContext) {
    const moduleName = decodeURIComponent(params.moduleName)
    const questions = contentService.getModuleQuizQuestions(params.courseSlug, moduleName)

    if (!questions) {
      return response.notFound({ message: 'Módulo não encontrado.' })
    }

    return response.ok({
      questionCount: questions.length,
      questions,
    })
  }
}
