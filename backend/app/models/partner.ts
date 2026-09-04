import { PartnerSchema } from '#database/schema'
import Storage from '#models/storage'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ActiveStatus } from '#core/entity'

/**
 * Uma instituição que sustenta a escola - hoje o CETI, onde as aulas acontecem,
 * e a FAMETRO, onde a inscrição presencial é feita.
 *
 * Existe como recurso próprio, e não como constante no frontend, porque é a
 * prova de credibilidade de uma escola que ainda não formou turma: sem aluno
 * formado não há depoimento nem número, e quem responde pela escola é o que
 * sobra para mostrar. Isso muda mais vezes que uma folha de estilo, e quem
 * atualiza é a secretaria.
 *
 * Sem `slug`: parceiro não tem página própria. A identidade é o `name`, e é por
 * ele que a criação decide entre ressuscitar uma linha arquivada e recusar uma
 * duplicata viva - o mesmo desenho de `Course`, com o nome no lugar do endereço.
 */
export default class Partner extends PartnerSchema {
  @column()
  declare status: ActiveStatus

  // Relação declarada à mão: `database/schema.ts` é gerado a partir das colunas
  // e não conhece relacionamentos.
  @belongsTo(() => Storage, { foreignKey: 'logoId' })
  declare logo: BelongsTo<typeof Storage>
}
