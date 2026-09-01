# Mapeamento do frontend de referência — `simple-hub/frontend`

> Levantamento de arquitetura, padrões, organização e filosofia do frontend em
> `../simple-hub/frontend` (projeto irmão, fora deste repo), feito para servir
> de base quando a migração do frontend deste projeto (hoje só `frontend-old/`,
> SPA React antigo) começar — o mesmo papel que `.specs/` cumpre para o
> backend. Não é spec de migração; é mapa da referência, com caminho de
> arquivo real e trecho de código como evidência em cada ponto.
>
> 774 arquivos `.ts`/`.tsx` em `src/`.

## 1. Visão geral e stack

TanStack Start (React 19), full-stack framework sobre Vite + Nitro, com
file-based routing do TanStack Router e TanStack Query para todo data
fetching client+SSR.

| Lib | Papel | Onde entra de fato |
|---|---|---|
| `@tanstack/react-start` | Framework full-stack (SSR, entry) | `router.tsx`, `start.ts`, `__root.tsx`. API routes/`createServerFn` (feature documentada no `README.md` scaffold) **não têm nenhum uso** em `src/` — só data fetching via loader+Query |
| `@tanstack/react-router` (+ `router-plugin`, `router-devtools`, `router-ssr-query`) | File-based routing, loaders, guards, integração SSR com Query | toda `src/routes/` (§2); `router-ssr-query` só em `router.tsx` (`setupRouterSsrQueryIntegration`) |
| `@tanstack/react-query` (+ `devtools`) | Cache de dados, sempre via `queryOptions` centralizadas | `integrations/tanstack-query/{queries,mutations,query-context}.ts` (§4); devtools só em `integrations/tanstack-query/devtools.tsx`, montado em `__root.tsx` sob `import.meta.env.DEV` |
| `@tanstack/react-table` | Motor de tabela headless | por trás de `components/common/table/` inteiro (20 arquivos, §3) |
| `@base-ui/react` | Motor de primitivas sem estilo (substitui Radix) | todo `components/ui/*` |
| `shadcn` (style `base-mira`, devDependency — CLI) | Gerador dos componentes "vendored" em `components/ui/` | não é runtime — só `pnpm dlx shadcn@latest add` (`.cursorrules`) |
| `@shadcn/react` (dependency — runtime) | Pacote de runtime do próprio shadcn (não o CLI) | um caso isolado: `components/ui/message-scroller.tsx` importa de `@shadcn/react/message-scroller` — não é a norma dos outros 42 arquivos de `ui/` |
| `@phosphor-icons/react` | Ícones (não lucide) | espalhado por `components/ui/*` e `-components/*` |
| `tailwindcss` v4 + `@tailwindcss/vite` + `@tailwindcss/typography` | Estilo, `@theme inline`, tokens semânticos | `src/styles.css`, plugin `typography` só citado via `@plugin` no CSS |
| `@vinejs/vine` + `@hookform/resolvers` (`vineResolver`) | Validação de formulário — mesmo schema-builder do backend AdonisJS | `lib/validator.ts` (schema) + `hooks/use-resource-form.ts` (ponte com RHF) |
| `react-hook-form` | Estado de formulário | todo `form-create.tsx`/`form-edit.tsx`/`*-form.tsx` via `use-resource-form.ts` |
| `@inlang/paraglide-js` | i18n | **instalado e configurado, zero uso em componente** (§6) |
| `@tiptap/react` + `@tiptap/starter-kit` (+ `@tiptap/pm` transitivo) | Editor de texto rico | só `components/common/rich-editor/*` (4 arquivos), consumido por `-components/story-blocks-editor.tsx` |
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | Drag-and-drop | só `components/common/table/{table-draggable-header,table-grid}.tsx` — reordenar **coluna de tabela**, não é usado em imagem de produto nem em variante |
| `@dnd-kit/modifiers` | (declarado) | **instalado e nunca importado em `src/`** — dependência morta, mesma categoria de `@tanstack/store` (§6) |
| `nitro` | Servidor de produção (preset `node-server`) | plugin em `vite.config.ts`; `Dockerfile-production` só empacota o `.output/` já buildado |
| `babel-plugin-react-compiler` | React Compiler | plugin Babel separado do `viteReact()`, em `vite.config.ts` |
| `react-day-picker` | Calendário | só `components/ui/calendar.tsx` |
| `react-resizable-panels` | Painéis redimensionáveis | só `components/ui/resizable.tsx` |
| `cmdk` | Command palette | só `components/ui/command.tsx` |
| `embla-carousel-react` | Carrossel | só `components/ui/carousel.tsx` |
| `input-otp` | Campo de código OTP | só `components/ui/input-otp.tsx` — sem tela que use OTP hoje |
| `use-mask-input` | Máscara de input (CPF/telefone/CEP) | só nos 3 passos de `authentication/sign-up/-components/{step-address,producer-sign-up,customer-sign-up}.tsx` |
| `recharts` | Gráficos | só `components/ui/chart.tsx` + os dois cards de `routes/_private/-components/dashboard/{metric-cards,revenue-chart}.tsx` |
| `date-fns` | Datas | só `components/common/date-picker.tsx` (apesar de `lib/format.ts` existir, não usa `date-fns`) |
| `sonner` | Toast | `<Toaster/>` em `__root.tsx`; disparado em `lib/form-errors.ts` (retry de 5xx) e nas mutations |
| `next-themes` | Dark/light mode | `ThemeProvider` em `__root.tsx`, `components/common/theme-toggle.tsx` |

