---
slug: "relacionamentos"
modulo: "Modulo 4 -- Relacionamentos"
titulo: "Relacionando Tabelas"
subtitulo: "Chaves estrangeiras e como tabelas se conectam"
descricao: "Entenda chaves estrangeiras, tipos de relacionamento (1:1, 1:N, N:N) e como criar tabelas relacionadas."
ordem: 12
proximosPassos:
  - titulo: "Juntando Tabelas (JOIN)"
    descricao: "Combine dados de varias tabelas com INNER JOIN, LEFT JOIN e mais"
  - titulo: "Alterando Tabelas"
    descricao: "Modifique a estrutura de tabelas existentes com ALTER TABLE"
quiz:
  - pergunta: "O que e uma chave estrangeira (FOREIGN KEY)?"
    opcoes: ["Uma coluna que identifica cada linha de forma unica", "Uma coluna que referencia a chave primaria de outra tabela", "Um indice criado automaticamente em toda tabela", "Uma coluna que aceita apenas valores nulos"]
    correta: 1
    explicacao: "A chave estrangeira e uma coluna que aponta para a chave primaria de outra tabela, criando o vinculo entre elas."
    explicacaoErrada: "Chave primaria identifica a linha. Chave estrangeira REFERENCIA a chave primaria de outra tabela."
  - pergunta: "Em um relacionamento 1:N entre cursos e matriculas, onde fica a chave estrangeira?"
    opcoes: ["Na tabela cursos", "Na tabela matriculas", "Nas duas tabelas", "Em nenhuma, e automatico"]
    correta: 1
    explicacao: "A chave estrangeira fica no lado N (muitos). Uma matricula pertence a um curso, entao matriculas tem curso_id."
    explicacaoErrada: "No relacionamento 1:N, a FK fica no lado 'muitos'. Varios alunos se matriculam em um curso."
  - pergunta: "Como representar um relacionamento N:N (muitos para muitos)?"
    opcoes: ["Com uma chave estrangeira em cada tabela", "Com uma tabela intermediaria que tem FKs das duas tabelas", "Colocando uma lista de IDs em uma coluna", "Nao e possivel em bancos relacionais"]
    correta: 1
    explicacao: "Relacionamento N:N precisa de uma tabela intermediaria (tabela pivot) com chaves estrangeiras das duas tabelas."
    explicacaoErrada: "N:N sempre usa tabela intermediaria. Bancos relacionais nao suportam listas dentro de colunas."
  - pergunta: "Qual clausula garante que o valor da FK existe na tabela referenciada?"
    opcoes: ["CHECK", "UNIQUE", "REFERENCES", "NOT NULL"]
    correta: 2
    explicacao: "REFERENCES indica qual tabela e coluna a FK referencia, garantindo integridade referencial."
    explicacaoErrada: "CHECK valida condicoes, UNIQUE impede duplicatas, NOT NULL impede nulos. REFERENCES cria o vinculo entre tabelas."
  - pergunta: "Qual o efeito de ON DELETE CASCADE em uma FK?"
    opcoes: ["Impede a exclusao do registro pai", "Seta o valor da FK como NULL", "Apaga automaticamente os registros filhos quando o pai e apagado", "Nao tem efeito nenhum"]
    correta: 2
    explicacao: "CASCADE propaga a acao: se o registro pai e apagado, todos os filhos que referenciam ele tambem sao apagados."
    explicacaoErrada: "CASCADE = efeito em cascata. Apagar o pai apaga os filhos. RESTRICT impediria a exclusao."
---

## Por que relacionar tabelas?

Ate agora trabalhamos com uma tabela so. Mas no mundo real, os dados se conectam: um aluno se matricula em cursos, um pedido tem produtos, um post tem comentarios. Se voce colocar tudo em uma tabela so, vai ter muita repeticao de dados. A solucao e dividir em tabelas e conectar elas com **chaves estrangeiras**.

> [!info]
> Relacionar tabelas e o coracao dos bancos de dados relacionais. E por isso que eles tem esse nome.

## Chave estrangeira (Foreign Key)

Uma chave estrangeira (FK) e uma coluna que referencia a chave primaria de outra tabela. Ela cria um vinculo entre as tabelas e garante que voce nao pode inserir um valor que nao existe na tabela referenciada.

```sql
CREATE TABLE cursos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  carga_horaria INTEGER NOT NULL
);

CREATE TABLE matriculas (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id),
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  data_matricula DATE DEFAULT CURRENT_DATE
);
```

Agora `matriculas.aluno_id` aponta para `alunos.id` e `matriculas.curso_id` aponta para `cursos.id`. O banco nao vai deixar voce inserir uma matricula com um `aluno_id` que nao existe na tabela alunos.

## Tipos de relacionamento

### 1:1 (Um para Um)

Cada registro de uma tabela se relaciona com no maximo um registro da outra. Exemplo: cada aluno tem um perfil.

```sql
CREATE TABLE perfis (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER UNIQUE NOT NULL REFERENCES alunos(id),
  bio TEXT,
  foto_url VARCHAR(255)
);
```

