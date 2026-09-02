import env from '#start/env'
import User from '#models/user'
import { UserRoles } from '#core/entity'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const email = env.get('SEED_OWNER_EMAIL') ?? 'administrator@mail.com'
    const password = env.get('SEED_OWNER_PASSWORD')

    /*
     * Sem senha o seeder para, e não inventa uma.
     *
     * Ela era literal aqui, e o repositório é o lugar errado para uma
     * credencial: quem lesse este arquivo entrava como dono em todo ambiente
     * que tivesse rodado o seeder - inclusive o de produção. Um default,
     * mesmo "temporário", volta a ser exatamente isso.
     *
     * Falhar aqui é seguro porque seeder roda à mão: a aplicação sobe sem esta
     * variável, e só quem semeia precisa dela.
     */
    if (!password) {
      throw new Error(
        'SEED_OWNER_PASSWORD ausente. Defina uma senha no ambiente antes de rodar o seeder: ' +
          'SEED_OWNER_PASSWORD=<senha> node ace db:seed'
      )
    }

    // `updateOrCreate(searchPayload, savePayload)`: o primeiro argumento é só a
    // chave de busca. Passar `password` nele nunca casa, porque a coluna guarda
    // o hash - e o registro nasceria sem `name` nem `password`, que são
    // `notNullable`.
    // O dono nasce exclusivamente aqui: nenhum endpoint cria nem promove para
    // `OWNER`. É ele que cadastra os administradores da secretaria.
    await User.updateOrCreate(
      { email },
      { name: 'Administrator', email, password, role: UserRoles.OWNER }
    )
  }
}
