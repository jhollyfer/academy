---
slug: "list-comprehension"
modulo: "Módulo 3 — Estruturas de Controle"
título: "List Comprehension"
subtitulo: "Crie listas em uma linha só"
descricao: "Aprenda a criar e filtrar listas de forma rápida usando list comprehension."
ordem: 11
proximosPassos:
  - título: "Listas — Fundamentos"
    descricao: "Aprenda a criar, acessar e modificar listas"
  - título: "Métodos Funcionais com Listas"
    descricao: "Use filter, map e sorted para processar dados"
quiz:
  - pergunta: "Qual é a sintaxe correta de list comprehension?"
    opcoes: ["[for x in lista: x * 2]", "[x * 2 for x in lista]", "list(x * 2, for x in lista)", "[x * 2 in lista for x]"]
    correta: 1
    explicacao: "A expressão vem primeiro, depois o for: [x * 2 for x in lista]."
    explicacaoErrada: "A expressão vem antes do for: [x * 2 for x in lista]."
  - pergunta: "Como filtrar só números pares com list comprehension?"
    opcoes: ["[x for x in lista if x % 2 == 0]", "[x % 2 == 0 for x in lista]", "[if x % 2 == 0 for x in lista]", "[x for x in lista where x % 2 == 0]"]
    correta: 0
    explicacao: "O if vem no final: [x for x in lista if x % 2 == 0]."
    explicacaoErrada: "Para filtrar, o if vai no final. E Python não tem where."
  - pergunta: "Qual o equivalente com for tradicional?"
    opcoes: ["resultado = lista.map(lambda x: x * 2)", "resultado = []; for x in lista: resultado += x * 2", "resultado = []\nfor x in lista:\n    resultado.append(x * 2)", "resultado = for x in lista: x * 2"]
    correta: 2
    explicacao: "O padrão tradicional: lista vazia + for + append."
    explicacaoErrada: "O equivalente usa lista vazia + for + append."
  - pergunta: "O que produz {x: x**2 for x in range(4)}?"
    opcoes: ["[0, 1, 4, 9]", "{0: 0, 1: 1, 2: 4, 3: 9}", "{0, 1, 4, 9}", "Erro de sintaxe"]
    correta: 1
    explicacao: "Com chaves e chave: valor, cria um dicionário."
    explicacaoErrada: "Chaves {} com chave: valor = dicionário, não lista."
---

## O que é list comprehension?

List comprehension é o jeito pythonico de criar listas. Em vez de escrever um loop inteiro com append, você faz tudo em uma linha só. A ideia é simples: a expressao vem primeiro, depois o for, é um if opcional no final para filtrar.

Se você já sabe usar for e append, list comprehension e apenas um atalho mais limpo para mesma coisa.

> [!info]
> A sintaxe básica e `[expressao for variável in iterável]`. O if no final é opcional.

## Comprehension básica

A expressao vem primeiro, depois o `for`:

```python
quadrados: list[int] = [x ** 2 for x in range(1, 6)]
print(quadrados)  # → [1, 4, 9, 16, 25]
```

```python
# Convertendo temperaturas
celsius: list[float] = [0, 20, 37, 100]
fahrenheit: list[float] = [(c * 9/5) + 32 for c in celsius]
print(fahrenheit)  # → [32.0, 68.0, 98.6, 212.0]
```

## Comprehension com filtro

O `if` no final filtra quem entra na lista:

```python
números: list[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pares: list[int] = [x for x in números if x % 2 == 0]
print(pares)  # → [2, 4, 6, 8, 10]
```

## Comprehension com if/else (ternário)

Quando o `if/else` vem **antes** do `for`, você escolhe entre dois valores:

```python
valores: list[int] = [10, -3, 5, -7, 8]
positivos: list[int] = [x if x > 0 else 0 for x in valores]
print(positivos)  # → [10, 0, 5, 0, 8]
```

> [!alerta]
> `if` depois do for = filtro (só passa quem atende a condição). `if/else` antes do for = escolha entre dois valores. Se a comprehension ficou dificil de ler, use for tradicional.

## For tradicional vs comprehension

O mesmo resultado, duas formas de escrever:

```python
# For tradicional (4 linhas)
resultado: list[int] = []
for x in range(1, 11):
    if x % 2 == 0:
        resultado.append(x ** 2)

# List comprehension (1 linha)
resultado: list[int] = [x ** 2 for x in range(1, 11) if x % 2 == 0]
print(resultado)  # → [4, 16, 36, 64, 100]
```

## Dict e set comprehension

A mesma lógica funciona com `{}` para criar dicionarios e sets:

```python
# Dict comprehension — chave: valor
palavras: list[str] = ["python", "e", "incrivel"]
tamanhos: dict[str, int] = {p: len(p) for p in palavras}
print(tamanhos)  # → {'python': 6, 'e': 1, 'incrivel': 8}
```

```python
# Set comprehension — valores unicos
números: list[int] = [1, 2, 2, 3, 3, 3, 4]
unicos: set[int] = {x for x in números}
print(unicos)  # → {1, 2, 3, 4}
```

## Exercício prático

Dada uma lista de palavras, use list comprehension para:

1. Criar uma lista só com palavras que tem mais de 4 letras
2. Criar uma lista com todas as palavras em maiusculo
3. Criar um dicionario `{palavra: tamanho}`

```python
palavras: list[str] = ["sol", "computador", "lua", "programação", "py", "dados"]

# 1. [p for p in palavras if len(p) > 4]

# 2. [p.upper() for p in palavras]

# 3. {p: len(p) for p in palavras}
```

> [!sucesso]
> Se você consegue transformar um `for` com `append` em uma list comprehension, já está pensando de forma pythonica.

## Referências

- [List Comprehensions](https://docs.python.org/pt-br/3/tutorial/datastructures.html#list-comprehensions) -- documentação oficial Python
- [When to Use a List Comprehension in Python](https://realpython.com/list-comprehension-python/) -- guia completo no Real Python
- [Curso Python #15 - Listas (Parte 2)](https://www.youtube.com/watch?v=_sREBNv0hVo) -- Curso em Video
