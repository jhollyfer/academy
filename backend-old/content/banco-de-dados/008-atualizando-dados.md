---
slug: "atualizando-dados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Atualizando Dados"
subtitulo: "UPDATE SET para modificar registros existentes"
descricao: "Aprenda a usar UPDATE para alterar dados no banco. Entenda a importancia critica do WHERE e como atualizar com seguranca."
ordem: 8
proximosPassos:
  - titulo: "Deletando Dados"
    descricao: "DELETE FROM para remover registros com seguranca"
  - titulo: "Filtrando com WHERE"
    descricao: "Revisao de filtros para UPDATE seguro"
quiz:
  - pergunta: "O que acontece se voce executar UPDATE sem WHERE?"
    opcoes: ["Erro de sintaxe", "Atualiza apenas o primeiro registro", "Atualiza TODOS os registros da tabela", "Nao faz nada"]
    correta: 2
    explicacao: "UPDATE sem WHERE altera TODOS os registros. Esse e um dos erros mais perigosos em SQL."
    explicacaoErrada: "Sem WHERE, o UPDATE afeta TODAS as linhas da tabela. Nao da erro, simplesmente atualiza tudo."
  - pergunta: "Qual a forma correta de atualizar o email de um usuario especifico?"
    opcoes: ["UPDATE usuarios SET email = 'novo@email.com'", "UPDATE usuarios SET email = 'novo@email.com' WHERE id = 1", "MODIFY usuarios SET email = 'novo@email.com' WHERE id = 1", "ALTER usuarios SET email = 'novo@email.com' WHERE id = 1"]
    correta: 1
    explicacao: "UPDATE ... SET ... WHERE id = X e o padrao seguro. Sem WHERE, alteraria TODOS os emails."
    explicacaoErrada: "O comando correto e UPDATE com SET e WHERE. ALTER e para estrutura da tabela, nao dados."
  - pergunta: "Como atualizar multiplos campos de uma vez?"
    opcoes: ["Executar um UPDATE para cada campo", "UPDATE tabela SET campo1 = valor1 AND campo2 = valor2", "UPDATE tabela SET campo1 = valor1, campo2 = valor2", "UPDATE tabela SET (campo1, campo2) = (valor1, valor2)"]
    correta: 2
    explicacao: "Separe os campos com virgula no SET. Um unico UPDATE pode alterar quantos campos voce quiser."
    explicacaoErrada: "No SET, separe os campos com virgula (nao AND). AND e para condicoes no WHERE."
  - pergunta: "Qual pratica e recomendada antes de executar um UPDATE?"
    opcoes: ["Fazer backup do banco inteiro", "Testar com SELECT usando o mesmo WHERE", "Desconectar outros usuarios", "Desativar as constraints"]
    correta: 1
    explicacao: "Rodar SELECT com o mesmo WHERE mostra exatamente quais registros serao afetados, sem risco."
    explicacaoErrada: "Antes de um UPDATE, rode um SELECT com o mesmo WHERE para verificar quais registros serao afetados."
  - pergunta: "No Prisma, qual metodo atualiza um unico registro pelo ID?"
    opcoes: ["prisma.usuario.update()", "prisma.usuario.updateOne()", "prisma.usuario.set()", "prisma.usuario.modify()"]
    correta: 0
    explicacao: "O Prisma usa update() para um registro (exige where com campo unico) e updateMany() para varios."
    explicacaoErrada: "O metodo e update(), que exige um where com campo unico (como id). updateMany() e para varios registros."
---

## UPDATE -- alterando registros

O `UPDATE` modifica dados existentes no banco. A sintaxe e simples:

```sql
UPDATE tabela SET coluna = novo_valor WHERE condicao;
```

> [!alerta]
> **REGRA DE OURO: Nunca execute UPDATE sem WHERE.** Sem WHERE, o banco atualiza TODOS os registros da tabela. Esse e um dos erros mais devastadores em SQL e nao tem "desfazer" facil.

## Atualizando um unico campo

```sql
-- Atualizar o email de um usuario especifico
UPDATE usuarios SET email = 'joao.novo@email.com' WHERE id = 1;

-- Mudar o status de um pedido
UPDATE pedidos SET status = 'enviado' WHERE id = 42;

-- Aumentar o preco de um produto
UPDATE produtos SET preco = 29.90 WHERE id = 15;
```

## Atualizando multiplos campos

Separe os campos com **virgula** no `SET`:

```sql
-- Atualizar nome e email ao mesmo tempo
UPDATE usuarios
SET nome = 'Joao Silva',
    email = 'joao.silva@email.com',
    atualizado_em = NOW()
WHERE id = 1;

-- Atualizar endereco completo
UPDATE clientes
SET rua = 'Av Paulista',
    numero = '1000',
    cidade = 'Sao Paulo',
    estado = 'SP'
WHERE id = 25;
```

> [!info]
> Use `NOW()` (ou `CURRENT_TIMESTAMP`) para registrar quando a atualizacao foi feita. Isso e muito util para auditoria.

## UPDATE com condicoes mais complexas

Voce pode usar qualquer filtro que usaria no SELECT:

