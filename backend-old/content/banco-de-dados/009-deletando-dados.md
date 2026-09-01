---
slug: "deletando-dados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Deletando Dados"
subtitulo: "DELETE FROM para remover registros"
descricao: "Aprenda a usar DELETE para remover registros. Entenda por que o WHERE e obrigatorio na pratica e como testar antes de deletar."
ordem: 9
proximosPassos:
  - titulo: "Funcoes de Agregacao"
    descricao: "COUNT, SUM, AVG, MIN e MAX para resumir dados"
  - titulo: "GROUP BY e HAVING"
    descricao: "Agrupando dados e filtrando grupos"
quiz:
  - pergunta: "O que acontece se voce executar DELETE FROM usuarios sem WHERE?"
    opcoes: ["Erro de sintaxe", "Deleta apenas o primeiro registro", "Deleta TODOS os registros da tabela", "Nao faz nada"]
    correta: 2
    explicacao: "DELETE sem WHERE apaga TODOS os registros. A tabela continua existindo, mas vazia."
    explicacaoErrada: "Sem WHERE, o DELETE remove TODAS as linhas da tabela. Nao da erro -- simplesmente apaga tudo."
  - pergunta: "Qual a melhor pratica antes de executar um DELETE?"
    opcoes: ["Fazer backup do banco inteiro", "Rodar SELECT com o mesmo WHERE para conferir", "Desconectar outros usuarios do banco", "Rodar em horario de pouco acesso"]
    correta: 1
    explicacao: "SELECT com o mesmo WHERE mostra exatamente quais registros serao deletados, sem risco nenhum."
    explicacaoErrada: "Sempre rode SELECT primeiro com o mesmo WHERE. Assim voce ve exatamente o que sera deletado."
  - pergunta: "Qual a diferenca entre DELETE e TRUNCATE?"
    opcoes: ["Nao ha diferenca", "DELETE pode ter WHERE, TRUNCATE apaga tudo de uma vez", "TRUNCATE pode ter WHERE, DELETE apaga tudo", "DELETE e mais rapido que TRUNCATE"]
    correta: 1
    explicacao: "DELETE remove linha por linha (pode filtrar). TRUNCATE limpa a tabela inteira de uma vez (mais rapido, sem WHERE)."
    explicacaoErrada: "DELETE aceita WHERE e remove linha por linha. TRUNCATE nao aceita WHERE e limpa tudo de uma vez."
  - pergunta: "O que o RETURNING faz no DELETE (PostgreSQL)?"
    opcoes: ["Desfaz a delecao", "Retorna os dados dos registros que foram deletados", "Retorna o numero de registros restantes", "Cria um backup automatico"]
    correta: 1
    explicacao: "RETURNING mostra os dados deletados. Util para logs, auditoria ou confirmar o que foi removido."
    explicacaoErrada: "RETURNING retorna os dados dos registros que acabaram de ser deletados. Nao desfaz nada."
  - pergunta: "No Prisma, qual metodo deleta varios registros de uma vez?"
    opcoes: ["prisma.usuario.delete()", "prisma.usuario.deleteAll()", "prisma.usuario.deleteMany()", "prisma.usuario.remove()"]
    correta: 2
    explicacao: "deleteMany() remove varios registros que atendem ao filtro. delete() remove apenas um (por campo unico)."
    explicacaoErrada: "O metodo e deleteMany(). O delete() exige um where com campo unico e remove apenas um registro."
---

## DELETE -- removendo registros

O `DELETE` remove registros do banco de dados. A sintaxe e simples, mas o perigo tambem:

```sql
DELETE FROM tabela WHERE condicao;
```

> [!alerta]
> **REGRA DE OURO: Nunca execute DELETE sem WHERE.** Sem WHERE, o banco deleta TODOS os registros da tabela. Diferente do UPDATE que "estraga" os dados, o DELETE **some** com eles. Nao tem Ctrl+Z.

## DELETE basico

```sql
-- Deletar um usuario especifico
DELETE FROM usuarios WHERE id = 42;

-- Deletar pedidos cancelados
DELETE FROM pedidos WHERE status = 'cancelado';

-- Deletar logs antigos
DELETE FROM logs WHERE data_criacao < '2024-01-01';
```

## A tecnica do SELECT antes do DELETE

**Sempre** teste com SELECT antes de deletar. Essa tecnica salva vidas:

```sql
-- PASSO 1: Veja o que sera deletado
SELECT id, nome, email FROM usuarios
WHERE ultimo_login < '2024-01-01'
  AND status = 'inativo';
-- → Confira a lista! Sao esses mesmos?

-- PASSO 2: So entao delete
DELETE FROM usuarios
WHERE ultimo_login < '2024-01-01'
  AND status = 'inativo';
```

> [!info]
> Dica: copie e cole o WHERE do SELECT para o DELETE. Assim voce garante que o filtro e exatamente o mesmo.

## DELETE com condicoes complexas

Voce pode usar todos os operadores que aprendeu no WHERE:

```sql
-- Deletar produtos sem estoque de categorias especificas
DELETE FROM produtos
WHERE estoque = 0
  AND categoria IN ('eletronicos', 'informatica');

-- Deletar notificacoes lidas com mais de 30 dias
DELETE FROM notificacoes
WHERE lida = true
  AND data_criacao < NOW() - INTERVAL '30 days';

-- Deletar tentativas de login falhas antigas
DELETE FROM login_tentativas
WHERE sucesso = false
  AND data_tentativa < NOW() - INTERVAL '7 days';
```

