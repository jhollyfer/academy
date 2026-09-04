import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'course_modules'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Quantos sábados o módulo ocupa.
      //
      // A unidade é o sábado, e não a aula: o curso é presencial e acontece uma
      // vez por semana, então "3 encontros" é o que a família consegue traduzir
      // em calendário. Contar aulas seria linguagem de plataforma de vídeo, que
      // é o que esta escola justamente não é.
      //
      // Nulo enquanto a grade não foi detalhada - diferente de zero, que
      // afirmaria um módulo que não ocupa sábado nenhum.
      table.integer('session_count').nullable()

      // Os tópicos do encontro, um por linha.
      //
      // `text` e não tabela própria: um tópico não tem nada além do texto e da
      // ordem, e uma terceira tabela em cascata só para guardar string faria o
      // formulário do painel gerenciar array dentro de array.
      table.text('topics').nullable()

      // O que o aluno entrega ao final do módulo.
      //
      // É o campo que substitui a faixa salarial da referência: em vez de
      // prometer o que o mercado paga, a página mostra o que a pessoa sai
      // tendo feito. Um é promessa sobre terceiros, o outro é o que a escola
      // controla.
      table.string('deliverable', 200).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('session_count')
      table.dropColumn('topics')
      table.dropColumn('deliverable')
    })
  }
}
