import { CourseModuleSchema } from '#database/schema'
import Course from '#models/course'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Um encontro da grade - o "sábado 3" do curso. A ordem vem de `position`, não
 * de `createdAt`: a grade é reordenada, e a data de cadastro não descreve o
 * programa.
 */
export default class CourseModule extends CourseModuleSchema {
  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>
}
