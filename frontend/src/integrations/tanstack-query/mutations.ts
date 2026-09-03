import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import { download, request } from './http'
import { useMultipartUpload } from '#/hooks/use-multipart-upload'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { HTTPError } from './http'
import type {
  AccountResponse,
  ClassResponse,
  CourseResponse,
  EnrollmentResponse,
  ManagedUserResponse,
  StorageResponse,
  StorefrontEnrollmentResponse,
} from '../response'
import type {
  AdministratorClassCreatePayload,
  AdministratorClassUpdatePayload,
  AccountUpdatePayload,
  AdministratorCourseCreatePayload,
  AdministratorCourseUpdatePayload,
  AdministratorEnrollmentUpdatePayload,
  AdministratorUserCreatePayload,
  AdministratorUserUpdatePayload,
  AuthenticationInviteAcceptPayload,
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
// /storages
// ---------------------------------------------------------------------------

/**
 * Envia um arquivo e devolve o registro com a `url` derivada.
 *
 * O envio inteiro é do `useMultipartUpload`: o binário não passa pela API, e o
 * que acontece aqui dentro são três chamadas - abrir, subir direto ao bucket,
 * confirmar. Esta mutation existe por cima dele para dar o `isPending` e os
 * callbacks a quem só quer "subiu ou não", que é o caso do campo de imagem
 * única. Quem precisa da barra de progresso e do cancelamento usa o hook
 * direto, porque `useMutation` não tem por onde entregar progresso.
 *
 * O erro é `Error` e não `HTTPError`: o hook recusa localmente o tipo de
 * arquivo antes de gastar requisição, e essa recusa não tem status HTTP.
 *
 * O arquivo nasce **sem dono**: quem anexa é que guarda a referência,
 * informando o `id` devolvido aqui em `coverId` ou `avatarId` da entidade que
 * recebe o anexo. Por isso a mutation não invalida nada - não há listagem de
 * anexos para atualizar.
 *
 * O `AbortSignal` é de um controller que vive enquanto o componente vive, e é
 * abortado quando ele sai de cena. Um controller que nascesse e morresse na
 * mesma linha da chamada daria um sinal que ninguém pode disparar: sair da tela
 * no meio do envio deixaria as partes subindo até o fim, gastando banda por um
 * arquivo que já não interessa a ninguém - e o registro `PENDING` que sobrasse
 * só sumiria na varredura do servidor.
 */
export function useStorageCreate(
  options?: MutationProps<StorageResponse, File, Error>,
) {
  const { upload } = useMultipartUpload()
  const controller = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    return () => controller.current?.abort()
  }, [])

  return useMutation<StorageResponse, Error, File>({
    ...options,
    mutationFn: function (file) {
      // Um por envio: um controller abortado não volta a valer, e reaproveitá-lo
      // faria o envio seguinte nascer cancelado.
      controller.current = new AbortController()

      return upload(file, () => undefined, controller.current.signal)
    },
  })
}

/**
 * Apaga um arquivo órfão: o binário e a linha em `storages`.
 *
 * É o par do `useStorageCreate`, e fecha o buraco que ele abre: o upload
 * acontece na hora da escolha, **antes** de o formulário ser salvo, então todo
 * anexo trocado ou removido da tela ficava em disco para sempre.
 *
 * O backend recusa com `409 STORAGE_IN_USE` o arquivo que alguém referencia,
 * então chamar esta mutation sobre um anexo já salvo é seguro: a resposta é um
 * erro, não uma imagem furada em outro cadastro.
 */
