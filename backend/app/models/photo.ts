import { PhotoSchema } from '#database/schema'
import Storage from '#models/storage'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ActiveStatus } from '#core/entity'

/**
 * Uma foto da escola: a sala, a bancada, o kit, a turma.
 *
 * Existe porque a vitrine é inteiramente ilustrada, e ilustração não prova que
 * o lugar existe. Enquanto não há aluno formado, a foto do espaço é a prova
 * mais direta que a escola tem para oferecer a quem nunca ouviu falar dela.
 *
 * O acervo ainda não existe, e a feature nasce assim de propósito: quando as
 * fotos chegarem, elas sobem pelo painel e aparecem no site sem deploy nenhum.
 * A seção some inteira enquanto a galeria estiver vazia.
 */
export default class Photo extends PhotoSchema {
  @column()
  declare status: ActiveStatus

  @belongsTo(() => Storage, { foreignKey: 'imageId' })
  declare image: BelongsTo<typeof Storage>
}
