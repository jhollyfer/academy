import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

/**
 * O envio de e-mail.
 *
 * **Divergência deliberada de `simple-hub` e `adacaibs`**: nenhum dos dois manda
 * e-mail, então não há forma a copiar. O domínio aqui exige: a matrícula chega
 * pelo site a qualquer hora, e a secretaria não fica olhando o painel. Sem um
 * aviso, a pessoa que pagou o Pix espera por uma confirmação que ninguém sabe
 * que precisa dar.
 *
 * Um mailer só, SMTP, porque é o denominador comum: Gmail, Zoho, Brevo, Resend e
 * o servidor da própria hospedagem falam SMTP. Trocar de fornecedor é trocar
 * quatro variáveis, e não trocar de código - a mesma razão pela qual o bloco de
 * armazenamento tem prefixo `STORAGE_` e não o nome de um fornecedor.
 *
 * Tudo é opcional de propósito. Sem `SMTP_HOST` a aplicação sobe igual e a
 * matrícula continua funcionando: o aviso vira uma linha de log
 * (`notification.service.ts`). Um e-mail não configurado não pode ser motivo
 * para o site recusar uma inscrição.
 */
const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * O remetente padrão. `MAIL_FROM` costuma precisar ser um endereço do próprio
   * domínio autenticado no SMTP - fornecedor nenhum entrega e-mail assinado como
   * um endereço de terceiro.
   */
  from: {
    address: env.get('MAIL_FROM', 'nao-responda@maiyu.com.br'),
    name: 'Maiyu Academy',
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'localhost'),
      port: env.get('SMTP_PORT', 587),
      // `secure` é TLS implícito, que só a 465 usa. Na 587 a conexão começa em
      // claro e sobe para TLS por STARTTLS, e marcar `secure` ali trava o
      // handshake.
      secure: env.get('SMTP_PORT', 587) === 465,
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME', ''),
        pass: env.get('SMTP_PASSWORD', ''),
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
