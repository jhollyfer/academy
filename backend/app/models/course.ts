import { CourseSchema } from '#database/schema'
import Class from '#models/class'
import CourseFaq from '#models/course_faq'
import CourseModule from '#models/course_module'
import Storage from '#models/storage'
import { aggregate } from '#core/aggregate'
import { belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { ActiveStatus, CourseAccent } from '#core/entity'

/**
 * Um curso da escola. Hoje são dois - robótica e desenvolvimento web -, e o
 * fato de serem dois não está em lugar nenhum do código: entram pelo painel.
 */
export default class Course extends CourseSchema {
  @column()
  declare accent: CourseAccent

  @column()
  declare status: ActiveStatus

  // Relações declaradas à mão: `database/schema.ts` é gerado a partir das
  // colunas e não conhece relacionamentos.
  @hasMany(() => CourseModule)
  declare modules: HasMany<typeof CourseModule>

  @hasMany(() => CourseFaq)
  declare faqs: HasMany<typeof CourseFaq>

  @hasMany(() => Class)
  declare classes: HasMany<typeof Class>

  @belongsTo(() => Storage, { foreignKey: 'coverId' })
  declare cover: BelongsTo<typeof Storage>

  /**
   * Quantas turmas o curso tem. Sai do `withCount` da listagem do painel e some
   * da leitura de um item só, que não conta nada - é o que `aggregate()` faz ao
   * devolver `undefined`.
   *
   * Serve à tela de remoção: apagar curso com turma é 409, e o número aparece
   * antes de alguém tentar.
   */
  @computed()
  get classesCount(): number | undefined {
    return aggregate(this.$extras, 'classes_count')
  }

  /**
   * A próxima turma, para a página pública do curso.
   *
   * `@computed` e não relação carregada: `classes` é `hasMany`, e um `preload`
   * limitado a uma linha ainda devolveria um array. A landing mostra **uma**
   * turma, e um array de um item convidaria a tela a decidir qual é "a próxima"
   * - que é decisão do servidor, e está em `_shared.storefront.ts`.
   *
   * Some do JSON nas leituras que não a buscaram, como todo `@computed` que
   * devolve `undefined`. `null` é outra coisa: é "não há turma anunciada".
   */
  @computed()
  get nextClass(): Class | null | undefined {
    return this.$extras.nextClass
  }
}
