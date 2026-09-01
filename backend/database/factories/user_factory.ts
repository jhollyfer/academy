import User from '#models/user'
import { ActiveStatuses, UserRoles } from '#core/entity'
import factory from '@adonisjs/lucid/factories'

/**
 * A senha de todo usuário criado por factory.
 *
 * Passa na política de `password()` (`#core/validator`) - minúscula, maiúscula,
 * dígito e símbolo -, então serve para entrar de verdade pelo
 * `POST /authentication/sign-in`, que é como os testes abrem sessão.
 *
 * Vai em texto puro: o mixin `withAuthFinder` de `app/models/user.ts` cifra ao
 * salvar. Passar o hash aqui geraria um hash de hash, e nenhum login funcionaria.
 */
export const FACTORY_PASSWORD = 'Demo1234!'

/**
 * Usuário do painel.
 *
 * O papel default é `ADMINISTRATOR`, o menos privilegiado dos dois: um teste que
 * precisa do dono pede o estado em voz alta, e nenhum ganha o direito de apagar
 * por esquecimento.
 *
 * Existe porque o `user_seeder` cria uma conta só, a do dono - e sem uma segunda
 * conta não há o outro lado de nenhuma asserção de permissão. A matriz de papel
 * (`start/routes.ts`: administrador arquiva, só o dono apaga) não teria como ser
 * testada.
 */
export const UserFactory = factory
  .define(User, ({ faker }) => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: FACTORY_PASSWORD,
    role: UserRoles.ADMINISTRATOR,
    status: ActiveStatuses.ACTIVE,
  }))
  .state('owner', (user) => (user.role = UserRoles.OWNER))
  .state('inactive', (user) => (user.status = ActiveStatuses.INACTIVE))
  .build()
