import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import { EnrollmentStatuses } from '#core/entity'
import type Class from '#models/class'
import type Enrollment from '#models/enrollment'

/**
 * O aviso de matrícula nova para a secretaria.
 *
 * **Divergência deliberada de `simple-hub` e `adacaibs`**: nenhum dos dois manda
 * e-mail. O domínio aqui pede: a matrícula entra pelo site a qualquer hora, o
 * pagamento é Pix manual, e a confirmação depende de alguém olhar. Sem aviso, a
 * pessoa que pagou espera por uma confirmação que ninguém sabe que precisa dar.
 *
 * Fica em `app/services/` e não em `features/_shared.*` porque fala com um
 * servidor de fora - que é exatamente a linha que separa os dois lugares.
 *
 * Nada aqui pode derrubar uma matrícula: o método não devolve `Either` e não
 * propaga erro. Uma inscrição gravada com aviso não enviado é um problema
 * pequeno e recuperável pelo painel; uma inscrição recusada porque o SMTP estava
 * fora é uma venda perdida.
 */
export default class NotificationService {
  /**
   * `sendLater` e não `send`: a fila em memória do próprio pacote devolve a
   * resposta HTTP sem esperar o SMTP, que é lento e falha em horário ruim. Não
   * há Redis no projeto, e a fila em memória basta para o volume de uma escola -
   * o custo de perder um aviso num restart é uma linha a menos numa caixa de
   * entrada, com o registro intacto no banco e visível no painel.
   */
  async enrollmentCreated(enrollment: Enrollment, turma: Class): Promise<void> {
    const to = env.get('MAIL_TO')

    // Sem destinatário ou sem servidor não há o que tentar. Log em vez de
    // silêncio: quem for configurar depois precisa saber que passou por aqui.
    if (!to || !env.get('SMTP_HOST')) {
      logger.info(
        { protocol: enrollment.protocol, status: enrollment.status },
        '[notification > enrollment-created][skipped] e-mail não configurado'
      )
      return
    }

    const waitlisted = enrollment.status === EnrollmentStatuses.WAITLIST
    const subject = waitlisted
      ? `Fila de espera: ${enrollment.studentName}`
      : `Nova matrícula: ${enrollment.studentName}`

    try {
      await mail.sendLater(function (message) {
        message
          .to(to)
          .subject(subject)
          .html(
            [
              `<p><strong>${enrollment.studentName}</strong> se inscreveu em <strong>${turma.name}</strong>.</p>`,
              '<ul>',
              `<li>Protocolo: ${enrollment.protocol}</li>`,
              `<li>Situação: ${enrollment.status}</li>`,
              `<li>E-mail: ${enrollment.email}</li>`,
              `<li>Telefone: ${enrollment.phone}</li>`,
              '</ul>',
              '<p>Confirme o pagamento pelo painel da secretaria.</p>',
            ].join('')
          )
      })
    } catch (error) {
      // Engolido de propósito, e não relançado: ver o JSDoc da classe.
      logger.error(
        { err: error, protocol: enrollment.protocol },
        '[notification > enrollment-created][error]'
      )
    }
  }
}