```sql
-- Desativar usuarios que nao fazem login ha 1 ano
UPDATE usuarios
SET status = 'inativo'
WHERE ultimo_login < NOW() - INTERVAL '1 year';

-- Aplicar desconto em produtos de uma categoria
UPDATE produtos
SET preco = preco * 0.90  -- 10% de desconto
WHERE categoria = 'eletronicos'
  AND estoque > 100;

-- Corrigir emails errados
UPDATE usuarios
SET email = REPLACE(email, '@gmal.com', '@gmail.com')
WHERE email LIKE '%@gmal.com';
```

## A tecnica do SELECT antes do UPDATE

Antes de rodar qualquer UPDATE, **teste com SELECT** usando o mesmo WHERE:

```sql
-- PASSO 1: Veja quais registros serao afetados
SELECT id, nome, status FROM usuarios
WHERE ultimo_login < NOW() - INTERVAL '1 year';
-- → Confira se sao os registros corretos!

-- PASSO 2: So entao execute o UPDATE
UPDATE usuarios
SET status = 'inativo'
WHERE ultimo_login < NOW() - INTERVAL '1 year';
```

> [!alerta]
> Essa tecnica pode salvar sua vida (e seu emprego). Sempre verifique com SELECT primeiro, especialmente em producao.

## UPDATE com RETURNING (PostgreSQL)

No PostgreSQL, voce pode ver os registros afetados sem precisar de um SELECT separado:

```sql
UPDATE usuarios
SET status = 'ativo'
WHERE id = 5
RETURNING id, nome, status;
-- → 5 | Maria Santos | ativo
```

## No Prisma

```typescript
// Atualizar um registro (exige campo unico no where)
const usuario = await prisma.usuario.update({
  where: { id: 1 },
  data: {
    nome: 'Joao Silva',
    email: 'joao.silva@email.com'
  }
})

// Atualizar varios registros de uma vez
const desativados = await prisma.usuario.updateMany({
  where: {
    ultimoLogin: { lt: new Date('2025-01-01') }
  },
  data: { status: 'inativo' }
})
// → desativados.count = numero de registros afetados

// Incrementar valor
const produto = await prisma.produto.update({
  where: { id: 15 },
  data: {
    estoque: { increment: 10 },
    preco: { multiply: 0.90 }  // 10% de desconto
  }
})
```

## No Drizzle

```typescript
import { eq, lt, and } from 'drizzle-orm'

// Atualizar um registro
await db.update(usuarios)
  .set({
    nome: 'Joao Silva',
    email: 'joao.silva@email.com'
  })
  .where(eq(usuarios.id, 1))

// Atualizar com RETURNING
const [atualizado] = await db.update(usuarios)
  .set({ status: 'ativo' })
  .where(eq(usuarios.id, 5))
  .returning()

// Atualizar varios registros
await db.update(usuarios)
  .set({ status: 'inativo' })
  .where(lt(usuarios.ultimoLogin, new Date('2025-01-01')))

// Atualizar com expressao SQL
import { sql } from 'drizzle-orm'
await db.update(produtos)
  .set({ preco: sql`${produtos.preco} * 0.90` })
  .where(eq(produtos.categoria, 'eletronicos'))
```

## No Lucid (AdonisJS)

```typescript
// Atualizar via model (busca + salva)
const usuario = await Usuario.findOrFail(1)
usuario.nome = 'Joao Silva'
usuario.email = 'joao.silva@email.com'
await usuario.save()

// Atualizar direto com merge
const usuario = await Usuario.findOrFail(1)
usuario.merge({ nome: 'Joao Silva', email: 'joao.silva@email.com' })
await usuario.save()

// Atualizar varios registros via query builder
const afetados = await Usuario.query()
  .where('ultimo_login', '<', '2025-01-01')
  .update({ status: 'inativo' })
// → afetados = numero de linhas afetadas

// Atualizar com expressao SQL
const { default: Database } = await import('@adonisjs/lucid/services/db')
await Database.from('produtos')
  .where('categoria', 'eletronicos')
  .update({ preco: Database.raw('preco * 0.90') })
```

> [!info]
> No Lucid, quando voce usa o model (findOrFail + save), os hooks do model sao executados automaticamente. Com query builder direto, os hooks nao rodam.

## Exercicios

1. Escreva uma query que aumente o preco de todos os produtos da categoria "alimentos" em 5%.
2. Atualize o status para "cancelado" em todos os pedidos com mais de 30 dias e status "pendente".
3. Corrija o telefone de um usuario especifico (id = 42), adicionando tambem a data da atualizacao.
4. Usando a tecnica do SELECT primeiro, escreva as duas queries (SELECT de teste + UPDATE) para desativar usuarios sem email.
5. Implemente a mesma atualizacao do exercicio 2 usando Prisma, Drizzle e Lucid.

## Referencias

- [PostgreSQL UPDATE](https://www.postgresql.org/docs/current/sql-update.html)
- [Prisma Update](https://www.prisma.io/docs/orm/prisma-client/queries/crud#update)
- [Drizzle Update](https://orm.drizzle.team/docs/update)
- [Lucid Updates](https://docs.adonisjs.com/guides/database/query-builder#update)
