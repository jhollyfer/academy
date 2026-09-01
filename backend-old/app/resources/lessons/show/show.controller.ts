import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class ShowLessonController {
  /**
   * @handle
   * @tag Lessons
   * @summary Detalhes de uma aula específica
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @paramPath lessonSlug - Slug da aula - @type(string) @required
   * @responseBody 200 - {"lesson": {"slug": "variaveis", "modulo": "Módulo 1", "titulo": "Variáveis", "subtitulo": "", "descricao": "Aprenda sobre variáveis", "ordem": 1, "content": "# Conteúdo em Markdown", "quiz": [{"pergunta": "O que é uma variável?", "opcoes": ["A", "B", "C", "D"], "correta": 0, "explicacao": "Explicação", "explicacaoErrada": "Explicação do erro"}], "proximosPassos": [{"titulo": "Próximo passo", "descricao": "Descrição"}]}}
   * @responseBody 404 - {"message": "Aula não encontrada."}
   */
  async handle({ params, response }: HttpContext) {
    const lesson = contentService.getLesson(params.courseSlug, params.lessonSlug)

    if (!lesson) {
      return response.notFound({ message: 'Aula não encontrada.' })
    }

    return response.ok({ lesson })
  }
}