> [!info]
> O `UNIQUE` na FK garante que cada aluno tem no maximo um perfil. Sem ele, seria 1:N.

### 1:N (Um para Muitos)

Um registro se relaciona com varios da outra tabela. Exemplo: um curso tem muitas matriculas.

```sql
-- Um curso → muitas matriculas
-- A FK fica no lado "muitos" (matriculas)
CREATE TABLE matriculas (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id),
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  data_matricula DATE DEFAULT CURRENT_DATE
);
```

### N:N (Muitos para Muitos)

Quando os dois lados podem ter varios. Exemplo: um aluno pode se matricular em varios cursos, e um curso pode ter varios alunos. A solucao e criar uma **tabela intermediaria** (tambem chamada de tabela pivot):

```sql
-- alunos N:N cursos → tabela intermediaria: matriculas
-- matriculas e a tabela que conecta as duas
INSERT INTO matriculas (aluno_id, curso_id) VALUES (1, 1);
INSERT INTO matriculas (aluno_id, curso_id) VALUES (1, 2); -- Ana em 2 cursos
INSERT INTO matriculas (aluno_id, curso_id) VALUES (2, 1); -- Bruno no curso 1
```

## ON DELETE — o que acontece quando apaga o pai?

Quando voce apaga um registro que e referenciado por outra tabela, o banco precisa saber o que fazer:

```sql
CREATE TABLE matriculas (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
  data_matricula DATE DEFAULT CURRENT_DATE
);
```

| Opcao          | O que faz                                         |
|----------------|----------------------------------------------------|
| `CASCADE`      | Apaga os filhos junto com o pai                    |
| `RESTRICT`     | Impede a exclusao se existir filhos                |
| `SET NULL`     | Seta a FK como NULL nos filhos                     |
| `SET DEFAULT`  | Seta a FK como o valor padrao                      |
| `NO ACTION`    | Parecido com RESTRICT (padrao)                     |

> [!alerta]
> Cuidado com CASCADE em producao. Apagar um registro pode apagar centenas de filhos em cadeia. Prefira RESTRICT e faca a exclusao manual quando necessario.

## Relacionamentos nos ORMs

### Prisma

```prisma
model Aluno {
  id         Int          @id @default(autoincrement())
  nome       String
  matriculas Matricula[]
  perfil     Perfil?
}

model Curso {
  id            Int          @id @default(autoincrement())
  nome          String
  matriculas    Matricula[]
}

model Matricula {
  id            Int      @id @default(autoincrement())
  aluno         Aluno    @relation(fields: [alunoId], references: [id])
  alunoId       Int
  curso         Curso    @relation(fields: [cursoId], references: [id])
  cursoId       Int
  dataMatricula DateTime @default(now())
}

model Perfil {
  id       Int    @id @default(autoincrement())
  aluno    Aluno  @relation(fields: [alunoId], references: [id])
  alunoId  Int    @unique
  bio      String?
  fotoUrl  String?
}
```

### Drizzle

```typescript
import { pgTable, serial, integer, varchar, date, text } from 'drizzle-orm/pg-core'

export const alunos = pgTable('alunos', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
})

export const cursos = pgTable('cursos', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
})

export const matriculas = pgTable('matriculas', {
  id: serial('id').primaryKey(),
  alunoId: integer('aluno_id').notNull().references(() => alunos.id),
  cursoId: integer('curso_id').notNull().references(() => cursos.id),
  dataMatricula: date('data_matricula').defaultNow(),
})
```

### Lucid (AdonisJS)

```typescript
// app/models/aluno.ts
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Matricula from './matricula.js'
import Perfil from './perfil.js'

export default class Aluno extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @hasMany(() => Matricula)
  declare matriculas: HasMany<typeof Matricula>

  @hasOne(() => Perfil)
  declare perfil: HasOne<typeof Perfil>
}

// app/models/matricula.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Aluno from './aluno.js'
import Curso from './curso.js'

export default class Matricula extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alunoId: number

  @column()
  declare cursoId: number

  @belongsTo(() => Aluno)
  declare aluno: BelongsTo<typeof Aluno>

  @belongsTo(() => Curso)
  declare curso: BelongsTo<typeof Curso>
}
```

## Exercicios

1. Crie as tabelas `autores` e `livros` com um relacionamento 1:N (um autor tem muitos livros).
2. Crie uma tabela `avaliacoes` que conecta `alunos` e `cursos` com uma nota de avaliacao (N:N com atributo extra).
3. Adicione `ON DELETE CASCADE` na FK de `matriculas` para `alunos` e `ON DELETE RESTRICT` para `cursos`. Explique por que cada escolha faz sentido.
4. Desenhe (no papel ou em texto) o diagrama de relacionamento entre: `alunos`, `cursos`, `matriculas`, `perfis`.

## Referencias

- [Foreign Keys — PostgreSQL Docs](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) -- documentacao oficial
- [SQL FOREIGN KEY Constraint](https://www.w3schools.com/sql/sql_foreignkey.asp) -- W3Schools
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations) -- documentacao oficial Prisma
