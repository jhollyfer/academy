# Mapeamento do frontend — `academy/frontend`

> Levantamento de arquitetura, padrões e organização do frontend da Maiyu
> Academy, no mesmo molde do `SIMPLE_HUB_FRONTEND_MAP.md` que mapeia o projeto
> de referência. Cada número aqui foi medido no código, não estimado.
>
> 265 arquivos `.ts`/`.tsx` em `src/` (fora o `routeTree.gen.ts`), 93 deles em
> `src/routes/`. Última passagem: setembro de 2026.

## 1. O que é

Escola de tecnologia em Benjamin Constant, no Alto Solimões. O frontend serve
duas coisas em um projeto só: a **vitrine pública**, que é a landing e o funil de
matrícula, e o **painel da secretaria**, que é um CRUD de três recursos.

Stack idêntica à dos projetos irmãos: TanStack Start (React 19) sobre Vite e
Nitro, TanStack Router com file-based routing, TanStack Query para todo data
fetching, VineJS com react-hook-form nos formulários, shadcn `base-mira` sobre
Base UI, Tailwind v4.

Diferenças deliberadas em relação ao `simple-hub`:

| | simple-hub | academy |
|---|---|---|
| Papéis | 4 (`administrator`, `$company`, `producer`, cliente) | 1 (`administrator`) |
| Recursos no painel | ~30 | 3 |
| Formulários | 39 | 4 |
| `@tanstack/store` | não instalado | não instalado |
| Paraglide | instalado e sem uso | igual |

O paraglide fica configurado e sem uso nos dois, e o `LOCALE` do documento é
literal `'pt-BR'`. O motivo está escrito em `routes/__root.tsx`.

## 2. Roteamento

`routeToken: 'layout'` no `vite.config.ts`, então o arquivo de layout é
`layout.tsx` e não `route.tsx`. Todo par de rota é `X.tsx` (dados: `loader`,
`validateSearch`, `head`) mais `X.lazy.tsx` (UI: só `component`).

**Toda rota é em inglês, pública e privada.** Foi assim que ficou depois de a
vitrine ser renomeada de `/sobre`, `/termos`, `/privacidade`, `/cursos` e
`/matricula`. O `adacaibs` ainda tem a vitrine em português e é o que deve mudar,
não este.

```
src/routes/
├── __root.tsx                  shellComponent, LOCALE literal, providers
├── sitemap[.]xml.ts            rota de servidor, devolve XML
│
├── authentication/
│   ├── layout.tsx                 guard inverso: quem tem sessão sai daqui
│   ├── -components/auth-shell.tsx moldura da tela de entrada
│   └── _sign-in/                  pathless: a URL final é /authentication
│       ├── index.tsx / index.lazy.tsx
│       └── -components/{sign-in-form,input-password}.tsx
│
├── _private/                   pathless, tudo autenticado
│   ├── layout.tsx                 GUARD CENTRAL (ensureQueryData + redirect)
│   ├── -components/sidebar.tsx
│   └── administrator/
│       ├── index.tsx / index.lazy.tsx        visão geral
│       ├── courses/    ┐
│       ├── classes/    ├─ o mesmo molde de 9 arquivos em -components/
│       └── enrollments/┘
│
└── _public/                    pathless, sem guard
    ├── layout.tsx
    ├── $.tsx                      curinga: 404 dentro da casca do site
    ├── index.tsx / index.lazy.tsx home
    ├── about | terms | privacy    (.tsx + .lazy.tsx cada)
    ├── courses/$slug
    ├── enrollment/                formulário em passos
    │   ├── index, $protocol
    │   └── -components/receipt-upload.tsx
    └── -components/               as 13 seções da home + o kit da vitrine
```

### O molde de recurso do painel

Os três recursos repetem exatamente a mesma forma, que é a de
`adacaibs/.../administrator/notices/`:

