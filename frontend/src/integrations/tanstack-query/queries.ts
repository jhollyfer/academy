import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { request } from './http'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import type {
  AccountResponse,
  ClassResponse,
  CourseFaqResponse,
  CourseResponse,
  EnrollmentResponse,
  ManagedUserResponse,
  PartnerResponse,
  PhotoResponse,
  StorefrontEnrollmentResponse,
  Paginated,
} from '../response'
import type { ListSearch } from '#/lib/list-search'
import type { Merge } from '#/lib/interfaces'

/**
 * As leituras da API, num lugar só.
 *
 * `queryOptions` e não `useQuery` inline: o loader da rota chama
 * `ensureQueryData(xQueryOptions(params))` e o componente chama
 * `useQuery(xQueryOptions(params))` com os **mesmos** argumentos. A chave sai
 * idêntica porque é a mesma função que a monta - escrever `queryKey` nos dois
 * lugares é como o loader enche um cache e o componente lê outro.
 *
 * Nenhuma opção de comportamento mora aqui além de `placeholderData`: `staleTime`
 * é do `query-context.ts`, e `onSuccess`/`onError` são de quem chama.
 */

/**
 * Monta a query string ignorando o que não foi preenchido.
 *
 * Descarta por falsidade e não por `!== undefined`: o valor pode chegar `null`
 * (o search param existe e está limpo) ou `''`, e `String(null)` viraria o texto
 * "null" no filtro. `page` e `perPage` são `min(1)` no validator, mas número é
 * testado por tipo e não por verdade - um filtro numérico que aceite `0` não
 * pode sumir por ser falso.
 */
function search(
  params:
    ListSearch | CourseListSearch | ClassListSearch | EnrollmentListSearch,
): string {
  const entries = Object.entries(params).filter(
    ([, value]) => typeof value === 'number' || Boolean(value),
  )

  if (entries.length === 0) return ''

  return '?'.concat(
    new URLSearchParams(
      entries.map(([key, value]) => [key, String(value)]),
    ).toString(),
  )
}

/**
 * Os filtros de cada listagem, declarados aqui e não inline na assinatura: o
 * `validateSearch` da rota, o `loaderDeps` e o componente têm de concordar sobre
 * a forma, e um tipo com nome é o que faz o `tsc` cobrar os três.
 */
export type CourseListSearch = Merge<
  ListSearch,
  { status?: string; accent?: string }
>

export type PartnerListSearch = Merge<ListSearch, { status?: string }>

export type PhotoListSearch = Merge<ListSearch, { status?: string }>

export type ClassListSearch = Merge<
  ListSearch,
  { courseId?: string; status?: string }
>

export type EnrollmentListSearch = Merge<
  ListSearch,
  { courseId?: string; classId?: string; status?: string }
>

// ---------------------------------------------------------------------------
// account
// ---------------------------------------------------------------------------

/**
 * A sessão. É o que o guard de `_private` usa para decidir se deixa passar, e
 * por isso não tem `retry`: um 401 aqui é resposta, não falha de rede, e
 * repetir três vezes só atrasa o redirecionamento para o login.
 */
export const accountQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.account.all,
    queryFn: ({ signal }) =>
      request<AccountResponse>('/account/profile', { signal }),
    retry: false,
  })

// ---------------------------------------------------------------------------
// administrator/courses
// ---------------------------------------------------------------------------

export const coursesQueryOptions = (params: CourseListSearch) =>
  queryOptions({
    queryKey: queryKeys.courses.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<CourseResponse>>(
        '/administrator/courses'.concat(search(params)),
        { signal },
      ),
    // Mantém a página anterior enquanto a nova carrega. Sem isto a tabela some e
    // reaparece a cada troca de filtro, e a página inteira pula de altura.
    placeholderData: keepPreviousData,
  })

export const courseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.courses.detail(id),
    queryFn: ({ signal }) =>
      request<CourseResponse>('/administrator/courses/'.concat(id), { signal }),
  })

// ---------------------------------------------------------------------------
// administrator/partners
// ---------------------------------------------------------------------------

export const partnersQueryOptions = (params: PartnerListSearch) =>
  queryOptions({
    queryKey: queryKeys.partners.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<PartnerResponse>>(
        '/administrator/partners'.concat(search(params)),
        { signal },
      ),
    placeholderData: keepPreviousData,
  })

export const partnerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.partners.detail(id),
    queryFn: ({ signal }) =>
      request<PartnerResponse>('/administrator/partners/'.concat(id), {
        signal,
      }),
  })

// ---------------------------------------------------------------------------
// administrator/photos
// ---------------------------------------------------------------------------

export const photosQueryOptions = (params: PhotoListSearch) =>
  queryOptions({
    queryKey: queryKeys.photos.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<PhotoResponse>>(
        '/administrator/photos'.concat(search(params)),
        { signal },
      ),
    placeholderData: keepPreviousData,
  })

