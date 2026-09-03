import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import string from '@adonisjs/core/helpers/string'
import { createHash } from 'node:crypto'
import { DateTime } from 'luxon'
import AccountInvite from '#models/account_invite'
import type User from '#models/user'

/**
 * O convite que transforma uma conta recém-criada em acesso de verdade.
 *
 * Existe para que a secretaria nunca escolha a senha de uma família. Ela cadastra
 * o responsável e o aluno; quem define a credencial é o titular, pelo link.
 *
 * Fica em `app/services/` e não em `features/_shared.*` pela mesma linha que o
 * `notification.service.ts`: fala com um servidor de fora.
 *
 * O envio usa `mail.sendLater()`, então ele atravessa a fila configurada em
 * `start/mail.ts` - sem Redis a fila é a de memória do próprio pacote, e com
 * Redis é a real. O service não sabe qual das duas está de pé, e é essa a
 * vantagem: trocar de fila não mexe aqui.
 */
export default class InviteService {
  /**
   * Quanto tempo o link vale.
   *
   * Sete dias porque o destinatário não está esperando o e-mail: ele chega
   * depois que a secretaria confirmou o Pix, que pode ser numa sexta à noite.
   * Prazo curto transforma convite em pedido de suporte.
   */
  static readonly EXPIRES_IN_DAYS = 7

  /**
   * Emite um convite e manda o e-mail.
   *
   * Devolve o token **cru**, e só aqui ele existe em texto: o banco guarda o
   * hash. Quem chamar não deve gravá-lo nem logá-lo - o retorno existe para o
   * teste conseguir montar o link sem ler a caixa de entrada.
   *
   * Convite aberto anterior é consumido antes de emitir o novo, senão dois links
   * válidos circulam ao mesmo tempo e revogar um não revoga o outro.
   */
  async issue(user: User): Promise<string | null> {
    try {
      await AccountInvite.query()
        .where('userId', user.id)
        .whereNull('consumedAt')
        .update({ consumedAt: DateTime.now() })

      // 64 hex: o token é a credencial inteira, e não há segundo fator nem
      // limite de tentativa por trás dele.
      const token = string.random(64)

      await AccountInvite.create({
        userId: user.id,
        tokenHash: hashInviteToken(token),
        expiresAt: DateTime.now().plus({ days: InviteService.EXPIRES_IN_DAYS }),
      })

      user.invitedAt = DateTime.now()
      await user.save()

      await this.#send(user, token)

      return token
    } catch (error) {
      // Engolido como no `notification.service.ts`: uma conta criada com convite
      // não enviado é recuperável pelo painel, que reenvia. Uma criação recusada
      // porque o SMTP caiu é trabalho refeito à mão.
      logger.error({ err: error, userId: user.id }, '[invite > issue][error]')
      return null
    }
  }

  async #send(user: User, token: string): Promise<void> {
    const appUrl = env.get('FRONTEND_URL')

    if (!appUrl || !env.get('SMTP_HOST')) {
      logger.info(
        { userId: user.id, role: user.role },
        '[invite > send][skipped] e-mail não configurado'
      )
      return
    }

    const link = `${appUrl.replace(/\/$/, '')}/authentication/invite/${token}`

    await mail.sendLater(function (message) {
      message
        .to(user.email)
        .subject('Seu acesso ao Maiyu Academy')
        .html(
          [
            `<p>Olá, <strong>${escapeHtml(user.name)}</strong>.</p>`,
            '<p>Uma conta foi criada para você no Maiyu Academy. Defina sua senha pelo link abaixo:</p>',
            `<p><a href="${link}">Definir minha senha</a></p>`,
            `<p>O link vale por ${InviteService.EXPIRES_IN_DAYS} dias.</p>`,
          ].join('')
        )
    })
  }
}

/**
 * O hash do token do convite, como ele é gravado em `account_invites`.
 *
 * **SHA-256 e não `hash.make()`**, que é a pilha de senha (scrypt) e sala cada
 * chamada. Hash salgado nunca se repete, então ele não pode ser procurado: quem
 * recebe o token de volta não teria como achar a linha, e o índice `unique` de
 * `token_hash` jamais dispararia. Consumir o convite viraria uma varredura da
 * tabela com uma verificação por linha.
 *
 * O que o scrypt compra é resistência a dicionário, e aqui não há dicionário a
 * resistir: o token são 64 caracteres sorteados por `string.random`, não uma
 * senha escolhida por gente. É o mesmo motivo pelo qual token de recuperação de
 * senha se guarda assim em toda parte.
 */
export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Escapa o que vai para dentro do HTML do e-mail.
 *
 * O nome vem de formulário, e um `<` solto quebra a renderização na caixa de
 * entrada. Cliente de e-mail não executa script, então isto é legibilidade antes
 * de ser segurança - mas o custo é uma linha.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