Alias único de import: `#/*` → `./src/*` (não `@/*` — evita colisão de
convenção), declarado em `package.json#imports` e `tsconfig.json` (o
comentário do `tsconfig.json` conta o motivo: com os dois aliases, cada
arquivo escolhia um e `@/` voltava sozinho toda vez que o shadcn gerava
componente novo).

## 2. Roteamento (`src/routes/`)

File-based routing puro: a árvore de diretórios em `src/routes/` *é* a árvore
de rotas, gerada em `src/routeTree.gen.ts` (2910 linhas, não editar à mão).

### Convenções de nome

| Convenção | Significado | Exemplo |
|---|---|---|
| `index.tsx` | rota raiz de um diretório (`/`) | `_public/index.tsx` |
| `$param.tsx` / `$param/` | segmento dinâmico | `product/$sku.tsx`, `$company/` |
| `_prefixo/` | rota **pathless** — aplica layout sem entrar na URL | `_private/`, `_public/` |
| `layout.tsx` | arquivo de layout de um grupo pathless. Não é o padrão `route.tsx` do TanStack Router — o projeto redefine em `vite.config.ts`: `tanstackStart({ router: { routeToken: 'layout' } })` | `_private/layout.tsx` |
| `arquivo.tsx` + `arquivo.lazy.tsx` | code-splitting oficial: `.tsx` carrega `loader`/`beforeLoad`/`validateSearch`/`head` (crítico), `.lazy.tsx` carrega só `component` (`createLazyFileRoute`, code-split) | `products/index.tsx` + `products/index.lazy.tsx` |
| `-components/` | pasta ignorada pelo gerador de rotas — UI privada daquela rota | `$company/products/-components/` |
| `__root.tsx` | rota raiz do app inteiro | `src/routes/__root.tsx` |

Quase toda rota "de tela" segue o par `.tsx` (dados) + `.lazy.tsx` (UI). Rotas
sem loader (ex. `authentication/sign-up/*.lazy.tsx`) só têm o lazy.

### Árvore

```
src/routes/
├── __root.tsx                  raiz do app (shellComponent, providers globais)
├── authentication/              login/cadastro, pathless
│   ├── layout.tsx                 guard "já logado" → redireciona pra fora
│   ├── _sign-in/index.lazy.tsx    prefixo _ → URL final /authentication
│   └── sign-up/                   multi-step form (customer/producer)
├── _private/                    pathless — TUDO autenticado
│   ├── layout.tsx                 GUARD CENTRAL de sessão (beforeLoad)
│   ├── $company/                  painel da empresa (slug dinâmico)
│   │   ├── dashboard, organization, addresses/, catalog/,
│   │   │   certification-grants/, impact-*, orders/$id, passports/,
│   │   │   producers/$id, products/$id/(index|edit)
│   ├── administrator/             painel do administrador (~18 recursos CRUD)
│   ├── orders/                    pedidos do cliente
│   ├── producer/                  área do produtor
│   └── profile/                   perfil da conta logada
└── _public/                     pathless — vitrine, SEM guard
    ├── layout.tsx                 shell público, loader com Promise.all
    ├── index.tsx                  home (infinite query)
    └── artesao/$slug, category/$slug, company/$slug, comunidade/$slug,
        organizacao/$slug, passaporte/$code, product/$sku
```

Cada área de papel (`administrator/`, `$company/`, `producer/`, `orders/`)
repete o mesmo padrão CRUD por recurso: `index.tsx` (lista, `validateSearch` +
`pendingComponent`), `new.lazy.tsx` (criação), `$id/edit.tsx` + `.lazy.tsx`
(edição), às vezes `$id/index.tsx` (detalhe) — convenção repetida em ~20
entidades administrativas.

### Guard de autenticação

Um guard central só, em `_private/layout.tsx`:

```tsx
export const Route = createFileRoute('/_private')({
  beforeLoad: async ({ context, location }) => {
    try {
      const account = await context.queryClient.ensureQueryData(accountQueryOptions())
      return { account }
    } catch {
      throw redirect({ to: '/authentication', search: { redirect: location.href } })
    }
  },
  component: RouteComponent,
})
```

`ensureQueryData` (não `prefetchQuery`) porque precisa propagar o erro — é o
que reprova o guard. Qualquer rota nova dentro de `_private/` nasce protegida
só por estar naquele diretório. Guard inverso em `authentication/layout.tsx`
(quem já tem sessão é mandado para `dashboardLink(account)`, que decide
destino por `role`). **Não há guard de `role` por sub-área** no frontend
(`administrator/` vs `$company/` vs `producer/`) — a separação acontece só
por onde o login manda o usuário; autorização de fato é responsabilidade do
backend (401/403 caem no `errorComponent` global). `_public/layout.tsx` não
tem guard nenhum.

### Data fetching por rota

