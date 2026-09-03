import db from '@adonisjs/lucid/services/db'
import type Enrollment from '#models/enrollment'
import type User from '#models/user'
import { UserRoles } from '#core/entity'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

/**
 * O recorte de "o que é meu" no portal.
 *
 * É a peça que decide o que responsável e aluno enxergam, e ela existe separada
 * do use-case porque as duas rotas do portal - a lista e o detalhe - precisam
 * **exatamente** do mesmo filtro. Duplicá-lo seria criar a chance de a lista
 * esconder o que o detalhe entrega.
 *
 * `STUDENT` vê a matrícula que aponta para a conta dele. `RESPONSIBLE` vê duas
 * coisas somadas: a matrícula em que ele é o responsável registrado - o caso do
 * aluno menor de 18, que não tem conta -, e a dos dependentes que o vínculo de
 * guarda liga a ele.
 *
 * Quem não é nenhum dos dois não vê nada. Um administrador que abrisse o portal
 * receberia lista vazia em vez de tudo, o que é o default certo para um recorte
 * de propriedade: o painel dele é outro.
 */
export function scopeEnrollmentsTo(
  query: ModelQueryBuilderContract<typeof Enrollment>,
  user: User
): void {
  if (user.role === UserRoles.STUDENT) {
    query.where('studentId', user.id)
    return
  }

  if (user.role === UserRoles.RESPONSIBLE) {
    query.where(function (scope) {
      scope
        .where('responsibleId', user.id)
        // Subconsulta na pivô, e não `whereHas('dependents')`: a relação é uma
        // auto-relação, e os dois lados apontam para `users` - o `whereHas`
        // qualifica a condição com o mesmo alias da tabela externa, casa o
        // responsável consigo mesmo, e o resultado é sempre vazio.
        .orWhereIn(
          'studentId',
          db.from('guardianships').select('student_id').where('responsible_id', user.id)
        )
    })
    return
  }

  // `whereRaw('1 = 0')` e não um `return` seco: sem cláusula nenhuma a consulta
  // devolveria a base inteira, e um papel novo que caísse aqui por esquecimento
  // vazaria tudo em vez de nada.
  query.whereRaw('1 = 0')
}
