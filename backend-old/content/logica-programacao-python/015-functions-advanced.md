---
slug: "functions-advanced"
modulo: "Módulo 5 — Funções"
título: "Funções Avançadas"
subtitulo: "Lambda, callbacks, recursão e boas práticas"
descricao: "Domine lambda, funções como parâmetros, recursão e responsabilidade única."
ordem: 15
proximosPassos:
  - título: "Desafio: Par ou Ímpar"
    descricao: "Pratique funções classificando números pares é ímpares"
  - título: "Desafio: Tabuada"
    descricao: "Gere tabuadas com loops e formatação de texto"
quiz:
  - pergunta: "Qual é a sintaxe correta de uma função lambda?"
    opcoes: ["lambda: x => x * 2", "lambda x: x * 2", "def lambda(x): return x * 2", "(x) -> x * 2"]
    correta: 1
    explicacao: "A sintaxe é: lambda parâmetros: expressão."
    explicacaoErrada: "Lambda em Python: lambda parâmetros: expressão. Sem setas ou def."
  - pergunta: "Qual é o caso base na recursão do fatorial?"
    opcoes: ["fatorial(n) == n", "n == 1 ou n == 0", "n == -1", "Não precisa de caso base"]
    correta: 1
    explicacao: "Quando n é 0 ou 1, retorna 1. Sem isso, a recursão nunca para."
    explicacaoErrada: "Toda recursão precisa de caso base. No fatorial: n == 0 ou n == 1."
  - pergunta: "O que é o Princípio de Responsabilidade Única (SRP)?"
    opcoes: ["Cada arquivo deve ter apenas uma função", "Cada função deve fazer apenas uma coisa bem feita", "Cada variável deve ser usada apenas uma vez", "Cada classe deve ter apenas um método"]
    correta: 1
    explicacao: "Cada função faz uma coisa e faz bem."
    explicacaoErrada: "SRP = cada função tem UMA responsabilidade."
  - pergunta: "O que significa passar uma função como parâmetro?"
    opcoes: ["Executar a função antes de passá-lá", "Enviar o código fonte como texto", "Passar a referência da função para outra função usar", "Criar uma cópia da função"]
    correta: 2
    explicacao: "Funções são objetos. Você passa a referência (sem parênteses) para outra função."
    explicacaoErrada: "Passar função = enviar a referência dela para outra função executar."
---

## O que são funções avancadas?

Lambda é uma função anônima que cabe em uma linha. Você usa quando precisa de algo rápido, geralmente como argumento de outra função. Além de lambda, Python permite passar funções como parâmetros (callbacks) e até fazer funções que chamam a si mesmas (recursão).

O conceito mais importante desta aula é o Princípio de Responsabilidade Única: cada função faz uma coisa só. Isso deixa o código mais fácil de testar e manter.

> [!info]
> Se a lambda ficou complicada, use `def`. Lambda deve ser simples e curta.

## Lambda -- função mini em uma linha

A sintaxe é `lambda parâmetros: expressao`. Sem `def`, sem `return`, sem nome:

```python
dobrar = lambda x: x * 2
print(dobrar(5))  # → 10
```

Lambda brilha como argumento de outras funções:

```python
números: list[int] = [5, 2, 8, 1, 9, 3]

ordenados: list[int] = sorted(números, key=lambda x: -x)
print(ordenados)  # → [9, 8, 5, 3, 2, 1]

maiores: list[int] = list(filter(lambda x: x > 5, números))
print(maiores)  # → [8, 9]

quadrados: list[int] = list(map(lambda x: x ** 2, números))
print(quadrados)  # → [25, 4, 64, 1, 81, 9]
```

## Lambda com multiplos parâmetros

Dá para usar mais de um parâmetro:

```python
alunos: list[tuple[str, float]] = [("Ana", 8.5), ("Bruno", 7.0), ("Carla", 9.2)]
por_nota: list[tuple[str, float]] = sorted(alunos, key=lambda a: a[1], reverse=True)
print(por_nota)  # → [('Carla', 9.2), ('Ana', 8.5), ('Bruno', 7.0)]
```

