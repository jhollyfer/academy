import AccountInvite from '#models/account_invite'
import { ActiveStatuses } from '#core/entity'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { hashInviteToken } from '#services/invite.service'

/**
 * Resolver um token de convite no convite que ele representa.
 *
 * Fica em `features/_shared.*` e não em `app/services/`: é consulta e
 * invariante, sem dependência externa - a mesma linha de corte que o
 * `_shared.seats.ts` explica. O `invite.service.ts` continua do outro lado
 * porque fala com o SMTP.
 *
 * Existe compartilhado porque as duas pontas do fluxo fazem exatamente esta
 * pergunta: a tela pergunta antes de desenhar o formulário, e o `POST` pergunta
 * de novo antes de gravar. Duplicar a regra é deixar as duas divergirem, e a que
 * importa é a segunda.
 *
 * A busca é direta pelo `token_hash` porque o hash é determinístico
 * (`hashInviteToken`) - ver o porquê no JSDoc daquela função.
 */
export async function resolveInvite(token: string): Promise<Either<HTTPException, AccountInvite>> {
  const invite = await AccountInvite.query()
    .where('tokenHash', hashInviteToken(token))
    .preload('user')
    .first()

  // Token que não existe e token de outro formato dão na mesma resposta: quem
  // chegou aqui com um link quebrado precisa pedir outro, e não saber por quê.
  if (!invite) {
    return left(
      HTTPException.NotFound('Convite não encontrado', 'INVITE_NOT_FOUND', {
        root: 'Este link de convite não é válido. Peça um novo à secretaria',
      })
    )
  }

  // Consumido e expirado são separados de propósito - ver `AccountInvite.isUsable`.
  // Só o primeiro justifica dizer "já foi ativada" em vez de mandar pedir outro.
  if (invite.consumedAt) {
    return left(
      HTTPException.Conflict('Convite já utilizado', 'INVITE_ALREADY_USED', {
        root: 'Esta conta já foi ativada. Entre com seu e-mail e senha',
      })
    )
  }

  if (!invite.isUsable) {
    return left(
      HTTPException.Conflict('Convite expirado', 'INVITE_EXPIRED', {
        root: 'Este link expirou. Peça um novo à secretaria',
      })
    )
  }

  // Convite válido de conta desativada não abre porta: o guard recusaria a
  // sessão logo depois, e definir uma senha que não entra é pior que recusar.
  if (invite.user.deletedAt || invite.user.status === ActiveStatuses.INACTIVE) {
    return left(
      HTTPException.Conflict('Conta indisponível', 'INVITE_ACCOUNT_UNAVAILABLE', {
        root: 'Esta conta não está disponível. Procure a secretaria',
      })
    )
  }

  return right(invite)
}
