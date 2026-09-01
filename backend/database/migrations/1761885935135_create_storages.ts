import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'storages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // `filename` é gerado pelo sistema (uuid+ext, RN-48); `original_name` guarda
      // só o rótulo enviado pelo usuário e nunca vira caminho em disco.
      table.string('filename', 255).notNullable()
      table.string('original_name', 255).notNullable()
      table.string('mimetype', 127).notNullable()
      // Tamanho em bytes, declarado pelo cliente e conferido contra o objeto no
      // bucket quando o upload é confirmado.
      //
      // `bigint` e não `integer`: o teto de `int4` é 2,1 GB, menos do que o teto
      // de upload que o ambiente pode pedir (RN-47). Com `integer`, subir o
      // `UPLOAD_MAX_SIZE` acima disso passava na validação e estourava no
      // `INSERT` - o limite ficava escondido no tipo da coluna.
      table.bigint('size').notNullable()
      // A chave do objeto no bucket. NÃO existe coluna `url`: ela é derivada na
      // leitura (RF-63). Também não existe coluna de destino - é um bucket só,
      // em todo ambiente (RNF-20).
      table.string('path', 255).notNullable()
      // Máquina de estado do upload. O binário não passa por esta aplicação:
      // `POST /storages` grava a linha, o navegador sobe as partes direto no
      // bucket, e `POST /storages/:id/complete` confirma. Entre uma coisa e
      // outra a linha existe sem binário íntegro, e é isso que `PENDING` nomeia.
      // Só `UPLOADED` pode ser anexado a alguma coisa.
      table.string('status', 20).notNullable().defaultTo('PENDING')
      // `UploadId` devolvido pelo storage ao iniciar um multipart. Nulo quando o
      // arquivo coube numa parte só e subiu por um PUT simples.
      table.string('upload_id', 255).nullable()
      // O tamanho de parte usado neste upload. Guardado porque a retomada
      // precisa dele: depois de um reload, o cliente refatia o arquivo e as
      // fronteiras têm de bater com as partes que o storage já recebeu.
      table.integer('part_size').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      // Remoção lógica (RF-59): apagar a linha aqui não apaga o binário no disco.
      table.timestamp('deleted_at').nullable()
      // Serve a varredura de `PENDING` abandonado (`node ace storages:prune`).
      table.index(['status', 'created_at'], 'storages_status_created_at_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
