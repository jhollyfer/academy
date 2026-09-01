---
slug: "lists-basics"
modulo: "Módulo 4 — Estruturas de Dados"
título: "Listas — Fundamentos"
subtitulo: "Crie, acesse e modifique listas em Python"
descricao: "Aprenda a criar listas, acessar por índice, fatiar com slicing e usar append, pop, remove."
ordem: 12
proximosPassos:
  - título: "Métodos Funcionais com Listas"
    descricao: "Use filter, map e sorted para processar dados"
  - título: "Funções — Fundamentos"
    descricao: "Crie funções com def, type hints é parâmetros"
quiz:
  - pergunta: "Qual é o resultado de lista[-1] para lista = [10, 20, 30, 40]?"
    opcoes: ["10", "40", "30", "Erro — índice negativo não existe"]
    correta: 1
    explicacao: "Índice -1 é o último elemento: 40."
    explicacaoErrada: "Em Python, -1 acessa o último elemento da lista."
  - pergunta: "O que retorna números[1:4] para números = [5, 10, 15, 20, 25]?"
    opcoes: ["[5, 10, 15]", "[10, 15, 20]", "[10, 15, 20, 25]", "[5, 10, 15, 20]"]
    correta: 1
    explicacao: "Slicing [1:4] pega índice 1 até 3 (o 4 não entra): [10, 15, 20]."
    explicacaoErrada: "No slicing, o fim não é incluso. [1:4] = índices 1, 2, 3."
  - pergunta: "Qual é a diferença entre append() e insert()?"
    opcoes: ["append() remove e insert() adiciona", "append() adiciona no final, insert() adiciona em posição específica", "São sinônimos — fazem a mesma coisa", "append() adiciona no início, insert() no final"]
    correta: 1
    explicacao: "append(valor) = final. insert(posição, valor) = onde você quiser."
    explicacaoErrada: "append() vai para o final, insert() vai na posição que você escolher."
  - pergunta: "Como verificar se o valor 7 existe na lista números?"
    opcoes: ["números.contains(7)", "números.has(7)", "7 in números", "números.exists(7)"]
    correta: 2
    explicacao: "O operador in verifica se um valor está na lista."
    explicacaoErrada: "Em Python, use o operador in: '7 in números'."
---

## O que é uma lista?

Lista e a estrutura de dados mais usada em Python. Pense nela como uma gaveta com divisorias numeradas. Cada divisoria guarda um item e tem um índice que começa em zero.

Listas são mutáveis, ou seja, você pode adicionar, remover e alterar itens depois de criar. Dá para guardar qualquer tipo: números, textos, booleanos, até outras listas.

> [!info]
> Use type hints como `list[int]` para deixar claro o tipo dos elementos.

## Criando listas

```python
números: list[int] = [1, 2, 3, 4, 5]
nomes: list[str] = ["Ana", "Bruno", "Carla"]
tarefas: list[str] = []  # lista vazia
```

`list[int]` = lista de inteiros. `list[str]` = lista de strings.

## Acessando elementos (índice começa em 0)

Cada item tem uma posição (índice), começando do 0:

```python
frutas: list[str] = ["maçã", "banana", "laranja", "uva", "manga"]

print(frutas[0])    # → "maçã" (primeiro)
print(frutas[-1])   # → "manga" (ultimo)
print(frutas[-2])   # → "uva" (penultimo)
print(len(frutas))  # → 5
```

Visualizando:

```
Índice:   0        1         2        3       4
Valor:  "maçã"  "banana"  "laranja"  "uva"  "manga"
```

> [!alerta]
> `frutas[10]` da `IndexError`. Diferente de TypeScript, Python **não** retorna `None` silenciosamente.

## Slicing -- fatiando a lista

Com `lista[início:fim:passo]`, você pega pedacos da lista. O início e incluso, o fim **não**:

```python
números: list[int] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

print(números[2:5])   # → [20, 30, 40]
print(números[:4])    # → [0, 10, 20, 30]
print(números[6:])    # → [60, 70, 80, 90]
print(números[::2])   # → [0, 20, 40, 60, 80]
print(números[::-1])  # → [90, 80, 70, ..., 0] (invertida!)
```

## Modificando valores

Basta atribuir direto no índice:

```python
notas: list[float] = [8.5, 7.0, 9.2, 6.8]
notas[1] = 7.5
print(notas)  # → [8.5, 7.5, 9.2, 6.8]
```

## Adicionando elementos

```python
frutas: list[str] = ["maçã", "banana"]
frutas.append("laranja")        # adiciona no final
frutas.insert(0, "uva")         # adiciona na posição 0
print(frutas)  # → ["uva", "maçã", "banana", "laranja"]
```

## Removendo elementos

```python
frutas: list[str] = ["maçã", "banana", "laranja", "uva"]

ultimo: str = frutas.pop()      # remove e retorna o ultimo
segundo: str = frutas.pop(1)    # remove e retorna o índice 1
frutas.remove("laranja")        # remove pelo valor (sem retorno)
```

| Método     | O que faz                 | Retorna             |
| ---------- | ------------------------- | ------------------- |
| `append()` | Adiciona no final         | None                |
| `insert()` | Adiciona em posição X     | None                |
| `pop()`    | Remove por posição        | Elemento removido   |
| `remove()` | Remove por valor          | None                |

> [!alerta]
> `pop()` remove por posição e retorna o item. `remove()` remove por valor é não retorna nada. Se o valor não existir, `remove()` da erro.

## Verificando se existe

O operador `in` checa se um valor está na lista:

```python
cores: list[str] = ["vermelho", "azul", "verde"]

print("azul" in cores)      # → True
print("roxo" not in cores)  # → True
```

Para encontrar a posição:

```python
animais: list[str] = ["gato", "cachorro", "peixe"]
print(animais.index("cachorro"))  # → 1
```

## Percorrendo listas

Com `for` (mais limpo):

```python
alunos: list[str] = ["Ana", "Bob", "Carlos"]

for aluno in alunos:
    print(f"Aluno: {aluno}")
# → Aluno: Ana
# → Aluno: Bob
# → Aluno: Carlos
```

Com `enumerate` (quando precisa do índice):

```python
for i, aluno in enumerate(alunos, start=1):
    print(f"{i}. {aluno}")
# → 1. Ana
# → 2. Bob
# → 3. Carlos
```

## Exercício prático

Dada uma lista de notas:

1. Calcule a média (soma / tamanho)
2. Filtre os aprovados (nota >= 7) usando um loop
3. Encontre a maior e a menor nota

```python
notas: list[float] = [8.5, 6.0, 9.2, 4.5, 7.0, 5.5, 8.0, 3.0]

# 1. Some tudo com for, divida por len(notas)

# 2. Crie uma lista vazia e use append para notas >= 7

# 3. Use for para achar a maior é menor
```

> [!sucesso]
> Na próxima aula, você vai aprender métodos funcionais como `filter()` e `map()` para fazer isso em uma linha só.

## Referências

- [Listas](https://docs.python.org/pt-br/3/tutorial/datastructures.html#more-on-lists) -- documentação oficial Python
- [Lists and Tuples in Python](https://realpython.com/python-lists-tuples/) -- guia completo no Real Python
- [Curso Python #14 - Listas (Parte 1)](https://www.youtube.com/watch?v=nIHq1MtJaKs) -- Curso em Video
