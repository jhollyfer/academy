import mail from '@adonisjs/mail/services/main'
import { Job, exponentialBackoff } from '@adonisjs/queue'
import type { NodeMailerMessage, MessageBodyTemplates } from '@adonisjs/mail/types'

type Payload = {
  mailMessage: { message: NodeMailerMessage; views: MessageBodyTemplates }
  // `unknown` e não um tipo de config: é o que a assinatura de `MailerMessenger`
  // entrega e o que `sendCompiled` aceita. Estreitar aqui seria afirmar uma
  // forma que o pacote não promete.
  config: unknown
  mailerName: string
}

/**
 * Entrega um e-mail já compilado.
 *
 * O job recebe a mensagem **pronta** - `sendCompiled`, não `send` -, porque quem
 * a montou foi o `mail.sendLater()` do chamador, ainda dentro da requisição. O
 * worker só transporta: ele não sabe o que é um convite nem uma matrícula, e não
 * precisa saber.
 *
 * **Idempotência**: reenviar é o pior que uma repetição causa aqui, e a fila
 * repete por desenho quando o SMTP falha. Um job que criasse registro ou cobrasse
 * precisaria de chave própria; este não - o dano de uma segunda cópia na caixa de
 * entrada é menor que o de um convite que nunca chega.
 */
export default class SendEmailJob extends Job<Payload> {
  static options: (typeof Job)['options'] = {
    // Sem `queue` nomeada, de propósito: o job vai para a fila default, que é a
    // que `node ace queue:work` processa sem flag. Uma fila `emails` exigiria
    // `--queue=emails` no worker, e esquecer a flag não dá erro nenhum - o
    // worker sobe, fica saudável e nunca pega um job. Há um tipo de job só;
    // nomear agora compraria uma pegadinha silenciosa sem resolver nada.
    //
    // Três tentativas com espera crescente: 1s, 2s, 4s. O SMTP falha por
    // indisponibilidade passageira muito mais do que por mensagem inválida, e
    // insistir de imediato só gasta as tentativas contra o mesmo servidor ainda
    // fora do ar. O teto evita que a terceira caia numa espera de minutos.
    retry: {
      maxRetries: 3,
      backoff: exponentialBackoff({ baseDelay: '1s', maxDelay: '30s' }),
    },
  }

  async execute(): Promise<void> {
    const { mailMessage, config, mailerName } = this.payload

    // Deixa estourar. Engolir aqui marcaria o job como concluído e a fila nunca
    // tentaria de novo - que é o oposto do motivo de existir da fila. Quem
    // decide não derrubar o fluxo por causa de e-mail é o chamador, lá atrás.
    await mail.use(mailerName as never).sendCompiled(mailMessage, config)
  }
}