## DELETE com RETURNING (PostgreSQL)

Quer saber exatamente o que foi deletado? Use `RETURNING`:

```sql
DELETE FROM usuarios
WHERE status = 'inativo'
  AND ultimo_login < '2023-01-01'
RETURNING id, nome, email;
-- → Retorna os dados de cada registro que foi removido
```

Isso e otimo para logs de auditoria ou para confirmar que deletou os registros certos.

## DELETE vs TRUNCATE

```sql
-- DELETE: remove linha por linha, pode usar WHERE
DELETE FROM logs WHERE data < '2024-01-01';

-- TRUNCATE: limpa a tabela INTEIRA de uma vez
-- Nao aceita WHERE, mas e MUITO mais rapido para tabelas grandes
TRUNCATE TABLE logs;

-- TRUNCATE resetando o contador de ID (auto increment)
TRUNCATE TABLE logs RESTART IDENTITY;
```

> [!alerta]
> TRUNCATE nao ativa triggers e nao pode ser facilmente revertido em uma transacao (depende do banco). Use com muito cuidado.

## Soft Delete vs Hard Delete

Na pratica, muitos sistemas nao deletam de verdade. Em vez disso, marcam o registro como "deletado":

```sql
-- Hard delete: remove do banco (irreversivel)
DELETE FROM usuarios WHERE id = 42;

-- Soft delete: marca como deletado (reversivel)
UPDATE usuarios
SET deletado_em = NOW(),
    status = 'deletado'
WHERE id = 42;

-- Para "restaurar", basta limpar a marca
UPDATE usuarios
SET deletado_em = NULL,
    status = 'ativo'
WHERE id = 42;

-- Nas consultas, sempre filtre os deletados
SELECT * FROM usuarios WHERE deletado_em IS NULL;
```

> [!info]
> Soft delete e a pratica mais comum em aplicacoes reais. Permite desfazer, manter historico e atender requisitos legais (como LGPD).

## No Prisma

```typescript
// Deletar um registro (exige campo unico no where)
const deletado = await prisma.usuario.delete({
  where: { id: 42 }
})
// → retorna o registro que foi deletado

// Deletar varios registros
const resultado = await prisma.pedido.deleteMany({
  where: { status: 'cancelado' }
})
// → resultado.count = numero de registros deletados

// Deletar todos os registros de uma tabela
const todos = await prisma.log.deleteMany()
// → cuidado! Equivale a DELETE sem WHERE

// Soft delete com Prisma
const softDelete = await prisma.usuario.update({
  where: { id: 42 },
  data: { deletadoEm: new Date() }
})
```

## No Drizzle

```typescript
import { eq, lt, and } from 'drizzle-orm'

// Deletar um registro
await db.delete(usuarios).where(eq(usuarios.id, 42))

// Deletar com RETURNING
const [deletado] = await db.delete(usuarios)
  .where(eq(usuarios.id, 42))
  .returning()

// Deletar varios registros
await db.delete(pedidos).where(eq(pedidos.status, 'cancelado'))

// Deletar com condicoes complexas
await db.delete(notificacoes).where(
  and(
    eq(notificacoes.lida, true),
    lt(notificacoes.dataCriacao, new Date('2024-01-01'))
  )
)

// Soft delete
await db.update(usuarios)
  .set({ deletadoEm: new Date() })
  .where(eq(usuarios.id, 42))
```

## No Lucid (AdonisJS)

```typescript
// Deletar via model
const usuario = await Usuario.findOrFail(42)
await usuario.delete()

// Deletar via query builder
const deletados = await Usuario.query()
  .where('status', 'inativo')
  .where('ultimo_login', '<', '2024-01-01')
  .delete()
// → deletados = numero de linhas afetadas

// Soft delete com Lucid (usando coluna luxon)
const usuario = await Usuario.findOrFail(42)
usuario.deletadoEm = DateTime.now()
await usuario.save()

// Lucid tem suporte nativo a soft deletes com o mixin SoftDeletes
// No model:
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'

export default class Usuario extends compose(BaseModel, SoftDeletes) {
  // O mixin adiciona automaticamente:
  // - delete() faz soft delete
  // - forceDelete() faz hard delete
  // - withTrashed() inclui deletados na busca
  // - onlyTrashed() busca apenas deletados
  // - restore() restaura um registro
}
```

> [!info]
> O pacote `adonis-lucid-soft-deletes` adiciona soft delete automatico ao Lucid. Com ele, `delete()` marca como deletado e `forceDelete()` remove de verdade.

## Exercicios

1. Escreva as queries (SELECT de teste + DELETE) para remover todos os logs com mais de 90 dias.
2. Delete todos os produtos com estoque zero e que nao foram vendidos nos ultimos 6 meses.
3. Implemente soft delete para uma tabela de comentarios: crie a query de "deletar" e a query de "buscar apenas ativos".
4. Use RETURNING para deletar notificacoes lidas e retornar quantas foram removidas de cada usuario.
5. Implemente o delete do exercicio 2 usando Prisma, Drizzle e Lucid.

## Referencias

- [PostgreSQL DELETE](https://www.postgresql.org/docs/current/sql-delete.html)
- [PostgreSQL TRUNCATE](https://www.postgresql.org/docs/current/sql-truncate.html)
- [Prisma Delete](https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete)
- [Drizzle Delete](https://orm.drizzle.team/docs/delete)
- [Lucid Soft Deletes](https://docs.adonisjs.com/guides/database/query-builder#delete)
