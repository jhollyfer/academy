---
slug: "inserindo-dados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Inserindo Dados"
subtitulo: "INSERT INTO para adicionar registros"
descricao: "Aprenda a inserir registros com INSERT INTO, tanto um por vez quanto varios de uma so vez, usando SQL puro e ORMs como Prisma, Drizzle e Lucid."
ordem: 4
proximosPassos:
  - titulo: "Buscando Dados"
    descricao: "Use SELECT para consultar registros no banco"
  - titulo: "Filtrando com WHERE"
    descricao: "Filtre resultados com condicoes usando WHERE"
  - titulo: "Atualizando e Deletando"
    descricao: "Modifique e remova registros com UPDATE e DELETE"
quiz:
  - pergunta: "Qual a sintaxe correta para inserir um registro?"
    opcoes: ["ADD INTO alunos (nome) VALUES ('Ana');", "INSERT INTO alunos (nome) VALUES ('Ana');", "INSERT alunos SET nome = 'Ana';", "PUT INTO alunos (nome) VALUES ('Ana');"]
    correta: 1
    explicacao: "INSERT INTO tabela (colunas) VALUES (valores) e a sintaxe padrao do SQL."
    explicacaoErrada: "A sintaxe correta e INSERT INTO. ADD INTO e PUT INTO nao existem no SQL."
  - pergunta: "O que acontece se voce omitir uma coluna NOT NULL no INSERT?"
    opcoes: ["O banco insere NULL", "O banco insere uma string vazia", "O banco retorna um erro", "O banco ignora o registro"]
    correta: 2
    explicacao: "Colunas NOT NULL exigem um valor. Se voce omitir e nao houver DEFAULT, o banco retorna erro."
    explicacaoErrada: "Colunas NOT NULL sao obrigatorias. Omitir gera erro, a menos que tenha DEFAULT definido."
  - pergunta: "Como inserir 3 registros de uma vez em SQL?"
    opcoes: ["Tres comandos INSERT separados", "INSERT INTO tabela VALUES (...), (...), (...);", "INSERT MULTIPLE INTO tabela VALUES (...);", "INSERT BATCH INTO tabela VALUES (...);"]
    correta: 1
    explicacao: "Voce pode listar varios conjuntos de valores separados por virgula num unico INSERT INTO."
    explicacaoErrada: "SQL permite multiplos valores separados por virgula: VALUES (...), (...), (...). Nao existe INSERT MULTIPLE ou INSERT BATCH."
  - pergunta: "No Prisma, qual metodo insere varios registros de uma vez?"
    opcoes: ["prisma.aluno.create()", "prisma.aluno.insertMany()", "prisma.aluno.createMany()", "prisma.aluno.bulkCreate()"]
    correta: 2
    explicacao: "createMany() e o metodo do Prisma para inserir multiplos registros de uma vez."
    explicacaoErrada: "O metodo correto no Prisma e createMany(). create() insere um so, insertMany e do MongoDB, bulkCreate e do Sequelize."
  - pergunta: "No Lucid (AdonisJS), como inserir um registro?"
    opcoes: ["Aluno.insert({ nome: 'Ana' })", "Aluno.create({ nome: 'Ana' })", "Aluno.add({ nome: 'Ana' })", "Aluno.save({ nome: 'Ana' })"]
    correta: 1
    explicacao: "No Lucid, usamos Model.create() para criar e salvar um registro de uma vez."
    explicacaoErrada: "O metodo correto no Lucid e Model.create(). Ele cria a instancia e ja salva no banco."
---

## INSERT INTO -- adicionando registros

O comando `INSERT INTO` adiciona novos registros (linhas) numa tabela. Vamos partir desta tabela criada na aula anterior:

```sql
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    idade INT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Inserindo um registro

A sintaxe basica:

```sql
INSERT INTO alunos (nome, email, idade)
VALUES ('Ana Silva', 'ana@email.com', 20);
-- → Insere 1 registro
```

Voce lista as **colunas** entre parenteses e os **valores** na mesma ordem:

```sql
INSERT INTO alunos (nome, email, idade)
--                  ↓       ↓       ↓
VALUES           ('Ana', 'ana@...', 20);
```

> [!info]
> Colunas com `AUTO_INCREMENT`, `DEFAULT` ou que aceitem NULL podem ser omitidas. No exemplo acima, omitimos `id` (auto), `ativo` (default TRUE) e `criado_em` (default timestamp).

## Inserindo varios registros de uma vez

Separe cada conjunto de valores com virgula:

```sql
INSERT INTO alunos (nome, email, idade) VALUES
    ('Ana Silva', 'ana@email.com', 20),
    ('Carlos Souza', 'carlos@email.com', 22),
    ('Julia Santos', 'julia@email.com', 19),
    ('Pedro Lima', 'pedro@email.com', 21);
