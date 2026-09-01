---
slug: "switch-combining"
modulo: "Módulo 3 — Controle de Fluxo"
título: "switch/case e Operadores Lógicos"
subtitulo: "Comparando valores fixos e combinando condições"
descricao: "switch/case, operadores lógicos (&&, ||, !) e guard clauses."
ordem: 7
proximosPassos:
  - título: "Loops"
    descricao: "Repita ações automaticamente"
  - título: "Arrays"
    descricao: "Agrupe dados em listas"
quiz:
  - pergunta: "Quando usar switch em vez de if/else if?"
    opcoes: ["Quando há apenas 2 opções", "Quando há muitos valores fixos para comparar", "Quando a condição usa maior/menor", "Nunca, switch é obsoleto"]
    correta: 1
    explicacao: "✓ switch brilha quando você compara uma variável contra vários valores fixos."
    explicacaoErrada: "✗ switch é para valores fixos. Para >, <, >=, use if/else."
  - pergunta: "O que o operador && (E) retorna?"
    opcoes: ["true se pelo menos uma condição for verdadeira", "true se ambas as condições forem verdadeiras", "true se ambas forem falsas", "Sempre true"]
    correta: 1
    explicacao: "✓ && só retorna true quando AMBAS são verdadeiras."
    explicacaoErrada: "✗ && exige que as duas sejam verdadeiras. Para 'pelo menos uma', use ||."
  - pergunta: "O que faz o operador ! (NÃO)?"
    opcoes: ["Compara dois valores", "Inverte o valor booleano", "Multiplica por -1", "Verifica se é nulo"]
    correta: 1
    explicacao: "✓ ! inverte: !true vira false, !false vira true."
    explicacaoErrada: "✗ ! é a negação — inverte true para false e vice-versa."
  - pergunta: "O que é uma guard clause?"
    opcoes: ["Um tipo de loop", "Um retorno antecipado que elimina aninhamento", "Uma variável de proteção", "Um operador lógico"]
    correta: 1
    explicacao: "✓ Guard clauses testam condições de saída primeiro e retornam imediatamente."
    explicacaoErrada: "✗ Guard clauses são retornos antecipados para evitar aninhamento."
---

## switch/case --- comparando valores fixos

Pense no `switch` como uma máquina de refrigerante. Você aperta o botão (valor) e ela entrega o resultado correspondente.

Quando você tem muitos `else if` comparando a mesma variável, o `switch` fica mais limpo:

```typescript
const dia: string = "segunda";

switch (dia) {
  case "sábado":
  case "domingo":
    console.log("Fim de semana!");  // → (não executa)
    break;
  case "segunda":
  case "quarta":
  case "sexta":
    console.log("Dia de aula");     // → Dia de aula
    break;
  default:
    console.log("Dia útil normal");
}
```

Cada `case` compara o valor. O `break` encerra o switch. O `default` funciona como o `else`.

> [!alerta]
> Não esqueça o `break`! Sem ele, o código "cai" para o próximo case (fall-through). Às vezes isso é útil (como agrupar sábado e domingo), mas geralmente é bug.

Outro exemplo — menu de opções:

```typescript
const opção: number = 2;

switch (opção) {
  case 1:
    console.log("Cadastrar aluno");
    break;
  case 2:
    console.log("Consultar notas"); // → Consultar notas
    break;
  case 3:
    console.log("Gerar relatório");
    break;
  default:
    console.log("Opção inválida");
}
```

> [!sucesso]
> Use `switch` para valores fixos (dias da semana, opções de menu). Para comparações com `>`, `<`, `>=`, use `if/else`.

## Operadores lógicos

Combinam condições. Pense assim:
- `&&` (E) — as duas precisam ser verdadeiras
- `||` (OU) — basta uma ser verdadeira
- `!` (NÃO) — inverte o valor

| Operador | Nome | Resultado |
| -------- | ---- | --------- |
| `&&`     | E    | `true` se **ambos** forem true |
| `\|\|`   | OU   | `true` se **pelo menos um** for true |
| `!`      | NÃO  | Inverte o booleano |

```typescript
const idade: number = 20;
const temCarteira: boolean = true;

const podeConduzir = idade >= 18 && temCarteira; // → true
const podeEntrar = idade >= 18 || temCarteira;    // → true
const menorIdade = !(idade >= 18);                // → false
```

### Combinando operadores

Use parênteses para deixar claro o que vem primeiro:

```typescript
const idade: number = 25;
const temIngresso: boolean = true;
const ehVIP: boolean = false;

if ((idade >= 18 && temIngresso) || ehVIP) {
  console.log("Entrada permitida"); // → Entrada permitida
}
```

Traduzindo: maior de idade COM ingresso, OU VIP.

> [!alerta]
> Sempre use parênteses ao misturar `&&` e `||`. Sem eles, `&&` tem prioridade é o resultado pode te surpreender.

### Exemplo prático

```typescript
const chovendo: boolean = false;
const temGuardaChuva: boolean = true;

if (!chovendo || temGuardaChuva) {
  console.log("Pode sair"); // → Pode sair
}

const logado: boolean = false;

if (!logado) {
  console.log("Faça login"); // → Faça login
}
```

## Guard clauses --- retorno antecipado

Em vez de aninhar vários `if/else`, teste os casos de saída primeiro e retorne logo:

```typescript
function verificarAcesso(idade: number, temIngresso: boolean): string {
  if (idade < 18) return "Proibido para menores";
  if (!temIngresso) return "Compre seu ingresso";
  return "Acesso liberado!";
}
```

Compare com a versão aninhada:

```typescript
// Versão aninhada — mais difícil de ler
function verificarAcesso(idade: number, temIngresso: boolean): string {
  if (idade >= 18) {
    if (temIngresso) {
      return "Acesso liberado!";
    } else {
      return "Compre seu ingresso";
    }
  } else {
    return "Proibido para menores";
  }
}
```

Mesmo resultado, mas guard clauses são mais fáceis de ler e estender.

> [!sucesso]
> Se pode sair cedo da função, saia. Trate os casos ruins primeiro e deixe o "caminho feliz" no final.

### Mais exemplos

```typescript
function calcularDesconto(preco: number, cupom: string): number {
  if (preco <= 0) return 0;
  if (cupom === "") return preco;
  if (cupom === "METADE") return preco * 0.5;
  if (cupom === "DEZ") return preco - 10;
  return preco; // cupom inválido
}

function podeVotar(idade: number, tituloAtivo: boolean): string {
  if (idade < 16) return "Não pode votar";
  if (!tituloAtivo) return "Regularize seu título";
  if (idade < 18 || idade > 70) return "Voto facultativo";
  return "Voto obrigatório";
}
```

## Resumo: quando usar cada técnica

| Situação | Use |
| -------- | --- |
| Muitos valores fixos | `switch/case` |
| Combinar condições | `&&`, `\|\|`, `!` |
| Validações antes da lógica principal | Guard clauses |
| Mais de 2 níveis de aninhamento | Refatore com guard clauses |

## Referências

- [switch - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/switch) — documentação oficial do switch/case com exemplos de fall-through e default
- [JavaScript Switch Statement - W3Schools](https://www.w3schools.com/js/js_switch.asp) — tutorial interativo sobre switch/case e quando usá-lo
- [Switch Case em JavaScript - Curso em Vídeo](https://www.youtube.com/watch?v=HB1aPYPPJ24) — vídeo explicando switch/case e combinação com operadores lógicos
