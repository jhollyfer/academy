---
slug: "functions-basics"
modulo: "Módulo 5 — Funções"
título: "Funções — Fundamentos"
subtitulo: "Crie funções com def, type hints é parâmetros"
descricao: "Aprenda a criar funções com def, tipos de retorno, valores padrão e keyword arguments."
ordem: 14
proximosPassos:
  - título: "Funções Avançadas"
    descricao: "Lambda, callbacks, recursão e boas práticas"
  - título: "Desafio: Par ou Ímpar"
    descricao: "Pratique funções classificando números pares é ímpares"
quiz:
  - pergunta: "Qual a sintaxe correta para uma função com type hints?"
    opcoes: ["function soma(a: int, b: int) -> int:", "def soma(a: int, b: int) -> int:", "def soma(int a, int b) -> int:", "func soma(a int, b int) int:"]
    correta: 1
    explicacao: "Em Python: def + type hints com : tipo + retorno com -> tipo."
    explicacaoErrada: "A sintaxe usa def, : para tipos dos parâmetros e -> para retorno."
  - pergunta: "O que acontece ao chamar saudar('Carlos') se a função é def saudar(nome: str, saudação: str = 'Olá') -> str?"
    opcoes: ["Erro — falta um argumento", "Retorna 'Olá, Carlos' usando o valor padrão", "Retorna None", "Retorna apenas 'Carlos'"]
    correta: 1
    explicacao: "saudação tem valor padrão 'Olá', então pode ser omitido."
    explicacaoErrada: "Parâmetros com valor padrão são opcionais."
  - pergunta: "O que indica -> float na definição de uma função?"
    opcoes: ["Que a função recebe um float", "Que a função retorna um valor do tipo float", "Que a função converte tudo para float", "É apenas um comentário decorativo"]
    correta: 1
    explicacao: "A seta -> indica o tipo do valor que a função retorna."
    explicacaoErrada: "-> indica o tipo de RETORNO, não de entrada."
  - pergunta: "O que são keyword arguments?"
    opcoes: ["Argumentos que só aceitam palavras-chave do Python", "Argumentos passados pelo nome do parâmetro, não pela posição", "Argumentos que são obrigatórios", "Argumentos que só aceitam strings"]
    correta: 1
    explicacao: "São argumentos passados pelo nome, tipo calcular(salário=5000)."
    explicacaoErrada: "Keyword arguments = passar pelo nome do parâmetro, não pela ordem."
---

## O que é uma função?

Função é um bloco de código com nome que você define uma vez e usa quantas vezes precisar. Em vez de copiar e colar o mesmo trecho, você chama a função pelo nome.

Funções organizam o código em pedacos menores, facilitam a reutilização e tornam tudo mais fácil de testar. Toda função em Python começa com `def`, seguida do nome, dos parâmetros entre parênteses e de dois pontos.

> [!info]
> Use type hints para documentar o que a função recebe e retorna. Não são obrigatorios, mas ajudam muito.

## Função simples sem retorno

Quando a função só executa algo (como imprimir), o retorno e `None`:

```python
def saudar() -> None:
    print("Olá, bem-vindo ao curso!")

saudar()  # → Olá, bem-vindo ao curso!
```

## Função com parâmetros e retorno

Use type hints nos parâmetros (`: tipo`) e no retorno (`-> tipo`):

```python
def somar(a: int, b: int) -> int:
    return a + b

resultado: int = somar(3, 5)
print(resultado)  # → 8
```

```python
def calcular_media(notas: list[float]) -> float:
    return sum(notas) / len(notas)

média: float = calcular_media([8.5, 7.0, 9.2])
print(f"Media: {média:.1f}")  # → Media: 8.2
```

```python
def e_aprovado(nota: float) -> bool:
    return nota >= 7.0

print(e_aprovado(8.5))  # → True
print(e_aprovado(5.0))  # → False
```

## Valores padrão

Parâmetros com valor padrão se tornam opcionais na chamada:

```python
def saudar(nome: str, saudação: str = "Olá") -> str:
    return f"{saudação}, {nome}!"

print(saudar("Ana"))               # → Olá, Ana!
print(saudar("Bruno", "Bom dia"))  # → Bom dia, Bruno!
```

```python
def calcular_desconto(preco: float, percentual: float = 10.0) -> float:
    desconto: float = preco * (percentual / 100)
    return preco - desconto

print(calcular_desconto(100.0))        # → 90.0 (desconto padrão 10%)
print(calcular_desconto(100.0, 25.0))  # → 75.0 (desconto 25%)
```

> [!alerta]
> Parâmetros com valor padrão devem vir depois dos obrigatorios. `def função(a, b=10)` funciona. `def função(b=10, a)` da erro.

## Keyword arguments

Você pode passar argumentos pelo nome, sem se preocupar com a ordem:

```python
def criar_perfil(nome: str, idade: int, cidade: str = "Manaus") -> str:
    return f"{nome}, {idade} anos, mora em {cidade}"

print(criar_perfil("Ana", 25))
# → Ana, 25 anos, mora em Manaus

print(criar_perfil(idade=30, nome="Bruno", cidade="São Paulo"))
# → Bruno, 30 anos, mora em São Paulo
```

## Retornando multiplos valores

Python permite retornar vários valores de uma vez usando tupla:

```python
def calcular_estatisticas(notas: list[float]) -> tuple[float, float, float]:
    média: float = sum(notas) / len(notas)
    maior: float = max(notas)
    menor: float = min(notas)
    return média, maior, menor

média, maior, menor = calcular_estatisticas([8.5, 7.0, 9.2, 6.8])
print(f"Media: {média:.1f}")  # → Media: 7.9
print(f"Maior: {maior}")      # → Maior: 9.2
print(f"Menor: {menor}")      # → Menor: 6.8
```

> [!info]
> O `return média, maior, menor` cria uma tupla automaticamente. Na chamada, você desestrutura com `a, b, c = função()`.

## Exercício prático

Crie funções para um sistema de notas:

1. `calcular_media(notas)` -- recebe lista de float, retorna a média
2. `classificar(média)` -- retorna "Aprovado" se >= 7, senao "Reprovado"
3. `exibir_resultado(nome, notas)` -- usa as outras duas e imprime o resultado

```python
# 1. def calcular_media(notas: list[float]) -> float:

# 2. def classificar(média: float) -> str:

# 3. def exibir_resultado(nome: str, notas: list[float]) -> None:

# Teste:
# exibir_resultado("Ana", [8.5, 7.0, 9.2])
# → Ana: 8.2 - Aprovado
```

> [!sucesso]
> Se você consegue quebrar um problema em funções menores, já está aplicando o princípio de responsabilidade única. Na próxima aula, vamos ver lambda, callbacks e recursão.

## Referências

- [Definindo funções](https://docs.python.org/pt-br/3/tutorial/controlflow.html#defining-functions) -- documentação oficial Python
- [Defining Your Own Python Function](https://realpython.com/defining-your-own-python-function/) -- guia completo no Real Python
- [Curso Python #16 - Funções (Parte 1)](https://www.youtube.com/watch?v=ezfr9d7wd_k) -- Curso em Video
