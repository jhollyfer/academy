# Components Common

O **kit** do produto: componentes de negócio que mais de uma rota usa. Diferente
de `components/ui` (design system puro sobre Base UI), estes têm regra de
domínio, chamada a API e estado de aplicação.

## O critério: rota, não pasta

Da skill `code-pattern` §8, verbatim:

> Um componente só mora em `components/common/` se **mais de uma rota** o usa.
> Consumidor único mora junto de quem o consome (...). Consumidor único **não**
> quer dizer "importado uma vez": o que conta é quantas rotas o alcançam. Um
> componente que só `resource-list` importa, mas que chega a 16 rotas por ele, é
> compartilhado e fica.

**Conta-se rota, não diretório.** É o ponto que decide quase tudo aqui: sete
peças deste diretório só são usadas sob `_private/administrator/`, e mesmo assim
ficam — `administrator` não é uma rota, são três (cursos, turmas, matrículas)
vezes listagem, ficha e formulário. `row-actions/`, `bulk-archive.tsx`,
`copy-id-menu-item.tsx`, `option-combobox.tsx` e `table/` são kit por esse
motivo.

A regra corta nos dois sentidos, e cortou nas duas direções no mesmo dia.
`date-picker.tsx` e `input-password.tsx` desceram para a pasta da rota que os
usava, cada um com **uma** rota. Dias depois o `date-picker` voltou: a data de
nascimento do formulário público de matrícula virou o segundo consumidor, e
deixá-lo em `administrator/classes/-components/` faria a vitrine importar de
dentro da pasta de uma rota do painel. O `input-password.tsx` fez o mesmo caminho
depois: ficou embaixo enquanto o sign-in era o único consumidor, e subiu quando
o formulário do painel de usuários virou o segundo - deixá-lo em
`routes/authentication/-components/` faria o painel importar de dentro da pasta
de outra área. Pelo mesmo motivo `rating-stars.tsx`,
`text-list-field.tsx`, `rich-text.tsx`, `rich-editor/` e `multi-file-upload/`
não foram trazidos dos projetos irmãos: nota, lista de texto, markdown e anexo
múltiplo não existem neste contrato, e importar peça sem consumidor é o começo
do depósito que esta regra existe para evitar.

## Compound onde há estado compartilhado

O texto é markup, e markup vai por slot. O que fica em prop é o que a peça
inteira compartilha, e isso chega às partes por contexto — não por prop repetida
em cada botão de cada tela.

| Diretório         | Partes exportadas                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `confirm-dialog/` | `Header`/`Media`/`Title`/`Description`, `Footer`/`Cancel`/`Confirm`                                        |
| `form-shell/`     | `Card`, `Content`, `Header`/`Title`, `Actions`/`Back`/`Discard`/`Submit`                                   |
| `image-field/`    | `Content`, `Preview`, `Actions`/`Upload`/`Remove`, `Description`                                           |
| `row-actions/`    | `Archive`, `Unarchive`, `Delete`                                                                           |
| `table/`          | `Header`/`Title`/`Actions`, `Toolbar`/`Search`/`TrashToggle`/`ColumnToggle`, `Grid`, `Empty`, `Pagination` |

Dois arquivos soltos também são compound, apesar de não terem diretório próprio
— cada um é uma peça só, com partes: `not-found-page.tsx`
(`Title`/`Subtitle`/`Description`/`Actions`/`HomeButton`) e `page-shell.tsx`
(`PageShell`+`Header`/`Content`/`Footer` e `PageHeader`+`Back`/`Title`/
`Badges`/`Description`/`Actions`).

**Nem tudo vira compound.** A instância do TanStack Table **não** entra em
contexto: `React.Context` não carrega o genérico de quem o provê, e guardá-la lá
custaria um `as` ou um `any` — o que reprova nas regras 2 e 3 do `code-pattern`.
Ela vai por prop, nos subcomponentes que a leem. Está escrito em
`table/table-context.ts`.