-- → Insere 4 registros de uma vez
```

> [!info]
> Inserir varios registros num unico comando e **muito mais rapido** que executar 4 INSERTs separados. O banco faz uma unica operacao ao inves de quatro.

## Inserindo todas as colunas

Se voce informar valores para **todas** as colunas (na ordem da tabela), pode omitir a lista de colunas:

```sql
INSERT INTO alunos
VALUES (NULL, 'Ana Silva', 'ana@email.com', 20, TRUE, NOW());
--     id↑    nome↑         email↑         idade↑ ativo↑ criado_em↑
```

> [!alerta]
> Essa forma e perigosa! Se alguem alterar a ordem das colunas na tabela, o INSERT vai quebrar. **Sempre prefira listar as colunas explicitamente.**

## Verificando a insercao

Depois de inserir, use SELECT para conferir:

```sql
SELECT * FROM alunos;
-- → Mostra todos os registros da tabela
```

Resultado:

| id | nome | email | idade | ativo | criado_em |
|----|------|-------|-------|-------|-----------|
| 1 | Ana Silva | ana@email.com | 20 | 1 | 2024-03-15 14:30:00 |
| 2 | Carlos Souza | carlos@email.com | 22 | 1 | 2024-03-15 14:30:01 |

---

## Mesma operacao com ORMs

Agora vamos ver como fazer a mesma coisa usando ORMs populares. Em vez de escrever SQL na mao, o ORM gera o SQL pra voce.

### Prisma

Inserindo um registro:

```typescript
const aluno = await prisma.aluno.create({
  data: {
    nome: 'Ana Silva',
    email: 'ana@email.com',
    idade: 20,
  },
});
// → { id: 1, nome: 'Ana Silva', email: 'ana@email.com', ... }
```

Inserindo varios:

```typescript
const resultado = await prisma.aluno.createMany({
  data: [
    { nome: 'Ana Silva', email: 'ana@email.com', idade: 20 },
    { nome: 'Carlos Souza', email: 'carlos@email.com', idade: 22 },
    { nome: 'Julia Santos', email: 'julia@email.com', idade: 19 },
  ],
});
// → { count: 3 }
```

> [!info]
> `create()` retorna o registro completo (incluindo o id gerado). `createMany()` retorna apenas a contagem.

### Drizzle

Inserindo um registro:

```typescript
const [aluno] = await db.insert(alunos).values({
  nome: 'Ana Silva',
  email: 'ana@email.com',
  idade: 20,
}).returning();
// → { id: 1, nome: 'Ana Silva', email: 'ana@email.com', ... }
```

Inserindo varios:

```typescript
await db.insert(alunos).values([
  { nome: 'Ana Silva', email: 'ana@email.com', idade: 20 },
  { nome: 'Carlos Souza', email: 'carlos@email.com', idade: 22 },
  { nome: 'Julia Santos', email: 'julia@email.com', idade: 19 },
]);
```

### Lucid (AdonisJS)

Inserindo um registro:

```typescript
const aluno = await Aluno.create({
  nome: 'Ana Silva',
  email: 'ana@email.com',
  idade: 20,
});
// → Instancia do model com id preenchido
```

Inserindo varios:

```typescript
const alunos = await Aluno.createMany([
  { nome: 'Ana Silva', email: 'ana@email.com', idade: 20 },
  { nome: 'Carlos Souza', email: 'carlos@email.com', idade: 22 },
  { nome: 'Julia Santos', email: 'julia@email.com', idade: 19 },
]);
// → Array de instancias do model
```

> [!info]
> No Lucid, `createMany()` retorna um array com todas as instancias criadas, cada uma com seu `id` preenchido.

## Comparativo Rapido

| Operacao | SQL | Prisma | Drizzle | Lucid |
|----------|-----|--------|---------|-------|
| Inserir 1 | `INSERT INTO ... VALUES (...)` | `prisma.model.create()` | `db.insert().values()` | `Model.create()` |
| Inserir N | `INSERT INTO ... VALUES (...), (...)` | `prisma.model.createMany()` | `db.insert().values([...])` | `Model.createMany()` |

## Erros Comuns

### Coluna NOT NULL omitida

```sql
INSERT INTO alunos (email) VALUES ('ana@email.com');
-- → ERRO! Field 'nome' doesn't have a default value
```

### Valor duplicado em coluna UNIQUE

```sql
INSERT INTO alunos (nome, email) VALUES ('Ana', 'ana@email.com');
INSERT INTO alunos (nome, email) VALUES ('Outra Ana', 'ana@email.com');
-- → ERRO! Duplicate entry 'ana@email.com' for key 'email'
```

### Tipo de dado errado

```sql
INSERT INTO alunos (nome, email, idade) VALUES ('Ana', 'ana@email.com', 'vinte');
-- → ERRO! Incorrect integer value: 'vinte' for column 'idade'
```

## Exercicios

1. Crie a tabela `alunos` (como no exemplo) e insira 5 alunos usando um unico INSERT INTO.

2. Tente inserir um aluno sem nome (omitindo a coluna `nome`). O que acontece?

3. Tente inserir dois alunos com o mesmo email. O que acontece?

4. Insira um aluno sem informar a idade. Qual valor aparece na coluna `idade`?

5. Reescreva os INSERTs do exercicio 1 usando Prisma **ou** Drizzle **ou** Lucid (escolha um).

## Referencias

- [MySQL INSERT](https://dev.mysql.com/doc/refman/8.0/en/insert.html)
- [Prisma - Create](https://www.prisma.io/docs/concepts/components/prisma-client/crud#create)
- [Drizzle - Insert](https://orm.drizzle.team/docs/insert)
- [Lucid ORM - CRUD](https://docs.adonisjs.com/guides/models/crud-operations)
