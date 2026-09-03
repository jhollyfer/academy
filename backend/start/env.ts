/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  /**
   * Origens que o navegador pode usar para chamar esta API, separadas por
   * vírgula. Opcional porque em desenvolvimento o `config/cors.ts` libera tudo;
   * fora dele, ausente significa lista vazia, e lista vazia recusa todo pedido
   * cross-origin - que é o default certo para um valor que ninguém configurou.
   */
  CORS_ORIGIN: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DATABASE_URL: Env.schema.string(),

  /**
   * TLS na conexão com o Postgres. É decisão de infraestrutura, não de ambiente:
   * um banco na mesma rede privada da aplicação normalmente não fala TLS, e um
   * banco gerenciado normalmente exige. Amarrar isso a `NODE_ENV` obrigava um
   * dos dois arranjos a não subir.
   */
  DATABASE_SSL: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Armazenamento de arquivos (Drive, F4)
  |----------------------------------------------------------
  |
  | Um bucket S3-compatível, o mesmo em todo ambiente (RNF-20): MinIO em dev e
  | nos testes, e em produção o que `STORAGE_ENDPOINT` apontar. Não há escolha
  | de destino por ambiente porque o upload é presigned multipart, e multipart é
  | API do S3 - um disco local não a tem.
  |
  | O prefixo é `STORAGE_`, e não o nome de um fornecedor: o que o código depende
  | é do protocolo. R2, S3, Spaces, Linode e MinIO trocam de lugar mudando o
  | endpoint.
  |
  | `UPLOAD_MAX_SIZE` é o teto por arquivo (RN-47), em bytes, e é **exigida**: o
  | quanto cabe num upload é decisão de quem opera, e um default escondido no
  | código é um teto que ninguém escolheu e ninguém vê. Faltando, a aplicação não
  | sobe - que é melhor do que subir recusando arquivo por um limite invisível.
  */
  UPLOAD_MAX_SIZE: Env.schema.number(),

  STORAGE_KEY: Env.schema.string.optional(),
  STORAGE_SECRET: Env.schema.string.optional(),
  STORAGE_BUCKET: Env.schema.string.optional(),
  STORAGE_ENDPOINT: Env.schema.string.optional(),

  /**
   * O domínio público do bucket, por onde o navegador busca o arquivo. É outro
   * endereço que `STORAGE_ENDPOINT`, que é a API S3 e só atende requisição
   * assinada. Sem esta variável a `url` derivada de cada arquivo aponta para a
   * API e responde 401 na tela.
   */
  STORAGE_CDN_URL: Env.schema.string.optional(),

  /**
   * O MinIO só atende no estilo `endpoint/bucket/chave`; os buckets gerenciados
   * atendem também no estilo `bucket.endpoint`. Ligar isto em dev e desligar em
   * produção é a única diferença de configuração entre os dois.
   */
  STORAGE_FORCE_PATH_STYLE: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------------------------
  | Envio de e-mail
  |----------------------------------------------------------------------------
  |
  | Aviso de matrícula nova para a secretaria. Todas opcionais: sem `SMTP_HOST` a
  | aplicação sobe igual, a matrícula continua sendo aceita e o aviso vira uma
  | linha de log. E-mail é notificação, não parte do fluxo - e o site não pode
  | recusar uma inscrição porque o servidor de e-mail não foi configurado.
  |
  | `MAIL_TO` é o endereço da secretaria, que é quem lê. `MAIL_FROM` precisa ser
  | um endereço do domínio autenticado no SMTP; fornecedor nenhum entrega e-mail
  | assinado como endereço de terceiro.
  */
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  MAIL_FROM: Env.schema.string.optional(),
  MAIL_TO: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------------------------
  | Endereço do site
  |----------------------------------------------------------------------------
  |
  | A base dos links que a API manda por e-mail - hoje, o convite de acesso. É o
  | endereço do **frontend**, e não o da API (`APP_URL`): quem clica precisa cair
  | numa tela, não num JSON.
  |
  | Opcional pelo mesmo motivo do bloco acima: sem ela o convite vira uma linha
  | de log e a conta continua criada, para ser convidada de novo quando o
  | ambiente estiver configurado. Um link montado sobre um default errado seria
  | pior que link nenhum - ele sai, chega, e não funciona.
  */
  FRONTEND_URL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------------------------
  | Semeadura do dono
  |----------------------------------------------------------------------------
  |
  | A senha do `OWNER` que o seeder cria. Opcionais porque a aplicação sobe sem
  | elas: quem as exige é o `user_seeder`, que roda à mão, e ele recusa rodar
  | sem a senha em vez de inventar uma.
  |
  | Antes a senha era literal no seeder, e o repositório é o lugar errado para
  | ela: qualquer pessoa que lesse `database/seeders/user_seeder.ts` tinha a
  | credencial de dono de todo ambiente já semeado.
  */
  SEED_OWNER_EMAIL: Env.schema.string.optional(),
  SEED_OWNER_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------------------------
  | Redis
  |----------------------------------------------------------------------------
  |
  | O armazenamento da fila, numa URL só - `redis://[:senha@]host:porta[/db]`.
  | Uma variável e não quatro: é assim que todo provedor entrega a credencial, e
  | é o que o compose sobrescreve com `redis://redis:6379`. Quem parseia é o
  | `config/redis.ts`.
  |
  | Opcional, e não obrigatória como o instalador do pacote a escreve, pela mesma
  | regra do bloco de e-mail: a aplicação sobe sem infraestrutura acessória. Sem
  | ela o `config/queue.ts` cai no adaptador `sync` e o `start/mail.ts` não
  | instala o messenger - o `sendLater` volta à fila em memória do pacote de
  | mail, que é o comportamento anterior a esta mudança. Exigir a variável
  | transformaria Redis fora do ar em site fora do ar.
  */
  // Sem `format: 'url'`: o validador do Adonis só reconhece esquemas web, e
  // recusa `redis://` como URL inválida.
  REDIS_URL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------------------------
  | Fila
  |----------------------------------------------------------------------------
  |
  | O adaptador da fila. Opcional: com `REDIS_URL` o default é `redis`, o único
  | que sobrevive a um restart - e a fila existe justamente para o trabalho que
  | não pode se perder quando o processo cai.
  |
  | `sync` executa o job na hora, dentro da requisição. É o default quando não há
  | `REDIS_URL`, e o que a suíte usa: o adaptador `redis` abre conexão no boot e
  | derrubaria toda rota que enfileira algo sem servidor de pé. Em produção ele
  | desfaz o motivo de existir da fila, prendendo a resposta HTTP ao SMTP.
  */
  QUEUE_DRIVER: Env.schema.enum.optional(['redis', 'database', 'sync'] as const),
})
