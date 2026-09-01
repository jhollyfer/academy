import { useMutation } from '@tanstack/react-query'
import { request } from './http'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { HTTPError } from './http'
import type { ClassResponse, CourseResponse, EnrollmentResponse } from '../response'
import type {
  AdministratorClassCreatePayload,
  AdministratorClassUpdatePayload,
  AdministratorCourseCreatePayload,
  AdministratorCourseUpdatePayload,
  AdministratorEnrollmentUpdatePayload,
  AuthenticationSignInPayload,
  StorefrontEnrollmentAttachmentPayload,
  StorefrontEnrollmentCreatePayload,
} from '#/lib/validator'

/**
 * As escritas da API, num lugar só.
 *
 * Cada hook fornece **apenas** o `mutationFn`. `onSuccess`, `onError`,
 * `invalidateQueries` e toast são de quem chama - na prática, do
 * `use-resource-form.ts`, que os monta uma vez para todos os formulários.
 *
 * Amarrar um `onSuccess` aqui dentro pareceria conveniente e seria o oposto: um
 * segundo chamador que precisasse de outro comportamento teria de desfazer o
 * primeiro, e `useMutation` não compõe callbacks - o de quem chama substitui o
 * daqui, em silêncio.
 */
type MutationProps<TData, TPayload, TError = HTTPError> = Omit<
  UseMutationOptions<TData, TError, TPayload>,
  'mutationFn'
>

// ---------------------------------------------------------------------------
// authentication
// ---------------------------------------------------------------------------

/**
 * Abre a sessão. Devolve `void`: a resposta é `204` e o que importa vem no
 * `Set-Cookie`, que o navegador guarda sozinho.
 *
 * Quem chama tem de invalidar `queryKeys.account.all` no sucesso - sem isso o
 * guard reusa a ausência de sessão que ele cacheou um segundo antes, e o login
 * "não funciona" sem erro nenhum na tela.
 */
export function useSignIn(options?: MutationProps<void, AuthenticationSignInPayload>) {
  return useMutation<void, HTTPError, AuthenticationSignInPayload>({
    ...options,
    mutationFn: function (payload) {
      return request<void>('/authentication/sign-in', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useSignOut(options?: MutationProps<void, void>) {
  return useMutation<void, HTTPError, void>({
    ...options,
    mutationFn: function () {
      return request<void>('/authentication/sign-out', { method: 'POST' })
    },
  })
}

// ---------------------------------------------------------------------------
// administrator/courses
// ---------------------------------------------------------------------------

export function useCourseCreate(
  options?: MutationProps<CourseResponse, AdministratorCourseCreatePayload>
) {
  return useMutation<CourseResponse, HTTPError, AdministratorCourseCreatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<CourseResponse>('/administrator/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useCourseUpdate(
  id: string,
  options?: MutationProps<CourseResponse, AdministratorCourseUpdatePayload>
) {
  return useMutation<CourseResponse, HTTPError, AdministratorCourseUpdatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<CourseResponse>(`/administrator/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useCourseArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/courses/${id}/archive`, { method: 'PATCH' })
    },
  })
}

export function useCourseUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/courses/${id}/unarchive`, { method: 'PATCH' })
    },
  })
}

/** Irreversível, e só o dono alcança - a API responde 403 para o resto. */
export function useCourseDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/courses/${id}`, { method: 'DELETE' })
    },
  })
}

// ---------------------------------------------------------------------------
// administrator/classes
// ---------------------------------------------------------------------------

export function useClassCreate(
  options?: MutationProps<ClassResponse, AdministratorClassCreatePayload>
) {
  return useMutation<ClassResponse, HTTPError, AdministratorClassCreatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<ClassResponse>('/administrator/classes', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useClassUpdate(
  id: string,
  options?: MutationProps<ClassResponse, AdministratorClassUpdatePayload>
) {
  return useMutation<ClassResponse, HTTPError, AdministratorClassUpdatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<ClassResponse>(`/administrator/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useClassArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/classes/${id}/archive`, { method: 'PATCH' })
    },
  })
}

export function useClassUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/classes/${id}/unarchive`, { method: 'PATCH' })
    },
  })
}

export function useClassDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/classes/${id}`, { method: 'DELETE' })
    },
  })
}

// ---------------------------------------------------------------------------
// administrator/enrollments
// ---------------------------------------------------------------------------

/**
 * Move o estado da matrícula, ou anota.
 *
 * O 409 de transição inválida e o de comprovante ausente chegam aqui como
 * `HTTPError` com `errors.status` preenchido - o `form-errors.ts` os põe sob o
 * campo, e não num toast solto.
 */
export function useEnrollmentUpdate(
  id: string,
  options?: MutationProps<EnrollmentResponse, AdministratorEnrollmentUpdatePayload>
) {
  return useMutation<EnrollmentResponse, HTTPError, AdministratorEnrollmentUpdatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<EnrollmentResponse>(`/administrator/enrollments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useEnrollmentArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/enrollments/${id}/archive`, { method: 'PATCH' })
    },
  })
}

export function useEnrollmentUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/enrollments/${id}/unarchive`, { method: 'PATCH' })
    },
  })
}

export function useEnrollmentDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(`/administrator/enrollments/${id}`, { method: 'DELETE' })
    },
  })
}

// ---------------------------------------------------------------------------
// storefront
// ---------------------------------------------------------------------------

/**
 * A matrícula virtual. Sem sessão - é a única escrita pública da API.
 *
 * O 422 de responsável legal chega com um erro por campo (`guardianName`,
 * `guardianDocument`, `guardianPhone`), e é o `form-errors.ts` que os distribui
 * pelos inputs.
 */
export function useEnrollmentCreate(
  options?: MutationProps<EnrollmentResponse, StorefrontEnrollmentCreatePayload>
) {
  return useMutation<EnrollmentResponse, HTTPError, StorefrontEnrollmentCreatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<EnrollmentResponse>('/storefront/enrollments', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}

/**
 * Anexa um arquivo **já enviado** ao bucket. Recebe o `id` do `storages`, nunca
 * o binário.
 */
export function useEnrollmentAttach(
  protocol: string,
  options?: MutationProps<EnrollmentResponse, StorefrontEnrollmentAttachmentPayload>
) {
  return useMutation<EnrollmentResponse, HTTPError, StorefrontEnrollmentAttachmentPayload>({
    ...options,
    mutationFn: function (payload) {
      return request<EnrollmentResponse>(`/storefront/enrollments/${protocol}/attachments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}