Peça sem estado compartilhado também não vira compound: um contexto ali seria
provider vazio, o "unnecessary Context overhead" que a própria
`compound-pattern` desaconselha. É o caso do `option-combobox.tsx` — gatilho
mais popover, sem parte que a tela precise reordenar — e do `bulk-archive.tsx`,
que tem gatilho, cabeçalho e rodapé mas delega as partes reais ao
`ConfirmDialog` e expõe um `children` só para o texto.

## Inventário

| Componente                   | Rotas que alcança                                 | Forma    |
| ---------------------------- | ------------------------------------------------- | -------- |
| `astronaut-illustration.tsx` | interno do `not-found-page.tsx`                   | prop     |
| `bulk-archive.tsx`           | as 3 listagens de `administrator`                 | prop     |
| `confirm-dialog/`            | `administrator` (todas) + a saída do `_private`   | compound |
| `copy-id-menu-item.tsx`      | as 3 listagens de `administrator`                 | prop     |
| `enrollment-cta.tsx`         | 5 seções do `_public` + a página de curso         | prop     |
| `form-shell/`                | os 4 formulários de `administrator`               | compound |
| `highlight.tsx`              | 13 telas e seções do `_public`                    | prop     |
| `image-field/`               | a capa do curso (ver a exceção abaixo)            | compound |
| `marks.tsx`                  | 5 seções do `_public`                             | prop     |
| `not-found-page.tsx`         | o curinga `_public/$` + o fallback do router      | compound |
| `option-combobox.tsx`        | os 3 filtros de `administrator` + o `table/`      | prop     |
| `page-shell.tsx`             | as 2 fichas + o `form-shell/` e o `table/`        | compound |
| `pill-button.tsx`            | 7 telas do `_public` + o `enrollment-cta`         | prop     |
| `row-actions/`               | as 3 listagens de `administrator`                 | compound |
| `section-card.tsx`           | 5 seções do `_public`                             | prop     |
| `submit-button.tsx`          | o `form-shell/`                                   | prop     |
| `table/`                     | as 3 listagens de `administrator`                 | compound |
| `theme-toggle.tsx`           | o layout de `_private` e o cabeçalho do `_public` | prop     |
| `uploading-context.tsx`      | o `submit-button` e o `image-field/`              | provider |

**A exceção escrita:** `image-field/` tem **uma** rota hoje — a capa do curso.
Fica assim mesmo porque é a metade de cima do sistema de storage, que é uma
camada e não um componente: embaixo dele estão `use-multipart-upload.ts`,
`lib/chunking.ts`, `lib/upload-transport.ts`, `lib/upload-resume.ts`,
`uploading-context.tsx` e as mutations `useStorageCreate`/`useStorageDelete`, e
todos já são compartilhados. O backend também já carrega `users.avatar_id`, então
o segundo consumidor está a uma tela de distância. Descê-lo para
`courses/-components/` faria a tela de perfil, quando vier, importar de dentro
da pasta de outra rota — que é justamente o que esta regra proíbe.

## Padrões gerais

- **UI em PT-BR** (labels, placeholders, mensagens) — inclusive comentários. O
  `LOCALE` do documento é literal `'pt-BR'`; o paraglide fica configurado e sem
  uso, como nos dois irmãos (ver o comentário em `routes/__root.tsx`)
- **Ícones**: Phosphor Icons
- Alias `#/` para `src/`
- Importam de `#/components/ui` — nunca o contrário
- Composição pela prop `render` do Base UI, **nunca** `asChild` (que é o sabor
  Radix da doc do catálogo; aqui o código vence)
- Estado de listagem na URL: busca, ordenação, paginação e lixeira em search
  params

## O que saiu daqui

`list-shell.tsx` — a casca de listagem própria, escrita antes de o `table/`
chegar. Os vinte arquivos do `table/` fazem o que ela fazia e mais: ordenar,
redimensionar e reordenar coluna, alternar visibilidade, seleção com ação em
massa e lixeira. Ter as duas deixaria o painel com dois jeitos de desenhar a
mesma tabela, e o segundo envelheceria.

Se um componente daqui vier a ter rota única, desce para
`routes/<área>/-components/`, e sobe de volta quando o segundo aparecer. Foi o
caminho do `date-picker` e do `input-password`, os dois desceram e voltaram.
