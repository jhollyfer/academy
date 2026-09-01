---
slug: "alterando-estrutura"
modulo: "Modulo 5 -- Estrutura e Manutencao"
titulo: "Alterando Tabelas"
subtitulo: "ALTER TABLE para modificar a estrutura"
descricao: "Aprenda a adicionar, remover e modificar colunas de tabelas existentes com ALTER TABLE."
ordem: 14
proximosPassos:
  - titulo: "DROP e TRUNCATE"
    descricao: "Remova tabelas e dados com seguranca e boas praticas"
  - titulo: "Boas Praticas"
    descricao: "Dicas essenciais para trabalhar com bancos de dados no dia-a-dia"
quiz:
  - pergunta: "Qual comando adiciona uma nova coluna em uma tabela existente?"
    opcoes: ["CREATE COLUMN email VARCHAR(100)", "INSERT COLUMN email INTO alunos", "ALTER TABLE alunos ADD COLUMN email VARCHAR(100)", "UPDATE TABLE alunos ADD email VARCHAR(100)"]
    correta: 2
    explicacao: "ALTER TABLE + ADD COLUMN e a sintaxe correta para adicionar uma coluna."
    explicacaoErrada: "Para modificar a estrutura de uma tabela existente, sempre comece com ALTER TABLE."
  - pergunta: "Como remover a coluna telefone da tabela alunos?"
    opcoes: ["DELETE COLUMN telefone FROM alunos", "ALTER TABLE alunos DROP COLUMN telefone", "REMOVE alunos.telefone", "ALTER TABLE alunos DELETE telefone"]
    correta: 1
    explicacao: "ALTER TABLE + DROP COLUMN remove a coluna e todos os dados que estavam nela."
    explicacaoErrada: "A sintaxe e ALTER TABLE nome_tabela DROP COLUMN nome_coluna."
  - pergunta: "O que acontece com os dados quando voce remove uma coluna?"
    opcoes: ["Os dados sao movidos para outra tabela", "Os dados ficam em um backup automatico", "Os dados sao perdidos permanentemente", "Os dados ficam na coluna com outro nome"]
    correta: 2
    explicacao: "DROP COLUMN remove a coluna E todos os dados dela. Nao tem undo."
    explicacaoErrada: "DROP COLUMN e irreversivel. Todos os dados da coluna sao apagados permanentemente."
  - pergunta: "Como renomear uma coluna de 'fone' para 'telefone'?"
    opcoes: ["ALTER TABLE alunos RENAME COLUMN fone TO telefone", "UPDATE TABLE alunos SET COLUMN fone = telefone", "ALTER TABLE alunos CHANGE fone telefone", "RENAME alunos.fone TO alunos.telefone"]
    correta: 0
    explicacao: "RENAME COLUMN e a sintaxe padrao do SQL para renomear colunas."
    explicacaoErrada: "A sintaxe e ALTER TABLE nome_tabela RENAME COLUMN nome_antigo TO nome_novo."
  - pergunta: "Em projetos com ORMs, como voce normalmente altera a estrutura do banco?"
    opcoes: ["Direto no SQL com ALTER TABLE", "Usando migrations do ORM", "Apagando e recriando a tabela", "Editando o banco pelo pgAdmin"]
    correta: 1
    explicacao: "ORMs usam migrations — arquivos que registram cada mudanca na estrutura. Isso garante que todos os ambientes fiquem sincronizados."
    explicacaoErrada: "Em projetos reais, alteracoes estruturais sao feitas via migrations para manter historico e sincronizar ambientes."
---

## Quando alterar uma tabela?

Voce criou a tabela, ja tem dados nela, e agora percebe que precisa de uma coluna nova? Ou quer mudar o tipo de uma coluna? Nao precisa apagar e recriar a tabela — use `ALTER TABLE` para modificar a estrutura sem perder os dados existentes.

> [!info]
> ALTER TABLE modifica a **estrutura** (colunas, tipos, constraints). Para modificar os **dados**, voce usa UPDATE.

## ADD COLUMN — Adicionar coluna

```sql
-- Adicionar uma coluna de email
ALTER TABLE alunos ADD COLUMN email VARCHAR(150);
```

A nova coluna e criada com `NULL` em todas as linhas existentes. Se voce quer que ela seja obrigatoria, pode definir um valor padrao:

