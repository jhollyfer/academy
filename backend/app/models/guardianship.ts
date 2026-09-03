import { GuardianshipSchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * O vínculo entre um responsável e um dependente.
 *
 * Existe como model, e não só como tabela pivô do `@manyToMany` em `User`,
 * porque a secretaria precisa listar e auditar os vínculos - quem ligou quem, e
 * quando. Uma pivô anônima resolveria a navegação e não responderia isso.
 */
export default class Guardianship extends GuardianshipSchema {
  // Relações declaradas à mão: `database/schema.ts` é gerado a partir das
  // colunas e não conhece relacionamentos.
  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof User>
}
