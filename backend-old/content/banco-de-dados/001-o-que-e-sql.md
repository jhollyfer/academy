---
slug: "o-que-e-sql"
modulo: "Modulo 1 -- Fundamentos"
titulo: "O que e SQL"
subtitulo: "A linguagem que conversa com bancos de dados"
descricao: "Entenda o que e SQL, como funciona um banco de dados relacional e os conceitos de tabela, linha, coluna, chave primaria e chave estrangeira."
ordem: 1
proximosPassos:
  - titulo: "Tipos de Dados"
    descricao: "Conheca INT, VARCHAR, BOOLEAN e os principais tipos do SQL"
  - titulo: "Criando Tabelas"
    descricao: "Use CREATE TABLE para estruturar seus dados"
quiz:
  - pergunta: "O que significa SQL?"
    opcoes: ["Structured Query Language", "Simple Query Language", "Standard Question Language", "System Query Logic"]
    correta: 0
    explicacao: "SQL significa Structured Query Language -- a linguagem padrao para trabalhar com bancos de dados relacionais."
    explicacaoErrada: "SQL e a sigla de Structured Query Language, nao confunda com outras siglas."
  - pergunta: "Na analogia do arquivo, o que representa uma tabela?"
    opcoes: ["O arquivo inteiro", "Uma gaveta", "Uma pasta dentro da gaveta", "A etiqueta da gaveta"]
    correta: 1
    explicacao: "Cada tabela e como uma gaveta do arquivo -- guarda um tipo especifico de informacao organizada em linhas e colunas."
    explicacaoErrada: "A tabela equivale a uma gaveta. O arquivo inteiro seria o banco de dados."
  - pergunta: "Qual e a funcao de uma chave primaria (PRIMARY KEY)?"
    opcoes: ["Conectar duas tabelas", "Criptografar os dados", "Identificar cada registro de forma unica", "Definir o tipo de dado da coluna"]
    correta: 2
    explicacao: "A chave primaria garante que cada linha da tabela tenha um identificador unico, sem repeticoes."
    explicacaoErrada: "A PRIMARY KEY serve para identificar cada registro de forma unica. Conectar tabelas e papel da chave estrangeira."
  - pergunta: "Qual comando cria um novo banco de dados?"
    opcoes: ["NEW DATABASE clinica;", "CREATE DATABASE clinica;", "ADD DATABASE clinica;", "MAKE DATABASE clinica;"]
    correta: 1
    explicacao: "CREATE DATABASE e o comando SQL padrao para criar um banco de dados."
    explicacaoErrada: "O comando correto e CREATE DATABASE. Os outros nao existem no SQL."
  - pergunta: "O que uma chave estrangeira (FOREIGN KEY) faz?"
    opcoes: ["Impede que a tabela seja deletada", "Cria um indice automaticamente", "Conecta um registro a outra tabela", "Define um valor padrao para a coluna"]
    correta: 2
    explicacao: "A chave estrangeira cria um vinculo entre duas tabelas, referenciando a chave primaria de outra tabela."
    explicacaoErrada: "FOREIGN KEY serve para conectar tabelas entre si, criando relacionamentos."
---

## O que e um Banco de Dados?

Imagine um **arquivo de escritorio** daqueles bem grandes, com varias gavetas. Cada gaveta guarda um tipo de documento diferente -- uma para fichas de alunos, outra para notas, outra para cursos.

Um **banco de dados** funciona exatamente assim:

| Analogia | Banco de Dados |
|----------|---------------|
| Arquivo inteiro | Banco de dados |
| Gaveta | Tabela |
| Ficha dentro da gaveta | Linha (registro) |
| Campo da ficha (nome, idade) | Coluna |

Bancos de dados **relacionais** organizam tudo em tabelas que podem se conectar entre si. E o SQL e a linguagem que usamos para conversar com eles.

## O que e SQL?

SQL significa **Structured Query Language** (Linguagem de Consulta Estruturada). E a linguagem padrao usada para:

- **Criar** tabelas e bancos de dados
- **Inserir** dados
- **Buscar** informacoes
- **Atualizar** registros
- **Deletar** dados

