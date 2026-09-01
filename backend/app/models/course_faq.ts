import { CourseFaqSchema } from '#database/schema'
import Course from '#models/course'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Uma pergunta frequente. Com `courseId` nulo é o FAQ da home, o que vale para a
 * escola inteira; preenchido é o FAQ daquele curso.
 */
export default class CourseFaq extends CourseFaqSchema {
  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>
}
