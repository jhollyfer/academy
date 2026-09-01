---
slug: "first-program"
modulo: "Módulo 1 — Começando com Python"
título: "Primeiro Programa"
subtitulo: "print(), input() e comentários"
descricao: "Crie seus primeiros programas usando print(), input() e comentários."
ordem: 2
proximosPassos:
  - título: "Variáveis e Tipos de Dados"
    descricao: "Guarde informações com str, int, float, bool e None"
  - título: "Type Hints"
    descricao: "Anote tipos para deixar o código mais claro"
quiz:
  - pergunta: "Qual função exibe informações na tela?"
    opcoes: ["echo()", "print()", "console.log()", "write()"]
    correta: 1
    explicacao: "print() é a função do Python para mostrar coisas no terminal."
    explicacaoErrada: "Em Python usamos print(). echo é do shell, console.log do JavaScript."
  - pergunta: "O que input() retorna?"
    opcoes: ["Um número inteiro", "Um valor booleano", "Sempre uma string", "Depende do que o usuário digitar"]
    correta: 2
    explicacao: "input() sempre retorna string. Mesmo se digitar 42, vem '42' (texto)."
    explicacaoErrada: "input() sempre retorna string. Para ter um número, converta com int() ou float()."
  - pergunta: "Como escrevemos um comentário em Python?"
    opcoes: ["// comentário", "/* comentário */", "# comentário", "-- comentário"]
    correta: 2
    explicacao: "Comentários começam com #. Tudo depois do # na linha é ignorado."
    explicacaoErrada: "Python usa # para comentários. // é JavaScript, /* */ é C/Java, -- é SQL."
  - pergunta: "Como executamos um arquivo Python no terminal?"
    opcoes: ["run programa.py", "python programa.py", "execute programa.py", "start programa.py"]
    correta: 1
    explicacao: "O comando é python programa.py (ou python3 em alguns sistemas)."
    explicacaoErrada: "O comando correto é python programa.py."
---

## O que é o Python?

Python é uma linguagem de programação simples e poderosa. Você escreve instruções num arquivo `.py` e o computador executa linha por linha, de cima para baixo.

Para começar, você só precisa de três coisas: `print()` para mostrar algo na tela, `input()` para ler o que o usuário digita, e `#` para deixar comentários no código.

> [!info]
> Para rodar um arquivo Python, salve com extensão `.py` e execute no terminal com `python arquivo.py` (ou `python3` em alguns sistemas).

## print() -- mostrando coisas na tela

`print()` é a função mais básica do Python. Ela recebe um valor e exibe no terminal.

```python
print("Olá, mundo!")  # → Olá, mundo!
print(42)             # → 42
print(3.14)           # → 3.14
```

Você pode passar vários valores separados por vírgula. O Python coloca um espaço entre eles automaticamente:

```python
print("Nome:", "Ana", "- Idade:", 25)
# → Nome: Ana - Idade: 25
```

Dá para personalizar o separador e o final da linha:

```python
print("Python", "e", "legal", sep="-")
# → Python-e-legal

print("Carregando", end="...")
print("Pronto!")
# → Carregando...Pronto!
```

| Parâmetro | O que faz | Padrão |
|-----------|-----------|--------|
| `sep` | Separador entre os valores | `" "` (espaço) |
| `end` | O que vem no final da linha | `"\n"` (quebra de linha) |

## Comentários com #

Comentários são anotações no código que o Python ignora completamente. Servem para você (e para quem for ler depois) entender o que aquele trecho faz.

```python
# Isto é um comentário -- Python ignora tudo depois do #
print("Olá")  # Comentario ao lado do código

# Desativar uma linha temporariamente:
# print("Esta linha não roda")
```

> [!info]
> Use comentários para explicar o **porque**, não o **o que**. O código já mostra o que ele faz -- o comentário explica a intenção.

## input() -- lendo dados do usuário

`input()` pausa o programa e espera o usuário digitar algo. O que ele digitar volta como **string** (texto).

```python
nome = input("Qual é o seu nome? ")
print("Olá,", nome)
# Qual é o seu nome? Maria
# → Olá, Maria
```

Mesmo que o usuário digite um número, `input()` retorna texto:

```python
idade = input("Sua idade? ")
print(type(idade))  # → <class 'str'>
```

> [!alerta]
> `input()` **sempre** retorna string. Se você digitar `42`, vem `"42"` (texto). Para fazer contas, converta com `int()` ou `float()`.

## Convertendo a entrada do usuário

Para trabalhar com números vindos do `input()`, você precisa converter antes de usar:

```python
idade = int(input("Sua idade? "))
print("Ano que vem:", idade + 1)
# Sua idade? 20
# → Ano que vem: 21

altura = float(input("Sua altura em metros? "))
print("Altura:", altura)
# Sua altura em metros? 1.75
# → Altura: 1.75
```

## f-strings -- texto com variáveis

O `f` antes das aspas cria uma **f-string**. Ela permite colocar variáveis e expressoes dentro do texto usando `{}`:

```python
nome = "Ana"
idade = 22
print(f"Meu nome é {nome} e tenho {idade} anos")
# → Meu nome é Ana e tenho 22 anos
```

## Erros comuns

```python
# Somar string com número
idade = input("Idade: ")    # retorna string
# print(idade + 1)          # TypeError!

# Correto: converter antes
idade = int(input("Idade: "))
print(idade + 1)             # → funciona!

# Esquecer os parênteses
# print "Olá"               # SyntaxError!

# Correto: sempre usar parênteses
print("Olá")                 # → Olá
```

## Exemplo prático: conversor de temperatura

```python
# conversor.py

celsius = float(input("Temperatura em Celsius: "))

# Formula: F = C x 9/5 + 32
fahrenheit = celsius * 9 / 5 + 32

print(f"{celsius}°C = {fahrenheit}°F")
# Temperatura em Celsius: 100
# → 100.0°C = 212.0°F
```

`celsius` vem do `input()` e precisa de `float()` porque temperatura pode ter decimais. A f-string monta o resultado final de forma legivel.

## Referências

- [Built-in Functions: print()](https://docs.python.org/3/library/functions.html#print) -- documentação oficial do print()
- [Built-in Functions: input()](https://docs.python.org/3/library/functions.html#input) -- documentação oficial do input()
- [Curso Python #03 - Primeiro Programa](https://www.youtube.com/watch?v=RWRnIGo-qMc) -- Curso em Video, PT-BR
