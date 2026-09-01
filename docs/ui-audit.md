# Auditoria visual — Maiyu Academy

Estado da camada visual depois da migração para o sistema do shadcn. Este
arquivo é a referência de quem for mexer em cor, superfície ou CTA; o diário da
migração, com o que estava quebrado antes, está em
[`MIGRACAO-TEMA-ESTADO.md`](MIGRACAO-TEMA-ESTADO.md).

## As três regras

1. **`src/components/ui/` é território do shadcn.** Nunca editar. O próximo
   `shadcn add` reescreve o arquivo inteiro, em silêncio — já reescreveu uma vez
   e levou quatro variantes de botão junto.
2. **Nenhum token fora dos nomes que o shadcn define.** A paleta oficial da
   Maiyu entra como *valor* de `--background`, `--foreground`, `--primary` e
   companhia, não como camada por cima deles.
3. **O que é do produto mora em `src/components/common/`**, compondo o
   componente de fábrica. É a organização do `simple-hub`, do `adacaibs` e do
   `lowcodejs`.

## Árvore de rotas

| Rota | Arquivo | Seções que monta |
| --- | --- | --- |
| `/` | `_public/index.lazy.tsx` → `-components/home.tsx` | `hero`, `stats-bar`, `school`, `what-you-get`, `course-cards`, `how-to-enroll`, `team`, `who-its-for`, `where-and-when`, `faq`, `final-banner`, `whatsapp-float` |
| `/cursos/$slug` | `_public/cursos/$slug.lazy.tsx` | hero do curso, "Sobre o curso", "Quanto custa", turmas, `faq`, `whatsapp-float` |
| `/matricula` | `_public/matricula/index.lazy.tsx` | assistente de 3 passos: turma → formulário → Pix e comprovante |
| `/matricula/$protocol` | `_public/matricula/$protocol.lazy.tsx` | acompanhamento por protocolo |
| `/sobre` | `_public/sobre.lazy.tsx` | hero, `school`, `team`, `where-and-when` |
| `/privacidade`, `/termos` | `_public/*.lazy.tsx` → `-components/legal-page.tsx` | texto corrido em `prose` |
| `/authentication` | `routes/authentication/index.lazy.tsx` | entrada da secretaria |
| `/admin/**` | `_private/**` (21 telas) | painel, com a casca de `_private/layout.tsx` |

O layout público (`_public/layout.tsx`) monta cabeçalho, `<main>` e rodapé, e
abre com o link "Pular para o conteúdo". O privado
(`_private/layout.tsx`) monta `SidebarProvider` → `Sidebar` → `SidebarInset`,
com gatilho, trilha de migalhas e alternador de tema no cabeçalho.

## Os tokens

Tudo em `src/styles.css`. Dois blocos: `:root` (claro) e `.dark` (escuro), com a
variante `@custom-variant dark (&:is(.dark *))` ligando a classe que o
`next-themes` escreve no `<html>`.

| Token | Claro | Escuro | Papel |
| --- | --- | --- | --- |
| `--background` | `#FAFAFA` | `#272221` | o chão da página |
| `--foreground` | `#272221` | `#FAFAFA` | o texto, e o fundo dos blocos de contraste |
| `--card` | `#FFFFFF` | `#403937` | card, popover, sidebar, sheet |
| `--muted-foreground` | `#403937` | `#BBB9B9` | texto secundário |
| `--primary` | `#178528` | `#88FF9A` | o verde da marca: bloco do hero, banner, pílula, botão cheio |
| `--primary-foreground` | `#FFFFFF` | `#272221` | o que vai por cima do verde |
| `--border` | `#272221` a 10% | branco a 12% | borda decorativa de card |
| `--input` | `#272221` a 49% | branco a 38% | borda de campo — é ela que precisa dos 3:1 |
| `--ring` | `#178528` | `#88FF9A` | anel de foco |
| `--destructive` | `#C2251C` | `#E65C54` | erro, e vaga esgotada |
| `--chart-1..5` | escurecidos | puros | cor de dado; roxo e rosa entram **só** aqui |

O verde troca de valor com o tema porque o `#88FF9A` puro dá **1,20:1** sobre o
`#FAFAFA`: reprova até como elemento gráfico, que pede 3:1. É o mesmo desenho do
`simple-hub`. O preço é o bloco do hero, que fica verde-escuro no claro e
verde-vivo no escuro.

## Superfícies

Quatro, e a página inteira sai delas:

