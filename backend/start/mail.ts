import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import SendEmailJob from '#jobs/send_email.job'

/**
 * Liga o `mail.sendLater()` à fila do Redis.
 *
 * Sem este arquivo o `sendLater` usa a fila **em memória** do próprio pacote de
 * mail, e a doc oficial avisa o que isso custa: "queued emails are lost if your
 * process terminates before sending them". Um convite de acesso perdido num
 * deploy é uma família sem senha esperando um e-mail que não vem.
 *
 * O ganho da costura ser aqui, e não em cada chamador, é que **nenhum serviço
 * mudou**: `notification.service.ts` e `invite.service.ts` seguem chamando
 * `mail.sendLater()` sem saber qual fila está atrás. Trocar de fila de novo é
 * mexer neste arquivo, e em nenhum outro.
 *
 * Só instala com `REDIS_URL` presente. Sem ele, o comportamento volta a ser
 * exatamente o de antes - fila de memória - em vez de virar envio síncrono, que
 * é o que o adaptador `sync` faria: prender a resposta HTTP ao SMTP é pior que
 * perder um aviso num restart.
 */
if (env.get('REDIS_URL')) {
  mail.setMessenger(function (mailer) {
    return {
      async queue(mailMessage, config) {
        await SendEmailJob.dispatch({
          mailMessage,
          config,
          mailerName: mailer.name,
        })
      },
    }
  })
}
