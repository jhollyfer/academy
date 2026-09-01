import User from '#models/user'
import { UserRoles } from '#core/entity'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const email = 'administrator@mail.com'

    // `updateOrCreate(searchPayload, savePayload)`: o primeiro argumento é só a
    // chave de busca. Passar `password` nele nunca casa, porque a coluna guarda
    // o hash - e o registro nasceria sem `name` nem `password`, que são
    // `notNullable`.
    // O dono nasce exclusivamente aqui: nenhum endpoint cria nem promove para
    // `OWNER`. É ele que cadastra os administradores da secretaria.
    await User.updateOrCreate(
      { email },
      { name: 'Administrator', email, password: 'Administrator1!', role: UserRoles.OWNER }
    )
  }
}
