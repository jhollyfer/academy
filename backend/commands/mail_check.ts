import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Manda um e-mail de teste pelo SMTP configurado e conta o que aconteceu.
 *
 * Existe porque o envio, no resto do sistema, é surdo de propósito:
 * `notification.service.ts` e `invite.service.ts` engolem o erro para que uma
 * matrícula nunca seja recusada por causa de e-mail. Isso é a decisão certa
 * para o site e a errada para diagnosticar - do lado de fora, SMTP mal
 * configurado e SMTP perfeito são a mesma tela.
 *
 * `mail.send()` e **não** `sendLater()`: passar pela fila misturaria dois
 * defeitos diferentes ("a credencial está errada" e "o worker não está de pé")
 * na mesma ausência de e-mail. Aqui a conexão é síncrona e o erro sobe cru.
 */
export default class MailCheck extends BaseCommand {
  static commandName = 'mail:check'
  static description = 'Envia um e-mail de teste pelo SMTP e mostra a falha crua, se houver'

  static options: CommandOptions = { startApp: true }

  @flags.string({
    description: 'Destinatário do teste. Sem ele, usa MAIL_TO',
  })
  declare to: string

  async run() {
    const { default: env } = await import('#start/env')
    const { default: mail } = await import('@adonisjs/mail/services/main')

    const host = env.get('SMTP_HOST')
    const from = env.get('MAIL_FROM')
    const to = this.to ?? env.get('MAIL_TO')

    if (!host) {
      this.logger.error('SMTP_HOST não está definido. É o mesmo motivo que faz os dois')
      this.logger.error('services pularem o envio com `[skipped] e-mail não configurado`.')
      this.exitCode = 1
      return
    }

    if (!to) {
      this.logger.error('Sem destinatário: passe --to=alguem@exemplo.com ou defina MAIL_TO.')
      this.exitCode = 1
      return
    }

    this.logger.info(`host     ${host}:${env.get('SMTP_PORT', 587)}`)
    this.logger.info(`de       ${from ?? '(padrão de config/mail.ts)'}`)
    this.logger.info(`para     ${to}`)

    const stamp = new Date().toISOString()

    try {
      await mail.send(function (message) {
        message
          .to(to)
          .subject('Teste de SMTP - Maiyu Academy')
          .html(
            [
              '<p>Se você está lendo isto, o SMTP do Maiyu Academy está entregando.</p>',
              `<p>Enviado em ${stamp}.</p>`,
            ].join('')
          )
      })
    } catch (error) {
      this.logger.error('O SMTP recusou. Erro cru abaixo:')
      this.logger.error(String(error instanceof Error ? error.stack : error))
      this.exitCode = 1
      return
    }

    this.logger.success('Aceito pelo servidor SMTP.')
    // Aceito não é entregue, e a diferença importa muito com o Resend: um
    // destinatário na lista de supressão é aceito e descartado sem aviso.
    this.logger.info('Aceito ≠ entregue. Confirme na caixa de entrada e no painel do')
    this.logger.info('fornecedor: um endereço suprimido é aceito aqui e descartado lá.')
  }
}