1. `loader` (arquivo `.tsx` pesado) → `context.queryClient.ensureQueryData(...)`
   ou `ensureInfiniteQueryData(...)`, roda no servidor e aquece o cache antes
   do primeiro HTML.
2. Componente (`.lazy.tsx` → `-components/*.tsx`) → a **mesma**
   `queryOptions` do loader, mas o hook muda com a tela: **listagem usa
   `useQuery`**, porque precisa de `isPlaceholderData` e `isError` para trocar
   de página sem esvaziar a tabela e para oferecer nova tentativa sem derrubar
   a rota; **detalhe e edição usam `useSuspenseQuery`**, que nunca suspende de
   verdade porque a chave já está quente e o 404 foi tratado no loader.
   (Verificado em `_private/$company/products/-components/{table,detail}.tsx`.)
3. Todas as `queryOptions` centralizadas em
   `src/integrations/tanstack-query/queries.ts` (garante chave idêntica entre
   loader e componente).
4. `loaderDeps: ({ search }) => search` quando o loader depende de filtro/paginação da URL.
5. `notFound()` lançado no `loader` em 404 de negócio; outros erros sobem
   para o `defaultErrorComponent` global (`router.tsx`), que distingue
   `HTTPError` 4xx (mensagem do backend) de 5xx (mensagem genérica + "Tentar
   de novo" via `reset`).

### Exemplos reais

Layout com guard inverso:

```tsx
// authentication/layout.tsx
export const Route = createFileRoute('/authentication')({
  validateSearch: validateRedirectSearch,
  beforeLoad: async ({ context }) => {
    let account: AccountResponse | null = null
    try {
      account = await context.queryClient.ensureQueryData(accountQueryOptions())
    } catch { return }
    throw redirect(dashboardLink(account))
  },
  component: () => <Outlet />,
})
```

Rota dinâmica com `head` + `notFound`:

```tsx
// _public/product/$sku.tsx
export const Route = createFileRoute('/_public/product/$sku')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(storefrontProductQueryOptions(params.sku))
    } catch (error) {
      if (error instanceof HTTPError && error.status === HTTPStatus.NOT_FOUND) throw notFound()
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.name.concat(' · Simple Hub') ?? 'Simple Hub' },
      { name: 'description', content: loaderData?.description ?? 'Produto à venda na Simple Hub.' },
    ],
  }),
  notFoundComponent: () => <NotFoundPage />,
})
```

Listagem com `validateSearch` + `pendingComponent`:

```tsx
// _private/$company/products/index.tsx
const validateSearch = withExtra(['status', 'categoryId'] as const, ['minPrice', 'maxPrice'] as const)

export const Route = createFileRoute('/_private/$company/products/')({
  validateSearch,
  pendingComponent: () => <TableSkeleton />,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(companyProductsQueryOptions(deps)),
})
```

Índice que só redireciona:

```tsx
// _private/$company/index.tsx
export const Route = createFileRoute('/_private/$company/')({
  beforeLoad: ({ params }) => { throw redirect({ to: '/$company/dashboard', params }) },
})
```

## 3. Componentes — três camadas

### `components/ui/` (61 arquivos) — shadcn vendored sobre Base UI

Não é Radix: `components.json` fixa `"style": "base-mira"`, `"iconLibrary": "phosphor"`.
Padrões (vistos em `button.tsx`, `dialog.tsx`, `sheet.tsx`):

- **Sem `forwardRef`** — React 19 repassa `ref` como prop normal.
- **`cva`** para variantes (ex. `buttonVariants` com `variant`/`size`,
  incluindo `icon-xs|icon-sm|icon-lg`).
- **`data-slot="..."` em todo elemento** — permite estilizar por seletor de
  atributo sem wrapper extra.
- **`useRender` do Base UI + `mergeProps`**, no lugar de `asChild`/`Slot` do
  Radix — comentário no código explica que o `Button` do Base UI força
  semântica de `<button>` e reclama quando `render` recebe um `<a>`; o hook
  `useRender` evita essa checagem.
- **`render` prop** (equivalente Base UI do `asChild`), ex.:
  `<DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" />}>`.
- Estados de animação por atributo de dado do Base UI (`data-open`,
  `data-closed`, `data-ending-style`, `data-[side=...]`) + Tailwind
  `animate-in`/`animate-out`.

Lista completa: `accordion, alert-dialog, alert, aspect-ratio, attachment,
avatar, badge, breadcrumb, bubble, button-group, button, calendar, card,
carousel, chart, checkbox, collapsible, combobox, command, context-menu,
dialog, direction, drawer, dropdown-menu, empty, field, hover-card,
input-group, input-otp, input, item, kbd, label, marker, menubar,
message-scroller, message, native-select, navigation-menu, pagination,
popover, progress, radio-group, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs,
textarea, toast, toggle-group, toggle, tooltip`.

### `components/common/` — compartilhado entre ≥2 rotas

Regra explícita do projeto (skill `code-pattern`): só entra aqui o que mais
de uma rota usa. Maioria é compound component em subpasta própria:

- **`form-shell/`** — casca de formulário create/edit do painel; contexto
  memoizado (evita re-render do cabeçalho a cada tecla).
- **`confirm-dialog/`** — confirmação destrutiva sobre `ui/alert-dialog`,
  `trigger` como `React.ReactElement` + `onConfirm`/`destructive` via
  contexto.
- **`page-shell.tsx`** (309 linhas) — casca de tela inteira:
  `PageShell`/`PageShellHeader`/`PageShellContent` (com
  `data-scroll-restoration-id` fixo — nomear a rolagem evita que o router
  perca a posição salva quando a árvore ganha um filho condicional) /
  `PageShellFooter`, e família `PageHeader*` com grid `[auto_1fr_auto]`.
- **`row-actions/`** — menu de três pontinhos de tabela.
- **`table/`** (20 arquivos) — casca de listagem canônica sobre
  `@tanstack/react-table`: `table.tsx`, `table-header.tsx`,
  `table-toolbar.tsx`, `table-pagination*.tsx`, `table-search-input.tsx`,
  `table-column-header.tsx`, `table-draggable-header.tsx`,
  `table-resize-handle.tsx`, `table-selection.tsx`, `table-empty.tsx`,
  `table-skeleton.tsx`, `table-mobile-cards.tsx`, `use-table.tsx`.
- **`submit-button.tsx`** — trava sozinho durante `isPending` **e** durante
  upload em andamento (`useIsUploading()`), evitando salvar formulário com
  imagem ainda subindo.
- Outros: `image-field/`, `multi-file-upload/`, `product-image-viewer/`,
  `rich-editor/` (Tiptap), `qr-card/`, `combobox-load-more.tsx`,
  `currency-input.tsx`, `basis-points-input.tsx`, `date-picker.tsx`,
  `theme-toggle.tsx`, `uploading-context.tsx`.
- Alguns têm `.test.ts` irmão (`currency-input.test.ts`,
  `date-picker.test.ts`) — teste de lógica pura colocado, não em
  `__tests__/`.

### `-components/` — colocação por rota (terceiro nível)

Toda rota que precisa de UI só sua usa subpasta `-components/` (prefixo `-`
= convenção do TanStack Router para excluir do gerador de árvore). 46
diretórios encontrados, ex.: `_private/-components/category/create-dialog.tsx`,
`_private/$company/producers/-components/link-producer-dialog.tsx`,
`orders/-components/review-dialog.tsx`. É onde mutations específicas de uma
tela ficam embutidas direto em dialogs/forms (`useMutation` inline). Linha
divisória com `common/`: 1 rota usa → `-components/` local; ≥2 rotas usam →
sobe pra `common/`.

## 4. Data layer

### Achado central: queries/mutations não são "um arquivo por recurso"

`hooks/tanstack-query/` **não** guarda a maioria das queries — guarda só:

- `_query-keys.ts` (461 linhas) — registro único de `queryKeys`.
- 4 hooks de scroll infinito para combobox (`use-categories-read-paginated-infinite.ts` etc.), que têm lógica própria de escolher path/key por `scope` (`administrator`/`company`/`producer`).

As queries e mutations "normais" vivem centralizadas em dois arquivos
grandes, seccionados por comentário `// --- /path/do/recurso ---`:

- `src/integrations/tanstack-query/queries.ts` — ~1300 linhas, 92 exports (`xQueryOptions`).
- `src/integrations/tanstack-query/mutations.ts` — ~2450 linhas, 121 exports (`useXCreate`/`useXUpdate`/...).

### `queryKeys` — prefixo por recurso × superfície

```ts
export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    list: (params: ListSearch) => ['categories', 'list', params] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    paginated: (params: PaginatedParams) => ['categories', 'paginated', params] as const,
  },
  // ...
}
```

Regra documentada: `customerOrders`/`companyOrders`/`administratorOrders` são
três prefixos separados para o mesmo "pedido" — cada superfície tem recorte
de dados diferente, e invalidar uma não pode contaminar a outra.

### Padrão canônico de query

```ts
export const administratorsQueryOptions = (params: ListSearch) =>
  queryOptions({
    queryKey: queryKeys.administrators.list(params),
    queryFn: ({ signal }) => request<Paginated<User>>('/administrator/administrators'.concat(search(params)), { signal }),
    placeholderData: keepPreviousData,
  })

export const administratorQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.administrators.detail(id),
    queryFn: ({ signal }) => request<User>('/administrator/administrators/'.concat(id), { signal }),
  })
```

`keepPreviousData` em toda listagem paginada; `staleTime: Infinity` em
catálogos fechados (ODS, CEP, CNPJ); `retry: false` onde 404/401 é estado de
negócio legítimo.

### Padrão canônico de mutation

```ts
type CategoryCreateOptions = Omit<UseMutationOptions<Category, HTTPError, AdministratorCategoryCreatePayload>, 'mutationFn'>

export function useCategoryCreate(options?: CategoryCreateOptions) {
  return useMutation<Category, HTTPError, AdministratorCategoryCreatePayload>({
    ...options,
    mutationFn: (payload) => request<Category>('/administrator/categories', { method: 'POST', body: JSON.stringify(payload) }),
  })
}
```

Regra explícita no topo do arquivo: o hook só fornece `mutationFn` —
`onSuccess`/`onError`/`onSettled` nunca hardcoded, cada tela trata o
resultado do seu jeito. Invalidação de cache não acontece dentro da mutation
— é decisão de quem chama, na prática quase sempre via `use-resource-form`.

### `hooks/use-resource-form.ts` (188 linhas) — o hook mais importante

Fecha o ciclo `react-hook-form` + `vineResolver` + `useMutation` +
`invalidateQueries` + `toast` + `navigate` num lugar só (comentário no código:
"os trinta e nove `form-create.tsx`/`form-edit.tsx` escreviam as mesmas ~25
linhas"). Recebe a mutation como função no formato padrão de
`mutations.ts`, `invalidate: QueryKey`, `success`, `retry` opcional. Devolve
`{ form, mutation, onValid, shell }` prontos para `<FormShell {...shell}>`.

Regra de negócio notável: **edição valida sempre com o validator de
criação**, nunca o de update (que é todo `.optional()`), porque validar
edição com schema opcional deixaria passar campo vazio silenciosamente.

### Outros hooks fora de `tanstack-query/`

- `use-multipart-upload.ts` (262 linhas) — upload multipart resumível direto
  pro bucket (abre → sobe partes com pool de concorrência 3 → completa),
  resume via `localStorage`.
- `use-dismissable-dialog.ts` — fecha Dialog/Sheet *uncontrolled* clicando
  programaticamente num `ref`, evitando `useState`/`open`/`onOpenChange`.
- `use-mobile.ts` — `useIsMobile()` via `matchMedia`, breakpoint 768px.

### HTTP / SSR

- `integrations/tanstack-query/http.ts` — `request<T>()`: fetch com refresh
  automático de sessão em 401, deduplicado via `createIsomorphicFn` (uma
  promessa de renovação por processo no browser, por-requisição no servidor
  via `AsyncLocalStorage`); `HTTPError` tipado, registrado como
  `Register['defaultError']` do TanStack Query inteiro.
  `BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'`.
- `http.server.ts` (sufixo `.server`, nunca entra no bundle client) —
  `runInRequestScope` abre `AsyncLocalStorage` por requisição;
  `inboundCookie()`/`applySetCookie()` repassam cookie do navegador pro
  backend durante SSR.
- `query-context.ts` — `getContext()` cria um `QueryClient` **novo por
  chamada** (nunca singleton de módulo) — evita vazar cache entre
  visitantes em SSR. `staleTime: 60s`, `retry` que não insiste em 4xx que não
  sejam erro de servidor.
- Não existe `QueryClientProvider` manual — a integração SSR
  (dehydrate/hydrate em streaming) é 100% delegada a
  `setupRouterSsrQueryIntegration` (`@tanstack/react-router-ssr-query`),
  chamada em `router.tsx`.

## 5. `lib/` — domínio puro, sem React

- **`utils.ts`** — `cn()` (`twMerge(clsx(...))`), `slugify()` (espelha
  `string.slug` do AdonisJS), `optionalNumber()`.
- **`validator.ts`** (2240 linhas) — VineJS, **cópia literal** do schema de
  `backend-old/app/core/validator.ts` (mesma expressão dos dois lados, porque o
  backend não publica o schema como pacote). Configura
  `vine.messagesProvider` (pt-BR) e `vine.convertEmptyStringsToNull = true`
  (espelha `bodyparser.ts` do backend) antes de qualquer `vine.create()`, e
  reexporta o `vine` configurado como singleton.
- **`entity.ts`** — enums como lookup objects (`UserRoles`,
  `ProductStatuses`, `OrderStatuses`, `ORDER_TRANSITIONS`, `TrashedModes`,
  `STORAGE_MIMETYPES`), deliberadamente **sem** importar `vine` — um só
  `import` de constante arrastaria os ~2500 linhas de schema pro bundle da
  vitrine pública.
- **`interfaces.ts`** — só `Merge<TBase, TOverride>` (interseção achatada,
  usada em vez de `&` — mesma regra do skill `code-pattern` deste repo).
- **`form-errors.ts`** — `applyHTTPErrorToForm()`/`applyMutationError()`:
  leva erro 422/409 (`error.errors`) para `form.setError()` por campo, com
  fallback pro campo `root`, e "Tentar de novo" (toast) para 5xx — edição
  sempre pode reenviar, criação só se o backend detecta duplicata via 409.
- **`list-search.ts`** — parsing síncrono de `search` da URL do router
  (`ListSearch`/`StorefrontSearch`) — não usa VineJS aqui (síncrono).
- Demais: `labels.ts`, `breadcrumbs.ts`, `bulk.ts`, `cart.ts`,
  `chunking.ts`, `dashboard-path.ts`, `favorites.ts`, `format.ts`,
  `lookup.ts`, `metrics.ts`, `redirect-search.ts`, `route-mode.ts`,
  `storage-url.ts`, `upload-resume.ts`, `upload-transport.ts`,
  `validator-messages.ts` — cada um isolado e testável, 16 arquivos com
  `.test.ts` irmão.

### Ponte VineJS ↔ react-hook-form

```ts
const form = useForm<TValues>({
  resolver: vineResolver(validator),
  mode: 'onTouched',
  defaultValues: defaults,
  values,
})
```

Erros do servidor (422/409) não passam pelo VineJS de novo — voltam prontos
em `HTTPError.errors` e são aplicados por `lib/form-errors.ts`.

## 6. Infra / configuração

### Entry points (sem `entry.client/server.tsx` separados)

- **`src/router.tsx`** — `getRouter()`: cria `QueryClient` (via
  `getContext()`), monta `createTanStackRouter` com
  `defaultNotFoundComponent`/`defaultErrorComponent` (4xx = mensagem de
  negócio da `HTTPError`; 5xx = tela genérica + "Tentar de novo" via
  `reset()`), `defaultPreload: 'intent'`, `scrollRestoration: true`, e
  finaliza com `setupRouterSsrQueryIntegration`.
- **`src/start.ts`** — `createStart(() => ({ requestMiddleware: [requestScope] }))`,
  abre o `AsyncLocalStorage` por requisição antes de qualquer SSR/server
  function rodar.
- **`src/routes/__root.tsx`** — root document:
  `createRootRouteWithContext<{ queryClient: QueryClient }>()`,
  `shellComponent` renderiza `<html lang="pt-BR" suppressHydrationWarning>`.
  Providers em ordem: `next-themes` `ThemeProvider` (`attribute="class"`,
  `defaultTheme="system"`) → `TooltipProvider` (`delay={300}`) → `children`
  → `<Toaster/>` (sonner) → `TanStackDevtools` (só dev) → `<Scripts/>`.
  `suppressHydrationWarning` é obrigatório porque o script inline do
  `next-themes` escreve `class="dark"` antes da hidratação.

### `vite.config.ts`

```ts
plugins: [
  devtools(),
  paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide', strategy: ['url', 'baseLocale'] }),
  nitro({ preset: 'node-server' }),
  tailwindcss(),
  tanstackStart({ router: { routeToken: 'layout' } }),
  viteReact(),
  babel({ presets: [reactCompilerPreset()] }),
]
```

`nitro({ preset: 'node-server' })` é fixado porque em CI a auto-detecção por
env var poderia escolher Vercel/Netlify/Cloudflare — `Dockerfile-production`
espera `node-server`. React Compiler entra via plugin Babel separado, não
pela flag do `viteReact()`.

### i18n (Paraglide) — instalado mas **não usado**

`project.inlang/settings.json`: `baseLocale: "en"`, `locales: ["en", "de"]`.
`messages/en.json`/`de.json` só têm as 6 chaves de exemplo do scaffold.
`src/paraglide/` é saída gerada (ignorada pelo ESLint). Confirmado por grep
(zero uso fora da pasta gerada) e por comentário explícito em
`src/routes/__root.tsx`: pt-BR é **literal** no JSX (~1300 trechos),
porque `getLocale()` do Paraglide devolvia `'en'` e o site inteiro se
anunciava em inglês — "quando a tradução de verdade começar, isto volta a
sair do paraglide". Vestígio do scaffold `create-tanstack-app`, não
arquitetura ativa.

### `tsconfig.json`

`extends: "nitro/tsconfig"` (tipos do runtime Nitro/servidor gerado).
`strict: true` + `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`/`noUncheckedSideEffectImports`
— time fecha o TS sem margem pra sobra de código morto. `verbatimModuleSyntax: true`
força `import type` explícito. `moduleResolution: "bundler"`.

### Deploy (`Dockerfile-production`)

Não builda dentro do container — só empacota artefato já pronto:

```dockerfile
FROM node:24-alpine
RUN apk add --no-cache curl        # healthcheck
COPY .output/ ./.output/           # vem do CI, não é buildado aqui
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nitro && \
    chown -R nitro:nodejs /app/.output
USER nitro                          # não roda como root
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

`.dockerignore` exclui `.git`, `*.md`, `.env*`, `.output` (o `.output` real
entra via `COPY` do artifact do CI, a entrada no `.dockerignore` é só pra
não vazar um `.output` de build local no contexto).

### Detalhes de editor/repo

- `.vscode/settings.json` — esconde `routeTree.gen.ts` de watcher, busca e
  edição (`files.readonlyInclude`), reforçando "gerado, não mexer".
- `.gitignore` guarda entradas de ferramentas que o projeto não usa mais —
  `.vinxi` (bundler antigo do TanStack Start, anterior à migração pra
  Vite+Nitro nativo) e `.wrangler` (Cloudflare Workers, preset não usado —
  `nitro({ preset: 'node-server' })` é fixo) — rastro de como o setup mudou
  sem limpar o `.gitignore`.
- Sem hook de pre-commit (nenhum `husky`/`prepare` em `package.json`) —
  diferente do `backend-old/` deste repo `adacaibs`, que tem
  `lint && typecheck && openapi:generate --check && test` no `.husky/pre-commit`.

### Tailwind v4 (`src/styles.css`)

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@import '@fontsource-variable/inter';
@plugin '@tailwindcss/typography';
@custom-variant dark (&:is(.dark *));
```

Tema em `:root`/`.dark` com tokens semânticos de marca (`--sea-ink`,
`--lagoon`, `--bg-base`, `--header-surface*`, `--star`), mapeados para os
tokens shadcn padrão (`--background`, `--primary`, ...) dentro de `@theme
inline { ... }`. Dark mode via `next-themes` class strategy. Radii da
vitrine (`--radius-chip`, `--radius-control`, `--radius-card`,
`--radius-media`) mantidos separados dos `--radius-sm/md/lg` que alimentam
os componentes shadcn, para não recolorir o painel ao mexer na vitrine.
`.header-bar` redefine tokens localmente para reusar componentes tokenizados
dentro da barra escura sem duplicar estilo. `@media
(prefers-reduced-motion: reduce)` global cobre os ~80 componentes shadcn
gerados de uma vez.

### Env vars

Só `VITE_API_URL` (prefixo `VITE_` = o que o Vite embute no bundle, nada
secreto passa por aqui). `.env.production` é versionado e embutido em
**build time**. Tipagem em `src/vite-env.d.ts` — único `interface` legítimo
do projeto (module augmentation de `ImportMetaEnv`), sem Zod/T3-env real
apesar do `.cta.json` listar `t3env` como add-on do scaffold.

### Outras configs

- `components.json` — `style: base-mira`, `baseColor: neutral`,
  `cssVariables: true`, `iconLibrary: phosphor`, aliases todos sob `#/*`.
- `tsr.config.json` — só `{ "target": "react" }`; demais convenções
  (`routesDirectory`, `generatedRouteTree`) ficam no default do plugin.
- `eslint.config.js` — `@tanstack/eslint-config` + plugins `query`/`router`
  (pegam `queryKey`/`queryFn` fora de `queryOptions()`, ordem de propriedade
  em `createFileRoute`); ignora `src/paraglide/**` e `routeTree.gen.ts`.
- `prettier.config.js` — `semi: false`, `singleQuote: true`, `trailingComma: 'all'`.
- `.cursorrules` — só uma instrução: instalar componente shadcn novo via
  `pnpm dlx shadcn@latest add <nome>`, nunca escrever `components/ui/*` à mão.

### Verificação pós-build: `scripts/check-chunk-cycles.mjs`

Script de CI sem dependência externa (Node puro), rodado sobre `.output/server`
depois do build. Não acusa ciclo de chunk em si — o próprio comentário do
código explica que o router do TanStack Router legitimamente sai em dois
chunks que se reexportam mutuamente, e reprovar todo ciclo seria "um vermelho
permanente que ninguém consegue apagar". O que ele detecta é mais específico:
dentro de um ciclo de chunks, uma leitura que roda **na avaliação do módulo**
(chamada de função, acesso de propriedade, spread em escopo de módulo — não
dentro de um `loader`, componente ou corpo de função) de um binding importado
de outro chunk do mesmo ciclo. Como o Rolldown particiona por conteúdo e o
ESM do Node avalia um chunk do ciclo pela metade, essa leitura antecipada dá
`undefined` em produção (`TypeError: Cannot read properties of undefined`),
enquanto o build permanece verde e só a primeira requisição real revela o
bug. Implementa um parser artesanal (`eagerOnly()`) que apaga string,
comentário, regex e corpo de função/classe do código-fonte mantendo os
números de linha, pra isolar só o que roda de fato na carga do módulo. Tem
teste próprio (`check-chunk-cycles.test.ts`) exercitando o parser.

### Testes

`vitest run` sem `vitest.config.ts` próprio — usa `vite.config.ts` direto. Os
25 arquivos `.test.ts` estão em `lib/` (a maioria), `hooks/`, dois em
`components/common/` (`currency-input`, `date-picker`), dois em
`integrations/tanstack-query/` (`http`, `http.server`), dois em `routes/`
(`use-row-keys`, `filter-chip-grid`) e um em `scripts/`. Quase todos testam
lógica pura (`slugify`, `format`, `chunking`, `bulk`, parsers de busca), e
**um testa comportamento de hook**: `hooks/use-resource-form.test.ts` abre com
`// @vitest-environment jsdom` e usa `renderHook` de `@testing-library/react` —
que é o que justifica as duas devDependencies. Convenção é sempre
`arquivo.test.ts` colocado ao lado do `arquivo.ts`, nunca pasta `__tests__/`.

### `docs/` e `public/`

- `docs/vitrine-redesign.md` — único doc do projeto, um changelog de design
  ("antes e depois") de um redesenho pontual da vitrine, com referência a
  commits e tabela de decisão de token/contraste. Não é um padrão a seguir
  em toda feature — é registro ad-hoc de uma mudança visual específica,
  formato que pode inspirar como registrar decisão de UI aqui se
  necessário.
- `public/manifest.json` — outro vestígio de scaffold, como o Paraglide
  (§6): `"name": "Create TanStack App Sample"`, ícone/tema genéricos do
  `create-tanstack-app`, nunca rebrandado pro produto.
- `README.md` — 100% o boilerplate padrão do `create-tanstack-app` (seções
  genéricas de Getting Started, Routing, Server Functions, "Demo files"),
  nunca editado pro produto — zero documentação própria do projeto além de
  `docs/vitrine-redesign.md`.

### Vestígios do scaffold `create-tanstack-app` (`.cta.json`)

`.cta.json` lista os add-ons escolhidos na criação:
`eslint, nitro, compiler, paraglide, shadcn, t3env, table, store, tanstack-query`.
Nem todos viraram arquitetura ativa:

| Add-on | Estado real |
|---|---|
| `paraglide` | instalado e configurado, mas não consumido — pt-BR é literal no JSX (§6) |
| `t3env` | escolhido, mas nunca implementado — `src/env.mjs` citado pelo `README.md` não existe; validação de env é só a interface manual em `vite-env.d.ts` |
| `store` (`@tanstack/store`) | escolhido, mas **nem chegou a ser instalado** — não é dependency, zero uso em `src/` |
| `eslint`, `nitro`, `compiler`, `shadcn`, `table`, `tanstack-query` | esses sim viraram arquitetura de verdade, cobertos ao longo deste documento |

`pnpm-workspace.yaml` também não é um monorepo de múltiplos pacotes aqui —
só declara `allowBuilds` (permite rodar build script nativo de `esbuild` e
`unrs-resolver` sem prompt do pnpm), mesma mecânica que `backend-old/` usa no
projeto irmão `adacaibs`.

## 7. Convenções transversais (o que já vale para `adacaibs`)

Já compartilhado com o backend deste repo (mesmo espírito do skill
`code-pattern`):

- `Merge<A, B>` no lugar de `&` para interseção de tipos.
- Sem `forwardRef` — React 19 aceita `ref` como prop normal.
- `components/common/` reservado só para o que mais de uma rota/tela usa;
  o resto fica colocado (`-components/` aqui, equivalente a colocation por
  feature no backend).
- Enums como lookup object (`as const`) — `lib/entity.ts` no frontend é o
  mesmo padrão de `app/core/entity.ts` no backend, inclusive o cuidado de
  não misturar import pesado (VineJS) no arquivo de enum puro.

Específico deste frontend, sem equivalente direto no backend:
- Par `.tsx`/`.lazy.tsx` por rota (dados vs UI, code-splitting do router).
- Guard de autenticação por posição na árvore de diretórios (`_private/`),
  não por middleware explícito por rota.
- Compound components com contexto memoizado (`form-shell/`,
  `confirm-dialog/`) em vez de props de configuração.
- Queries/mutations centralizadas em 2 arquivos grandes seccionados por
  comentário, em vez de um arquivo por recurso.

## 8. Qual referência de `_doc-lib/` consultar por área

`/home/jhollyfer/Desktop/adacaibs/_doc-lib/` já tem doc offline (import real +
trecho de código, não tutorial) pras libs centrais desta arquitetura — é a
mesma função que este arquivo cumpre pra estrutura, só que por biblioteca.
Mapeamento por seção deste documento:

| Área deste mapa | Arquivo em `_doc-lib/` | Cobre |
|---|---|---|
| §2 Roteamento | `tanstack-router.md` | file-based routing, `createFileRoute`, loader, `beforeLoad`, `validateSearch` |
| §2 Roteamento (entry, SSR) | `tanstack-start.md` | `createServerFn`, root document, integração SSR — mesmo não sendo usado aqui (API routes), é a referência se a migração decidir usar |
| §3 `components/ui/` | `base-ui.md` | primitivas sem estilo por trás do shadcn (`useRender`, `render` prop, `data-*` de estado) |
| §3 `components/ui/` (geração) | `shadcn.md` | os componentes vendored em si — cva, variantes, composição |
| §3/§4 `components/common/table/` | `tanstack-table.md` | o motor headless por trás da casca de listagem |
| §4 Data layer | `tanstack-query.md` | `queryOptions`, `useSuspenseQuery`, `ensureQueryData`, devtools |
| §4/§5 formulário | `react-hook-form.md` | `useForm`, `Controller`, ponte com resolver |
| §5 `lib/validator.ts` | `vinejs.md` | schema builder, `messagesProvider`, `convertEmptyStringsToNull` — o mesmo doc que já serve o `backend-old/` |
| §6 build/config | `vitejs.md` | plugins, `resolve.tsconfigPaths`, config geral |
| §6 deploy | `nitro.md` | preset `node-server`, `.output/`, o que o `Dockerfile-production` empacota — mesmo doc que serve o backend, já que os dois usam Nitro |
| `authentication/sign-up` (máscara CPF/CEP) | `use-mask-input.md` | os 3 passos de cadastro (§1, tabela de libs) |

Sem correspondente ativo:
- **`tanstack-store.md` existe, mas `@tanstack/store` não é dependência do
  frontend de referência** (§6 — add-on escolhido no scaffold, nunca
  instalado). Não há o que migrar daqui; se a migração não trouxer Store,
  esse arquivo fica sem uso.
- `@tiptap/*`, `@dnd-kit/*`, `recharts`, `embla-carousel-react`, `cmdk`,
  `sonner`, `next-themes`, `date-fns`, `react-day-picker`,
  `react-resizable-panels`, `input-otp`, `cva`/`clsx`/`tailwind-merge` — sem
  arquivo próprio em `_doc-lib/`. Não é lacuna grave: cada um vive
  encapsulado num único arquivo de `components/ui/` ou `components/common/`
  (§3, tabela de libs), então o próprio arquivo do frontend de referência já
  é a documentação de uso.
- `adonisjs.md`, `lucid.md`, `flydrive.md`, `openapi.md` — lado backend, sem
  relação com este documento (já cobertos por `backend-old/` + `.specs/`
  deste repo).
