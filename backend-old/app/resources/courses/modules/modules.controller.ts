import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class ListModulesController {
  /**
   * @handle
   * @tag Modules
   * @summary Lista módulos de um curso
   * @paramPath courseSlug - Slug do curso - @type(string) @required
   * @responseBody 200 - {"modules": [{"name": "Módulo 1 — Fundamentos", "lessonCount": 5, "questionCount": 12}]}
   * @responseBody 404 - {"message": "Curso não encontrado."}
   */
  async handle({ params, response }: HttpContext) {
    const modules = contentService.getModules(params.courseSlug)
    if (!modules) return response.notFound({ message: 'Curso não encontrado.' })
    return response.ok({ modules })
  }
}