export function useStorageDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/storages/'.concat(id), { method: 'DELETE' })
    },
  })
}

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
export function useAuthenticationSignIn(
  options?: MutationProps<void, AuthenticationSignInPayload>,
) {
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

/**
 * Define a senha pelo convite e abre a sessão na mesma resposta.
 *
 * Devolve `void` pelo mesmo motivo do sign-in: o corpo é `204` e o que importa
 * vem no `Set-Cookie`. E, como o sign-in, quem chama tem de invalidar
 * `queryKeys.account.all` antes de navegar.
 *
 * O token vai no caminho, e não no corpo: é ele que faz o papel da sessão nesta
 * requisição, que é pública por necessidade - quem chega aqui ainda não tem
 * senha.
 */
export function useAuthenticationInviteAccept(
  token: string,
  options?: MutationProps<void, AuthenticationInviteAcceptPayload>,
) {
  return useMutation<void, HTTPError, AuthenticationInviteAcceptPayload>({
    ...options,
    mutationFn: function (payload) {
      return request<void>(
        `/authentication/invite/${encodeURIComponent(token)}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )
    },
  })
}

export function useAuthenticationSignOut(options?: MutationProps<void, void>) {
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
  options?: MutationProps<CourseResponse, AdministratorCourseCreatePayload>,
) {
  return useMutation<
    CourseResponse,
    HTTPError,
    AdministratorCourseCreatePayload
  >({
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
  options?: MutationProps<CourseResponse, AdministratorCourseUpdatePayload>,
) {
  return useMutation<
    CourseResponse,
    HTTPError,
    AdministratorCourseUpdatePayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<CourseResponse>('/administrator/courses/'.concat(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// administrator/users
// ---------------------------------------------------------------------------

export function useUserCreate(
  options?: MutationProps<ManagedUserResponse, AdministratorUserCreatePayload>,
) {
  return useMutation<
    ManagedUserResponse,
    HTTPError,
    AdministratorUserCreatePayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<ManagedUserResponse>('/administrator/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useUserUpdate(
  id: string,
  options?: MutationProps<ManagedUserResponse, AdministratorUserUpdatePayload>,
) {
  return useMutation<
    ManagedUserResponse,
    HTTPError,
    AdministratorUserUpdatePayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<ManagedUserResponse>('/administrator/users/'.concat(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}

export function useUserArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/users/'.concat(id, '/archive'), {
        method: 'PATCH',
      })
    },
  })
}

export function useUserUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/users/'.concat(id, '/unarchive'), {
        method: 'PATCH',
      })
    },
  })
}

/**
 * Irreversível, e só o dono alcança - a API responde 403 para o resto. Recusa
 * usuário vivo e usuário com matrícula vinculada.
 */
export function useUserDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/users/'.concat(id), {
        method: 'DELETE',
      })
    },
  })
}

export function useCourseArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/courses/'.concat(id, '/archive'), {
        method: 'PATCH',
      })
    },
  })
}

export function useCourseUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/courses/'.concat(id, '/unarchive'), {
        method: 'PATCH',
      })
    },
  })
}

/** Irreversível, e só o dono alcança - a API responde 403 para o resto. */
export function useCourseDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/courses/'.concat(id), {
        method: 'DELETE',
      })
    },
  })
}

// ---------------------------------------------------------------------------
// administrator/classes
// ---------------------------------------------------------------------------

export function useClassCreate(
  options?: MutationProps<ClassResponse, AdministratorClassCreatePayload>,
) {
  return useMutation<ClassResponse, HTTPError, AdministratorClassCreatePayload>(
    {
      ...options,
      mutationFn: function (payload) {
        return request<ClassResponse>('/administrator/classes', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      },
    },
  )
}

export function useClassUpdate(
  id: string,
  options?: MutationProps<ClassResponse, AdministratorClassUpdatePayload>,
) {
  return useMutation<ClassResponse, HTTPError, AdministratorClassUpdatePayload>(
    {
      ...options,
      mutationFn: function (payload) {
        return request<ClassResponse>('/administrator/classes/'.concat(id), {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      },
    },
  )
}

export function useClassArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/classes/'.concat(id, '/archive'), {
        method: 'PATCH',
      })
    },
  })
}

export function useClassUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/classes/'.concat(id, '/unarchive'), {
        method: 'PATCH',
      })
    },
  })
}

export function useClassDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/classes/'.concat(id), {
        method: 'DELETE',
      })
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
  options?: MutationProps<
    EnrollmentResponse,
    AdministratorEnrollmentUpdatePayload
  >,
) {
  return useMutation<
    EnrollmentResponse,
    HTTPError,
    AdministratorEnrollmentUpdatePayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<EnrollmentResponse>(
        '/administrator/enrollments/'.concat(id),
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
      )
    },
  })
}

export function useEnrollmentArchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(
        '/administrator/enrollments/'.concat(id, '/archive'),
        {
          method: 'PATCH',
        },
      )
    },
  })
}

export function useEnrollmentUnarchive(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>(
        '/administrator/enrollments/'.concat(id, '/unarchive'),
        {
          method: 'PATCH',
        },
      )
    },
  })
}

export function useEnrollmentDelete(options?: MutationProps<void, string>) {
  return useMutation<void, HTTPError, string>({
    ...options,
    mutationFn: function (id) {
      return request<void>('/administrator/enrollments/'.concat(id), {
        method: 'DELETE',
      })
    },
  })
}

/**
 * A exportação em CSV.
 *
 * É mutação e não query porque não é leitura de estado que a tela reflete: roda
 * quando alguém clica, uma vez, e o resultado sai do app pelo disco. Como
 * `useMutation` já dá `isPending` e `onError`, o botão desabilita e o erro vira
 * toast sem nenhum estado escrito à mão.
 *
 * `download` e não `request` - a resposta é um arquivo, não JSON.
 */
export function useEnrollmentsExport(
  options?: MutationProps<{ blob: Blob; filename: string | undefined }, void>,
) {
  return useMutation<
    { blob: Blob; filename: string | undefined },
    HTTPError,
    void
  >({
    ...options,
    mutationFn: function () {
      return download('/administrator/enrollments/export')
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
  options?: MutationProps<
    StorefrontEnrollmentResponse,
    StorefrontEnrollmentCreatePayload
  >,
) {
  return useMutation<
    StorefrontEnrollmentResponse,
    HTTPError,
    StorefrontEnrollmentCreatePayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<StorefrontEnrollmentResponse>('/storefront/enrollments', {
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
  options?: MutationProps<
    StorefrontEnrollmentResponse,
    StorefrontEnrollmentAttachmentPayload
  >,
) {
  return useMutation<
    StorefrontEnrollmentResponse,
    HTTPError,
    StorefrontEnrollmentAttachmentPayload
  >({
    ...options,
    mutationFn: function (payload) {
      return request<StorefrontEnrollmentResponse>(
        '/storefront/enrollments/'.concat(protocol, '/attachments'),
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )
    },
  })
}

/**
 * Edita a própria conta.
 *
 * É o único caminho para trocar a própria senha: o update de usuários recusa
 * `password` de propósito, para a secretaria não assumir a conta de uma família
 * sem deixar rastro.
 *
 * Quem chama tem de invalidar `queryKeys.account.all` no sucesso - o nome e o
 * e-mail aparecem na barra lateral, e sem a invalidação a tela segue mostrando
 * os antigos até um recarregamento.
 *
 * Trocar e-mail ou senha **derruba a sessão desta aba junto**, porque o backend
 * revoga todos os tokens. Quem chama precisa mandar a pessoa entrar de novo em
 * vez de deixá-la clicando numa tela que responderá 401.
 */
export function useAccountUpdate(
  options?: MutationProps<AccountResponse, AccountUpdatePayload>,
) {
  return useMutation<AccountResponse, HTTPError, AccountUpdatePayload>({
    ...options,
    mutationFn: function (payload) {
      return request<AccountResponse>('/account', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  })
}