```
<recurso>/
├── index.tsx          validateSearch + loaderDeps + loader + pendingComponent
├── index.lazy.tsx     component: <X>Table            (5 linhas)
├── new.lazy.tsx       component: <X>FormCreate       (5 linhas)
├── $id/
│   ├── index.tsx / index.lazy.tsx    ficha
│   └── edit.tsx  / edit.lazy.tsx     edição
└── -components/
    table.tsx  columns.tsx  filters.tsx  detail.tsx
    form-create.tsx  form-edit.tsx  form-fields.tsx
    row-actions.tsx  bulk-actions.tsx
```

`enrollments` não tem `new` nem `edit`: matrícula nasce no site, pelo candidato,
e a secretaria a faz **transitar** de situação na ficha. Um formulário de edição
ali deixaria alguém trocar o nome do aluno sem olhar o documento.

### Regras que valem em toda rota

- **Guard por posição na árvore.** Um `beforeLoad` só, em `_private/layout.tsx`,
  com `ensureQueryData` e não `prefetchQuery`: o segundo engole o erro e o guard
  nunca reprovaria. Rota nova dentro de `_private/` nasce protegida.
- **`getRouteApi('/id/da/rota')` no escopo do módulo**, nunca importar o `Route`
  de volta do arquivo de rota. São **zero** ocorrências fora do `routeTree.gen.ts`,
  e o motivo é o ciclo de chunk que o `check-chunk-cycles.mjs` reprova.
- **404 de negócio vira `notFound()` no loader**; 5xx e rede fora sobem para o
  `defaultErrorComponent`. Um backend indisponível não pode parecer registro
  apagado.
- **Estado de listagem na URL**: busca, ordenação, página e lixeira em search
  params, via `withExtra([...] as const)`.

## 3. Componentes, em três camadas

### `components/ui/` — 62 arquivos

shadcn `base-mira` sobre `@base-ui/react`, ícones Phosphor. Nunca editado à mão
para agradar o lint: o próximo `shadcn add` sobrescreve. Duas exceções escritas:
as variantes semânticas do `badge.tsx` e o `scroll-area.tsx` trazido da
referência.

### `components/common/` — 15 soltos e 5 compound

O critério está em `src/components/common/CLAUDE.md`, e é **rota, não pasta**: só
mora aqui o que mais de uma rota alcança. A regra cortou nos dois sentidos nesta
base: `input-password.tsx` desceu para `authentication/_sign-in/-components/` por
ter um consumidor, e `date-picker.tsx` desceu e **voltou** quando a data de
nascimento da matrícula virou o segundo.

Compound (contexto + partes + barrel): `confirm-dialog/`, `form-shell/`,
`image-field/`, `row-actions/`, `table/`.

Soltos: `astronaut-illustration`, `bulk-archive`, `copy-id-menu-item`,
`date-picker`, `enrollment-cta`, `highlight`, `marks`, `not-found-page`,
`option-combobox`, `page-shell`, `pill-button`, `section-card`, `submit-button`,
`theme-toggle`, `uploading-context`.

Não foram trazidos dos irmãos, e o `CLAUDE.md` diz por quê: `rating-stars`,
`text-list-field`, `rich-text`, `rich-editor/` e `multi-file-upload/`. Nota,
lista de texto, markdown e anexo múltiplo não existem neste contrato.

### `-components/` — colocação por rota

13 seções da home em `_public/-components/`, mais o `section-title.tsx` que
padroniza o título de todas elas. Nove diretórios `-components/` no total.

## 4. Data layer

- **`_query-keys.ts`** — registro único, seccionado por comentário. Todo recurso
  tem o mesmo bloco de três linhas: `all`, `list`, `detail`. `storefront` tem
  prefixo próprio: o painel enxerga rascunho e lixeira, o site só o que está no
  ar, e compartilhar o prefixo faria uma edição no painel piscar a home.
- **`queries.ts`** — 11 `queryOptions` na forma `export const xQueryOptions =
  (params) => queryOptions({...})`. Plural é lista, singular é detalhe.
  `keepPreviousData` em toda listagem paginada.
