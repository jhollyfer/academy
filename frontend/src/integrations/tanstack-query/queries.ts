import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { request } from './http'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import type {
  AccountResponse,
  ClassResponse,
  CourseResponse,
  EnrollmentResponse,
  Paginated,
} from '../response'
import type { ListSearch } from '#/lib/list-search'

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
 * Converte o filtro da URL em query string.
 *
 * Chave com valor `undefined` **não entra**: `?search=undefined` é uma busca
 * pela palavra "undefined", e o backend a aplicaria sem reclamar.
 */
function params(search: Record<string, unknown>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') continue

    query.set(key, String(value))
  }

  const text = query.toString()

  if (!text) return ''

  return `?${text}`
}

// ---------------------------------------------------------------------------
// account
// ---------------------------------------------------------------------------

/**
 * A sessão. É o que o guard de `_private` usa para decidir se deixa passar, e
 * por isso não tem `retry`: um 401 aqui é resposta, não falha de rede, e
 * repetir três vezes só atrasa o redirecionamento para o login.
 */
export function accountQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.account.all,
    queryFn: ({ signal }) => request<AccountResponse>('/account/profile', { signal }),
    retry: false,
  })
}

// ---------------------------------------------------------------------------
// administrator/courses
// ---------------------------------------------------------------------------

export function coursesListQueryOptions(search: ListSearch) {
  return queryOptions({
    queryKey: queryKeys.courses.list(search),
    queryFn: ({ signal }) =>
      request<Paginated<CourseResponse>>(`/administrator/courses${params(search)}`, { signal }),
    // Mantém a página anterior enquanto a nova carrega. Sem isto a tabela some e
    // reaparece a cada troca de filtro, e a página inteira pula de altura.
    placeholderData: keepPreviousData,
  })
}

export function courseDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.courses.detail(id),
    queryFn: ({ signal }) =>
      request<CourseResponse>(`/administrator/courses/${id}`, { signal }),
  })
}

// ---------------------------------------------------------------------------
// administrator/classes
// ---------------------------------------------------------------------------

export function classesListQueryOptions(search: ListSearch & { courseId?: string }) {
  return queryOptions({
    queryKey: queryKeys.classes.list(search),
    queryFn: ({ signal }) =>
      request<Paginated<ClassResponse>>(`/administrator/classes${params(search)}`, { signal }),
    placeholderData: keepPreviousData,
  })
}

export function classDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.classes.detail(id),
    queryFn: ({ signal }) => request<ClassResponse>(`/administrator/classes/${id}`, { signal }),
  })
}

// ---------------------------------------------------------------------------
// administrator/enrollments
// ---------------------------------------------------------------------------

export function enrollmentsListQueryOptions(
  search: ListSearch & { courseId?: string; classId?: string; status?: string }
) {
  return queryOptions({
    queryKey: queryKeys.enrollments.list(search),
    queryFn: ({ signal }) =>
      request<Paginated<EnrollmentResponse>>(`/administrator/enrollments${params(search)}`, {
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function enrollmentDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: ({ signal }) =>
      request<EnrollmentResponse>(`/administrator/enrollments/${id}`, { signal }),
  })
}

// ---------------------------------------------------------------------------
// storefront
// ---------------------------------------------------------------------------

export function storefrontCoursesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.storefront.courses(),
    queryFn: ({ signal }) =>
      request<Paginated<CourseResponse>>('/storefront/courses', { signal }),
  })
}

export function storefrontCourseQueryOptions(slug: string) {
  return queryOptions({
    queryKey: queryKeys.storefront.course(slug),
    queryFn: ({ signal }) => request<CourseResponse>(`/storefront/courses/${slug}`, { signal }),
  })
}

/**
 * O acompanhamento da matrícula pelo protocolo.
 *
 * `retry: false` pelo mesmo motivo da sessão: protocolo errado é 404 e é
 * resposta - insistir só faz o candidato olhar um spinner antes de ler que o
 * número não existe.
 */
export function storefrontEnrollmentQueryOptions(protocol: string) {
  return queryOptions({
    queryKey: queryKeys.storefront.enrollment(protocol),
    queryFn: ({ signal }) =>
      request<EnrollmentResponse>(`/storefront/enrollments/${protocol}`, { signal }),
    retry: false,
  })
}