export const photoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.photos.detail(id),
    queryFn: ({ signal }) =>
      request<PhotoResponse>('/administrator/photos/'.concat(id), { signal }),
  })

// ---------------------------------------------------------------------------
// administrator/classes
// ---------------------------------------------------------------------------

export const classesQueryOptions = (params: ClassListSearch) =>
  queryOptions({
    queryKey: queryKeys.classes.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<ClassResponse>>(
        '/administrator/classes'.concat(search(params)),
        { signal },
      ),
    placeholderData: keepPreviousData,
  })

export const classQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.classes.detail(id),
    queryFn: ({ signal }) =>
      request<ClassResponse>('/administrator/classes/'.concat(id), { signal }),
  })

// ---------------------------------------------------------------------------
// administrator/enrollments
// ---------------------------------------------------------------------------

export const enrollmentsQueryOptions = (params: EnrollmentListSearch) =>
  queryOptions({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<EnrollmentResponse>>(
        '/administrator/enrollments'.concat(search(params)),
        {
          signal,
        },
      ),
    placeholderData: keepPreviousData,
  })

// ---------------------------------------------------------------------------
// administrator/users
// ---------------------------------------------------------------------------

export const usersQueryOptions = (params: ListSearch) =>
  queryOptions({
    queryKey: queryKeys.users.list(params),
    queryFn: ({ signal }) =>
      request<Paginated<ManagedUserResponse>>(
        '/administrator/users'.concat(search(params)),
        { signal },
      ),
    placeholderData: keepPreviousData,
  })

export const userQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.users.detail(id),
    queryFn: ({ signal }) =>
      request<ManagedUserResponse>('/administrator/users/'.concat(id), {
        signal,
      }),
  })

// ---------------------------------------------------------------------------
// portal
// ---------------------------------------------------------------------------

/**
 * As matrículas de quem está logado.
 *
 * Sem parâmetro de busca nem de página: quem abre esta tela tem uma ou duas
 * matrículas, e o recorte de quais linhas aparecem é do servidor - o cliente
 * não escolhe, e não teria como.
 */
export const portalEnrollmentsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.portal.enrollments(),
    queryFn: ({ signal }) =>
      request<Paginated<EnrollmentResponse>>('/portal/enrollments', { signal }),
  })

export const enrollmentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: ({ signal }) =>
      request<EnrollmentResponse>('/administrator/enrollments/'.concat(id), {
        signal,
      }),
  })

// ---------------------------------------------------------------------------
// storefront
// ---------------------------------------------------------------------------

export const storefrontCoursesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.storefront.courses(),
    queryFn: ({ signal }) =>
      request<Paginated<CourseResponse>>('/storefront/courses', { signal }),
  })

/**
 * O FAQ da escola, o que a home mostra.
 *
 * Consulta própria e não um recorte de `storefrontCourses`: as perguntas gerais
 * têm `courseId` nulo, então não pertencem a curso nenhum e nenhuma relação as
 * alcança. Elas viviam no banco sem endpoint que as servisse, e a home não
 * renderizava FAQ nenhum por causa disso.
 */
export const storefrontFaqsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.storefront.faqs(),
    queryFn: ({ signal }) =>
      request<Paginated<CourseFaqResponse>>('/storefront/faqs', { signal }),
  })

/**
 * Os parceiros que a home mostra.
 *
 * Sem `retry: false`: ao contrário do protocolo de matrícula, aqui a lista
 * vazia é resposta legítima e o erro é de rede - repetir é o certo.
 */
export const storefrontPartnersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.storefront.partners(),
    queryFn: ({ signal }) =>
      request<Paginated<PartnerResponse>>('/storefront/partners', { signal }),
  })

/** A galeria da escola. Vazia enquanto não há acervo, e a seção some. */
export const storefrontPhotosQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.storefront.photos(),
    queryFn: ({ signal }) =>
      request<Paginated<PhotoResponse>>('/storefront/photos', { signal }),
  })

export const storefrontCourseQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.storefront.course(slug),
    queryFn: ({ signal }) =>
      request<CourseResponse>('/storefront/courses/'.concat(slug), { signal }),
  })

/**
 * O acompanhamento da matrícula pelo protocolo.
 *
 * `retry: false` pelo mesmo motivo da sessão: protocolo errado é 404 e é
 * resposta - insistir só faz o candidato olhar um spinner antes de ler que o
 * número não existe.
 */
export const storefrontEnrollmentQueryOptions = (protocol: string) =>
  queryOptions({
    queryKey: queryKeys.storefront.enrollment(protocol),
    queryFn: ({ signal }) =>
      request<StorefrontEnrollmentResponse>(
        '/storefront/enrollments/'.concat(protocol),
        {
          signal,
        },
      ),
    retry: false,
  })