- **`mutations.ts`** — 20 hooks. Cada um fornece **só** o `mutationFn`;
  `onSuccess`, `onError` e invalidação são de quem chama, na prática do
  `use-resource-form.ts`.
- **`http.ts`** — `request<T>()` com refresh de sessão em 401 deduplicado
  (variável de módulo no cliente, `AsyncLocalStorage` no servidor), `HTTPError`
  registrado como `Register['defaultError']`, deadline de 15s.
- **Montagem de path com `.concat()`**, nunca template literal. É a convenção dos
  três projetos.

Listagem usa `useQuery` (precisa de `isPlaceholderData` e `isError`); detalhe e
edição usam `useSuspenseQuery`, que não suspende porque o loader já aqueceu a
chave.

## 5. `lib/` — 37 arquivos, sem React

`validator.ts` (682 linhas) é cópia literal do `backend/app/core/validator.ts`.
`entity.ts` é vocabulário do domínio em lookup objects, **sem** importar o vine:
um `import` de enum arrastaria 700 linhas de schema para o bundle da vitrine.
`labels.ts` é apresentação — os pares `*_LABELS`, `*_VARIANTS` e `*_DOTS` que
antes estavam espalhados por quatro telas.

19 arquivos de teste, colocados ao lado do que testam.

## 6. Identidade visual

A vitrine segue as artes de divulgação: sci-fi amazônico, preto esverdeado,
verde neon e branco. **Três cores, sem uma quarta.**

- **`--brand-ink` / `--brand-ink-soft`** — o preto esverdeado, matiz 147.3, o
  mesmo do verde da marca. Literal e **igual nos dois temas**: são blocos de
  assinatura, não superfície de tema. Hero, faixa de métricas, cursos, mercado,
  banner final e rodapé.
- **`--neon` (`#88ff9a`) e `--neon-ink`** — o segundo existe porque o neon puro
  sobre fundo claro dá **1,3:1** e não serve para texto. No tema claro ele é
  fundo de badge e borda; texto sai no `--neon-ink`.
- **`@utility brand-title`** — Archivo em `font-stretch: 75%`, itálico, bold,
  caixa alta. A caixa alta é do CSS, não do JSX, para o leitor de tela pronunciar
  a palavra em vez de soletrar sigla. **Zero `display-title` restante.**
- **`CircuitTrails`** — as trilhas de circuito como SVG inline, com
  `non-scaling-stroke`. Inline e não raster porque o público entra por celular
  com internet instável.
- **`@media (pointer: coarse)`** — piso de 44px nos controles. Por apontador e
  não por largura: tablet é dedo, janela estreita no desktop não é.

Contraste medido no bloco de marca, idêntico nos dois temas: branco **14,75:1**,
neon **11,81:1**, corpo **14,75:1**.

## 7. Verificação

```bash
pnpm lint          # 4 regras de casa: no-ternary, no-any, no-`as`, type-não-interface
pnpm typecheck     # tsc --noEmit; é o que pega rota renomeada
pnpm test          # vitest, 20 arquivos / 159 testes
pnpm build
pnpm check-cycles  # lê .output/ e reprova leitura antecipada em ciclo (87 chunks)
pnpm check         # prettier --check
```

Além disso, existe uma auditoria de interface em Playwright que percorre as 15
rotas em dois temas e dois viewports, medindo contraste (convertendo cor via
canvas, porque `getComputedStyle` devolve `oklch` neste projeto), alvo de toque
com `hasTouch`, overflow horizontal, hierarquia de heading e nome acessível.

## 8. O que ainda é placeholder

- As dez ilustrações de `public/ilustracoes/`. O estilo está fechado e escrito em
  `_estilo.md` (duas paletas: uma para bloco claro, outra para o bloco de marca);
  a arte final não chegou.
- `_private/profile/` não existe aqui, e existe nos três irmãos.
- `README.md` do frontend continua o texto do scaffold CTA, igual nos três.
