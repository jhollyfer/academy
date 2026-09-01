import { EnrollmentFileSchema } from '#database/schema'
import Enrollment from '#models/enrollment'
import Storage from '#models/storage'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { EnrollmentFileKind } from '#core/entity'

/**
 * O vínculo entre uma matrícula e um arquivo enviado - o comprovante do Pix, na
 * prática. Tabela própria e não coluna em `enrollments` porque o candidato pode
 * reenviar depois de a secretaria recusar o primeiro, e o histórico importa numa
 * conferência manual.
 */
export default class EnrollmentFile extends EnrollmentFileSchema {
  @column()
  declare kind: EnrollmentFileKind

  @belongsTo(() => Enrollment)
  declare enrollment: BelongsTo<typeof Enrollment>

  @belongsTo(() => Storage)
  declare storage: BelongsTo<typeof Storage>
}
