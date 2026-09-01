---
slug: "type-hints"
modulo: "Módulo 2 — Fundamentos da Linguagem"
título: "Type Hints"
subtitulo: "Anotações de tipo para código mais claro"
descricao: "Use type hints para documentar tipos em variáveis, parâmetros e retornos de funções."
ordem: 4
proximosPassos:
  - título: "Operadores Aritméticos e Relacionais"
    descricao: "Faça cálculos e comparações em Python"
  - título: "Operadores Lógicos e Ternário"
    descricao: "Combine condições com and, or, not e ternário"
quiz:
  - pergunta: "O que acontece se atribuirmos um tipo errado a uma variável com type hint?"
    opcoes: ["O Python gera um erro na execução", "O programa não compila", "Nada — type hints não são obrigatórios em tempo de execução", "A variável é convertida automaticamente"]
    correta: 2
    explicacao: "Type hints são só anotações. O Python ignora eles na hora de rodar."
    explicacaoErrada: "Type hints não geram erros nem convertem valores. São só informativos."
  - pergunta: "Qual é a sintaxe correta para anotar uma variável?"
    opcoes: ["nome: str = 'Ana'", "str nome = 'Ana'", "nome = str('Ana')", "var nome: string = 'Ana'"]
    correta: 0
    explicacao: "A sintaxe é variável: tipo = valor. O tipo vem depois dos dois-pontos."
    explicacaoErrada: "Em Python: variável: tipo = valor. Não é como Java ou TypeScript."
  - pergunta: "Para que servem os type hints?"
    opcoes: ["Melhorar a performance", "Converter tipos automaticamente", "Documentar tipos esperados e ajudar ferramentas como IDEs e mypy", "Impedir que tipos errados sejam usados"]
    correta: 2
    explicacao: "Type hints melhoram autocomplete nas IDEs e permitem verificação com mypy."
    explicacaoErrada: "Type hints não afetam performance, não convertem tipos e não impedem erros. São para documentação e ferramentas."
---

## O que são type hints?

Type hints são etiquetas opcionais que você coloca no código para dizer qual tipo uma variável ou função espera. É como rotular uma caixa: "aqui vai texto", "aqui vai número".

O ponto mais importante: type hints **não mudam** como o programa funciona. Python continua dinâmico. As anotações servem para você, para sua IDE e para ferramentas como o mypy.

> [!info]
> Type hints são opcionais. Você pode começar sem eles e ir adicionando conforme o projeto cresce.

## Sintaxe básica em variáveis

A sintaxe é simples: `variável: tipo = valor`. O tipo vem depois dos dois-pontos:

```python
# Sem type hints
nome = "Ana"
idade = 25

# Com type hints
nome: str = "Ana"
idade: int = 25
altura: float = 1.75
ativo: bool = True
resultado: None = None
```

Funciona igualzinho com ou sem a anotação. A diferença e que sua IDE agora sabe o tipo é te ajuda com autocomplete.

## Em funções -- parâmetros e retorno

Type hints brilham de verdade em funções. Você anota os parâmetros é o retorno com `->`:

```python
def saudação(nome: str, idade: int) -> str:
    return f"Olá, {nome}! Você tem {idade} anos."

print(saudação("Ana", 22))
# → Olá, Ana! Você tem 22 anos.
```

Com valor padrão, o hint vem antes do `=`:

```python
def configurar(host: str = "localhost", porta: int = 8080) -> str:
    return f"{host}:{porta}"

print(configurar())  # → localhost:8080
```

Função que não retorna nada usa `-> None`:

```python
def exibir(texto: str) -> None:
    print(texto)
```

## Type hints são ignorados na execução

Isso é importante: o Python **não impede** você de passar o tipo errado. Ele roda normalmente:

```python
idade: int = "vinte e cinco"  # anotou int, mas e str
print(idade)  # → vinte e cinco (funciona!)

nome: str = 42  # anotou str, mas e int
print(nome)     # → 42 (funciona!)
```

> [!alerta]
> Não confie nos type hints para evitar erros. O Python roda o código normalmente mesmo com tipos "errados". Use o mypy para pegar esses problemas antes.

## Tipos para colecoes (Python 3.9+)

A partir do Python 3.9, você pode usar os tipos de colecoes diretamente:

```python
nomes: list[str] = ["Ana", "Carlos", "Maria"]
idades: dict[str, int] = {"Ana": 25, "Carlos": 30}
coordenadas: tuple[float, float] = (23.5, -46.6)
ids_unicos: set[int] = {1, 2, 3, 4}
```

| Tipo | Significado | Exemplo |
|------|-------------|---------|
| `list[str]` | Lista de strings | `["a", "b"]` |
| `dict[str, int]` | Dict com chave str e valor int | `{"x": 1}` |
| `tuple[int, int]` | Tupla com 2 inteiros | `(1, 2)` |
| `set[int]` | Conjunto de inteiros | `{1, 2, 3}` |

## Tipo opcional -- pode ser None (Python 3.10+)

Quando um valor pode ser de um tipo **ou** `None`, use `|`:

```python
nome: str | None = None

def buscar_usuario(id: int) -> str | None:
    if id == 1:
        return "Ana"
    return None

resultado = buscar_usuario(1)
print(resultado)  # → Ana

resultado = buscar_usuario(99)
print(resultado)  # → None
```

> [!info]
> Antes do Python 3.10, a sintaxe era `Optional[str]` do módulo `typing`. A partir do 3.10, `str | None` é mais limpo.

## Verificacao com mypy

O mypy é uma ferramenta que analisa seu código e encontra erros de tipo **sem precisar rodar o programa**:

```python
def saudação(nome: str) -> str:
    return f"Olá, {nome}!"

resultado: int = saudação("Ana")  # mypy aponta erro aqui
```

```bash
mypy verificar.py
# → error: Incompatible types in assignment
```

> [!sucesso]
> Com mypy você encontra erros de tipo antes de rodar o programa. Instale com `pip install mypy`.

## Exemplo prático: cadastro tipado

```python
def criar_perfil(
    nome: str,
    idade: int,
    email: str,
    ativo: bool = True
) -> dict[str, str | int | bool]:
    return {
        "nome": nome,
        "idade": idade,
        "email": email,
        "ativo": ativo
    }

perfil = criar_perfil("Ana", 22, "ana@email.com")
print(perfil)
# → {'nome': 'Ana', 'idade': 22, 'email': 'ana@email.com', 'ativo': True}
```

Cada parâmetro tem seu tipo anotado. O retorno mostra que o dicionario pode ter valores `str`, `int` ou `bool`. Quem ler a função sabe exatamente o que ela espera.

## Referências

- [typing -- Support for type hints](https://docs.python.org/3/library/typing.html) -- documentação oficial do módulo typing
- [Python Type Checking Guide](https://realpython.com/python-type-checking/) -- guia completo no Real Python
- [mypy Documentation](https://mypy.readthedocs.io/) -- documentação oficial do mypy
