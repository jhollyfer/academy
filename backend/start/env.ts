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
})