```sql
-- Adicionar coluna com valor padrao
ALTER TABLE alunos ADD COLUMN ativo BOOLEAN DEFAULT true;
```

Voce tambem pode adicionar com NOT NULL, mas so se definir um DEFAULT (senao as linhas existentes nao teriam valor):

```sql
ALTER TABLE alunos ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ativo';
```

## DROP COLUMN — Remover coluna

```sql
-- Remover a coluna telefone
ALTER TABLE alunos DROP COLUMN telefone;
```

> [!alerta]
> DROP COLUMN apaga a coluna E todos os dados dela. Nao tem como desfazer. Faca backup antes se os dados sao importantes.

## RENAME COLUMN — Renomear coluna

```sql
-- Renomear de 'fone' para 'telefone'
ALTER TABLE alunos RENAME COLUMN fone TO telefone;
```

Renomear nao afeta os dados, apenas o nome da coluna. Mas cuidado: se alguma consulta ou aplicacao usa o nome antigo, vai quebrar.

## ALTER COLUMN — Modificar tipo ou constraints

### Mudar o tipo de dado

```sql
-- Mudar o tipo de VARCHAR(50) para VARCHAR(200)
ALTER TABLE alunos ALTER COLUMN nome TYPE VARCHAR(200);
```

### Adicionar ou remover NOT NULL

```sql
-- Tornar a coluna obrigatoria
ALTER TABLE alunos ALTER COLUMN email SET NOT NULL;

-- Permitir NULL novamente
ALTER TABLE alunos ALTER COLUMN email DROP NOT NULL;
```

### Alterar valor padrao

```sql
-- Definir um valor padrao
ALTER TABLE alunos ALTER COLUMN cidade SET DEFAULT 'Nao informada';

-- Remover o valor padrao
ALTER TABLE alunos ALTER COLUMN cidade DROP DEFAULT;
```

## RENAME TABLE — Renomear tabela

```sql
ALTER TABLE alunos RENAME TO estudantes;
```

## Varias alteracoes de uma vez

Voce pode combinar varias alteracoes em um unico comando:

```sql
ALTER TABLE alunos
  ADD COLUMN email VARCHAR(150),
  ADD COLUMN telefone VARCHAR(20),
  DROP COLUMN endereco;
```

## Exemplo pratico completo

Imagine que a tabela alunos foi criada assim:

```sql
CREATE TABLE alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50),
  cidade VARCHAR(50)
);
```

E agora voce precisa:
1. Aumentar o tamanho do nome
2. Adicionar email (obrigatorio)
3. Adicionar data de nascimento
4. Renomear cidade para cidade_natal

```sql
ALTER TABLE alunos
  ALTER COLUMN nome TYPE VARCHAR(150),
  ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN data_nascimento DATE,
  RENAME COLUMN cidade TO cidade_natal;
```

## E nos ORMs? Migrations!

Em projetos reais com ORMs, voce nao roda ALTER TABLE manualmente. Voce cria **migrations** — arquivos que descrevem a mudanca. O ORM gera o SQL automaticamente.

```bash
# Prisma: edite o schema.prisma e rode
npx prisma migrate dev --name adicionar_email

# Drizzle: gere a migration a partir do schema
npx drizzle-kit generate

# Lucid (AdonisJS): crie uma migration
node ace make:migration adicionar_email_alunos
```

A vantagem das migrations e que elas ficam no historico do projeto. Qualquer pessoa que baixar o codigo pode rodar as migrations e ter o banco identico.

> [!info]
> Pense nas migrations como "commits para o banco de dados". Cada migration e uma mudanca registrada que pode ser aplicada ou revertida.

## Exercicios

1. Adicione uma coluna `cpf` (VARCHAR 14, UNIQUE) na tabela alunos.
2. Renomeie a coluna `nome` para `nome_completo`.
3. Mude o tipo da coluna `cidade` de VARCHAR(50) para VARCHAR(100).
4. Remova a coluna `cpf` que voce acabou de criar.
5. Faca todas as alteracoes acima em um unico comando ALTER TABLE.

## Referencias

- [ALTER TABLE — PostgreSQL Docs](https://www.postgresql.org/docs/current/sql-altertable.html) -- documentacao oficial
- [SQL ALTER TABLE Statement](https://www.w3schools.com/sql/sql_alter.asp) -- W3Schools
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) -- documentacao de migrations do Prisma
