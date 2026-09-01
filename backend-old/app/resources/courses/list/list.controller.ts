import type { HttpContext } from '@adonisjs/core/http'
import contentService from '#services/content_service'

export default class ListCoursesController {
  /**
   * @handle
   * @tag Courses
   * @summary Lista todos os cursos disponíveis
   * @responseBody 200 - {"courses": [{"slug": "logica-programacao-typescript", "label": "Lógica de Programação", "language": "TypeScript", "lessonCount": 10, "moduleCount": 3}]}
   */
  async handle({ response }: HttpContext) {
    const courses = contentService.getCourses()
    return response.ok({ courses })
  }
}
