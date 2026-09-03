import type User from '#models/user'
import { UserRoles } from '#core/entity'
import { BasePolicy } from '@adonisjs/bouncer'

/**
 * Quem pode mexer em qual usuário.
 *
 * Isto é a metade que o `RoleMiddleware` não consegue expressar. Ele olha só o
 * papel de **quem chama**, e as duas regras aqui dependem de **quem é o alvo**:
 * um administrador pode editar usuário, mas não *aquele* usuário. Regra por
 * registro mora em policy, uma vez, e não num `if` repetido em cada use-case.
 *
 * A rota continua sendo a primeira barreira - `role(STAFF_USER_ROLES)` já barra
 * responsável e estudante antes de chegar aqui. A policy é a segunda, e existe
 * porque a primeira não sabe distinguir dois usuários do mesmo papel.
 */
export default class UserPolicy extends BasePolicy {
  /**
   * O dono é invisível para o operador.
   *
   * Não é só estética de listagem: sem isto o administrador vê o e-mail do dono
   * numa busca e passa a ter metade de uma credencial. A lista de usuários filtra
   * por este mesmo critério, então não há como chegar no 403 por acidente - ele
   * só aparece para quem montou a URL à mão.
   */
  view(actor: User, target: User): boolean {
    if (actor.role === UserRoles.OWNER) return true
    return target.role !== UserRoles.OWNER
  }

  /**
   * Editar segue o mesmo corte, com uma exceção somada: **ninguém muda o próprio
   * cadastro por aqui**.
   *
   * Não é para proteger o dado, é para fechar a auto-promoção. O validator já
   * recusa `OWNER` no payload, mas ele não sabe quem está chamando - um
   * administrador enviando o próprio `id` com `role: ADMINISTRATOR` passaria pelo
   * validator sem ter mudado nada, e o mesmo caminho com outro valor não passaria
   * por acaso, e sim porque a lista foi filtrada. Duas camadas porque a falha de
   * qualquer uma delas é silenciosa.
   *
   * O perfil próprio se edita em `/account`, que é outro caminho e não aceita
   * `role`.
   */
  update(actor: User, target: User): boolean {
    if (actor.id === target.id) return false
    if (actor.role === UserRoles.OWNER) return true
    return target.role !== UserRoles.OWNER
  }

  /**
   * Arquivar e restaurar acompanham `update`: é mudança de estado do mesmo
   * registro, e desativar a própria conta é o caminho mais curto para se trancar
   * do lado de fora.
   */
  archive(actor: User, target: User): boolean {
    return this.update(actor, target)
  }

  /**
   * Apagar de vez é só do dono - a mesma linha que já vale para curso, turma e
   * matrícula. A rota também exige `role(['OWNER'])`; aqui é o cinto do
   * suspensório, e o que impede um use-case novo de esquecer o middleware.
   */
  delete(actor: User, target: User): boolean {
    if (actor.role !== UserRoles.OWNER) return false
    return actor.id !== target.id
  }

  /**
   * Ligar e desligar responsável de dependente. Mesmo corte de `update`, porque
   * criar um vínculo é conceder acesso aos dados de outra pessoa.
   */
  manageGuardianship(actor: User, target: User): boolean {
    return this.update(actor, target)
  }
}