```sql
-- Isso e SQL! Simples e direto:
SELECT nome, idade FROM alunos;
-- → Retorna o nome e idade de todos os alunos
```

> [!info]
> SQL e usada em praticamente todos os bancos relacionais: MySQL, PostgreSQL, SQLite, SQL Server. A sintaxe base e a mesma, com pequenas variacoes entre eles.

## Tabelas, Linhas e Colunas

Uma tabela e composta por **colunas** (campos) e **linhas** (registros).

Exemplo de uma tabela `alunos`:

| id | nome | idade | email |
|----|------|-------|-------|
| 1 | Ana | 20 | ana@email.com |
| 2 | Carlos | 22 | carlos@email.com |
| 3 | Julia | 19 | julia@email.com |

- **Colunas**: `id`, `nome`, `idade`, `email` -- definem que tipo de informacao a tabela guarda
- **Linhas**: cada linha e um registro (um aluno)

## Chave Primaria (PRIMARY KEY)

A chave primaria e uma coluna (ou conjunto de colunas) que **identifica cada registro de forma unica**. Nenhum valor pode se repetir.

No exemplo acima, a coluna `id` e a chave primaria. Cada aluno tem um `id` diferente.

```sql
-- A coluna id nunca se repete:
-- id = 1 → Ana
-- id = 2 → Carlos
-- id = 3 → Julia
```

Regras da chave primaria:
- Cada tabela so pode ter **uma** chave primaria
- O valor **nunca pode ser NULL** (vazio)
- O valor **nunca pode se repetir**

## Chave Estrangeira (FOREIGN KEY)

A chave estrangeira conecta uma tabela a outra. Ela faz referencia a chave primaria de outra tabela.

Exemplo: uma tabela `matriculas` que conecta alunos a cursos:

| id | aluno_id | curso_id | data_matricula |
|----|----------|----------|----------------|
| 1 | 1 | 10 | 2024-03-01 |
| 2 | 2 | 10 | 2024-03-02 |

Aqui, `aluno_id` e uma chave estrangeira que aponta para `alunos.id`, e `curso_id` aponta para `cursos.id`.

> [!alerta]
> Se voce tentar inserir um `aluno_id` que nao existe na tabela `alunos`, o banco vai recusar a operacao. Isso garante a **integridade dos dados**.

## Criando e Selecionando um Banco de Dados

Antes de criar tabelas, voce precisa criar o banco de dados:

```sql
CREATE DATABASE clinica;
-- → Cria um banco chamado "clinica"
```

Depois, selecione o banco para comecar a trabalhar nele:

```sql
USE clinica;
-- → Agora todos os comandos vao para o banco "clinica"
```

Para ver quais bancos existem no servidor:

```sql
SHOW DATABASES;
-- → Lista todos os bancos disponiveis
```

E para deletar um banco (cuidado!):

```sql
DROP DATABASE clinica;
-- → Apaga o banco "clinica" e TUDO dentro dele
```

> [!alerta]
> `DROP DATABASE` e irreversivel. Sempre tenha backup antes de rodar esse comando.

## Resumo Visual

```
Banco de Dados (clinica)
├── Tabela: alunos
│   ├── id (PK)
│   ├── nome
│   ├── idade
│   └── email
├── Tabela: cursos
│   ├── id (PK)
│   ├── nome
│   └── carga_horaria
└── Tabela: matriculas
    ├── id (PK)
    ├── aluno_id (FK → alunos.id)
    ├── curso_id (FK → cursos.id)
    └── data_matricula
```

## Exercicios

1. Crie um banco de dados chamado `escola` e selecione ele com `USE`.
2. Liste pelo menos 3 tabelas que uma escola precisaria (ex: alunos, professores...). Para cada tabela, escreva quais colunas ela teria.
3. Identifique qual coluna seria a chave primaria de cada tabela.
4. Identifique pelo menos um relacionamento entre as tabelas (onde usaria chave estrangeira).
5. Pesquise: qual a diferenca entre MySQL e PostgreSQL?

## Referencias

- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL em 10 minutos (Khan Academy)](https://pt.khanacademy.org/computing/computer-programming/sql)