## Funções como parâmetros (callbacks)

Em Python, funções são objetos. Você pode passar uma função como argumento de outra:

```python
def aplicar_operacao(a: float, b: float, operação) -> float:
    return operação(a, b)

soma: float = aplicar_operacao(10, 5, lambda a, b: a + b)
print(f"Soma: {soma}")  # → Soma: 15

mult: float = aplicar_operacao(10, 5, lambda a, b: a * b)
print(f"Multiplicação: {mult}")  # → Multiplicação: 50
```

## Callback com Callable tipado

Para tipar corretamente o parâmetro que recebe uma função, use `Callable`:

```python
from typing import Callable

def processar_lista(
    números: list[float],
    transformar: Callable[[float], float]
) -> list[float]:
    return [transformar(n) for n in números]

valores: list[float] = [10, 20, 30, 40, 50]
dobrados: list[float] = processar_lista(valores, lambda x: x * 2)
print(dobrados)  # → [20, 40, 60, 80, 100]
```

> [!info]
> `Callable[[float], float]` significa: recebe um `float` e retorna um `float`. O primeiro item e a lista de tipos dos parâmetros, o segundo é o tipo de retorno.

## Recursão -- função que chama a si mesma

Toda recursão precisa de duas coisas: um **caso base** (quando parar) é um **caso recursivo** (chamar com dado menor):

```python
def fatorial(n: int) -> int:
    if n == 0 or n == 1:  # caso base
        return 1
    return n * fatorial(n - 1)  # caso recursivo

print(fatorial(5))  # → 120 (5 * 4 * 3 * 2 * 1)
```

> [!alerta]
> Python tem limite de cerca de 1000 chamadas recursivas. Para problemas grandes, prefira loops. Toda recursão precisa de caso base, senao entra em loop infinito.

## Responsabilidade Única (SRP)

Cada função faz UMA coisa. Compare:

```python
# Ruim — faz tudo junto
def processar_aluno(nome: str, notas: list[float]) -> None:
    média = sum(notas) / len(notas)
    status = "Aprovado" if média >= 7 else "Reprovado"
    print(f"{nome}: {média:.1f} - {status}")
```

```python
# Bom — cada função tem seu papel
def calcular_media(notas: list[float]) -> float:
    return sum(notas) / len(notas)

def classificar(média: float) -> str:
    return "Aprovado" if média >= 7.0 else "Reprovado"

def exibir_resultado(nome: str, média: float, status: str) -> None:
    print(f"{nome}: {média:.1f} - {status}")
```

## Exercício prático

Crie um mini sistema de calculadora usando callbacks:

1. Uma função `calcular(a, b, operação)` que recebe dois números é uma função
2. Lambdas para soma, subtração, multiplicação e divisão
3. Use `Callable` para tipar o parâmetro `operação`

```python
from typing import Callable

# 1. def calcular(a: float, b: float, operação: Callable[[float, float], float]) -> float:

# 2. Teste com lambdas:
# calcular(10, 3, lambda a, b: a + b)  → 13
# calcular(10, 3, lambda a, b: a - b)  → 7
# calcular(10, 3, lambda a, b: a * b)  → 30
# calcular(10, 3, lambda a, b: a / b)  → 3.33
```

> [!sucesso]
> Se você consegue passar funções como argumentos e entende recursão, já domina os conceitos avancados de funções em Python.

## Referências

- [Lambda Expressions](https://docs.python.org/pt-br/3/tutorial/controlflow.html#lambda-expressions) -- documentação oficial Python
- [Recursion in Python](https://realpython.com/python-recursion/) -- guia completo no Real Python
- [Curso Python #16 - Funções (Parte 2)](https://www.youtube.com/watch?v=etjJ_4Eney0) -- Curso em Video