| Superfície | Classe | Onde |
| --- | --- | --- |
| chão | `bg-background` | `school`, `team`, `who-its-for`, `faq` |
| card | `bg-card` | `stats-bar`, `how-to-enroll`, `where-and-when`, cards de curso e professor |
| verde | `bg-primary` + `text-primary-foreground` | hero, banner final, hero do curso, `/sobre` |
| placa | `bg-foreground dark:bg-card` | rodapé, seção dos cursos, coluna do "o que você leva" |

**A placa muda de cor com o tema, e não inverte.** No claro ela é
`--foreground` (#272221), o contraste máximo contra a página clara. No escuro
uma placa mais escura que a página é impossível, e `--foreground` a deixaria
branca — três faixas claras no meio de uma página escura. Ela vira `--card`
(#403937): continua sendo faixa distinta, agora por elevação.

Quem vive dentro dela acompanha, e é por isso que três coisas carregam `dark:`:

| | claro | escuro |
| --- | --- | --- |
| título | `text-background` | `dark:text-card-foreground` |
| texto secundário | `text-background/70` | `dark:text-muted-foreground` |
| CTA (`PillButton` tom `slab`) | `bg-background` | `dark:bg-foreground` — os dois são #FAFAFA |
| pílula (`Highlight` variante `slab`) | branca com verde legível | `dark:bg-primary`, verde puro com tinta escura |

Um nível só de opacidade no secundário: `/60` dava 4,19:1 e reprovava.

Elevação é cor e borda, nunca sombra: sombra preta sobre fundo quase preto não
separa nada.

## Componentes do produto (`components/common/`)

| Componente | O que resolve |
| --- | --- |
| `pill-button.tsx` | a pílula da vitrine. Três tons: `ink` (sobre a página), `slab` (dentro da placa), `outline` (secundária). Compõe o `<Button>` de fábrica e desliga `nativeButton` quando o elemento final é link |
| `section-card.tsx` | o terceiro tamanho de card — canto de 24px, respiro de 6, texto de 14px. O `Card` do registry só tem medidas de painel |
| `highlight.tsx` | a palavra em serifa itálica dentro da pílula. `fill` sobre a página, `ink` dentro do bloco verde, `slab` dentro da placa, `outline` quando o fundo já carrega cor. **Uma por título** |
| `enrollment-cta.tsx` | o único componente que decide para onde "Garanta sua vaga" leva. Sem turma anunciada, vira conversa no WhatsApp |
| `page-shell`, `list-shell`, `form-shell`, `row-actions`, `confirm-dialog`, `theme-toggle` | o conjunto do `simple-hub`, usado pelo painel |

## Tipografia

`Outfit Variable` em título e corpo, servida do bundle
(`@fontsource-variable/outfit`); `Playfair Display Variable` só no itálico, e só
na palavra da pílula. A hierarquia vem de peso e tamanho, e a única quebra de
família na página é o destaque.

## Estados

- **Troca de tema:** `ThemeToggle` no cabeçalho das duas áreas — o público e o
  do painel. É o mesmo componente, com `aria-label` e ícone que reflete o
  estado; a escolha persiste em `localStorage` e o script do `next-themes`
  escreve a classe antes da hidratação, sem flash.
- **Foco:** anel verde (`--ring`) em todo focável, herdado do
  `outline-ring/50` da camada base. Verificado com tabulação real em
  `/matricula`: passo 1 → passo 2 só com Tab, Espaço e Enter, anel visível em
  todas as paradas nos dois temas.
- **Erro de validação:** `--destructive`, com par legível nos dois temas.
- **Vaga esgotada:** o badge de `course-cards` vira `destructive` quando
  `seatsRemaining` zera. Não há estado "acabando": âmbar exigiria um token fora
  do vocabulário do shadcn.
- **Movimento:** `prefers-reduced-motion` zera duração e iteração numa regra só,
  no fim da folha.

## Contraste

A tabela medida, nos dois temas, está em
[`MIGRACAO-TEMA-ESTADO.md`](MIGRACAO-TEMA-ESTADO.md). Todos os pares passam,
com uma exceção declarada: `border/background`, que é a borda decorativa de card
e é o valor de fábrica do shadcn — no `simple-hub` o mesmo par dá 1,28:1. Quem
delimita controle é `--input`, e ele passa nos dois temas.

## Dívida aberta

- `not-found-page.tsx` usa `bg-black` e `text-white` literais, de propósito: o
  painel do 404 é preto fixo nos dois temas.
- Sem escala tipográfica fechada. O enunciado original pedia seis tamanhos e a
  fonte `Raleway`; a folha resolveu antes com outra família, e trocar isso é
  outro trabalho.
