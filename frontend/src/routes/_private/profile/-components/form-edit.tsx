import type * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'
import { withMask } from 'use-mask-input'

import {
  FormShell,
  FormShellActions,
  FormShellBack,
  FormShellCard,
  FormShellContent,
  FormShellDiscard,
  FormShellHeader,
  FormShellSubmit,
  FormShellTitle,
} from '#/components/common/form-shell'
import {
  ImageField,
  ImageFieldActions,
  ImageFieldContent,
  ImageFieldDescription,
  ImageFieldPreview,
  ImageFieldRemove,
  ImageFieldUpload,
} from '#/components/common/image-field'
import { InputPassword } from '#/components/common/input-password'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { useAccountUpdate } from '#/integrations/tanstack-query/mutations'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { applyMutationError } from '#/lib/form-errors'
import { errorId, invalidProps } from '#/lib/form-a11y'
import { initials } from '#/lib/labels'
import { AccountUpdateValidator } from '#/lib/validator'
import type { AccountUpdatePayload } from '#/lib/validator'

const FORM_ID = 'profile'

/**
 * Os campos que o backend pode acusar.
 *
 * `currentPassword` está na lista porque é dele que vem o
 * `422 CURRENT_PASSWORD_INVALID`: o use-case devolve
 * `errors: { currentPassword: 'Senha atual inválida' }`, e sem a chave aqui a
 * mensagem cairia no rodapé do formulário em vez de apontar o campo.
 */
const FIELDS = [
  'name',
  'email',
  'phone',
  'password',
  'currentPassword',
  'avatarId',
] as const

/**
 * A edição da própria conta. Quem só quer conferir os dados fica na ficha, em
 * `-components/profile.tsx`.
 *
 * Escrita à mão, e não sobre o `useResourceForm`: o `onSuccess` daquele hook
 * sempre volta para `backTo`, e aqui o destino depende do que mudou - trocar
 * e-mail ou senha derruba **todas** as sessões no servidor, inclusive esta, e o
 * lugar certo depois disso é o login.
 */
export function ProfileFormEdit(): React.JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()

  // O `loader` da rota já garantiu o dado; aqui é leitura de cache.
  const { data: account } = useSuspenseQuery(accountQueryOptions())

  const form = useForm<AccountUpdatePayload>({
    resolver: vineResolver(AccountUpdateValidator),
    mode: 'onTouched',
    // Sem isto os campos nascem `undefined`, e o input monta não controlado
    // para virar controlado na primeira tecla.
    defaultValues: {
      name: '',
      email: '',
      phone: null,
      password: '',
      currentPassword: '',
      avatarId: null,
    },
    // `values`, e não `defaultValues`: a conta chega depois do primeiro render,
    // quando `defaultValues` já congelou.
    values: {
      name: account.name,
      email: account.email,
      phone: account.phone,
      password: '',
      currentPassword: '',
      avatarId: account.avatarId,
    },
  })

  const name = form.watch('name')

  const mutation = useAccountUpdate({
    onError: (error, payload) =>
      applyMutationError({
        form,
        error,
        fields: FIELDS,
        // Edição sempre pode reenviar: o `PUT` escreve o mesmo estado final e
        // não cria nada.
        retry: {
          id: 'account-update-error',
          onClick: () => mutation.mutate(payload),
        },
      }),
    async onSuccess(updated, payload) {
      // Por prefixo: o guard do layout e a barra lateral leem a mesma chave.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })

      // Trocar e-mail ou senha derruba **todas** as sessões, inclusive esta. O
      // redirecionamento para o login não é efeito colateral a evitar: é o que
      // já aconteceu do lado do servidor, e mandar a pessoa de volta ao painel
      // só a faria descobrir isso no próximo 401.
      if (payload.email !== account.email || payload.password) {
        toast.success('Acesso atualizado. Entre de novo.')
        router.navigate({ to: '/authentication' })

        return
      }

      // Volta para a ficha, e não para o painel: quem salvou veio de lá, e é lá
      // que o nome novo aparece para conferência.
      toast.success(`${updated.name} salvo.`)
      router.navigate({ to: '/profile' })
    },
  })

  function onValid(values: AccountUpdatePayload): void {
    // Senha em branco é "não quero trocar", e não "quero apagar": mandá-la vazia
    // faria o validator do backend recusar o formulário inteiro por força de
    // senha, num envio que só mudava o nome.
    const payload: AccountUpdatePayload = { ...values }

    if (!payload.password) {
      delete payload.password
      delete payload.currentPassword
    }

    mutation.mutate(payload)
  }

  return (
    <FormShell
      formId={FORM_ID}
      backTo="/profile"
      isPending={mutation.isPending}
    >
      <FormShellHeader>
        <FormShellBack />
        <FormShellTitle>Editar perfil</FormShellTitle>
        <FormShellActions>
          <FormShellDiscard />
          <FormShellSubmit />
        </FormShellActions>
      </FormShellHeader>

      <FormShellContent onSubmit={form.handleSubmit(onValid)}>
        <FormShellCard>
          <FieldGroup>
            <Controller
              control={form.control}
              name="avatarId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-avatar">
                    Foto (opcional)
                  </FieldLabel>
                  <ImageField
                    id="profile-avatar"
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    previewUrl={account.avatar?.url ?? null}
                  >
                    <ImageFieldPreview alt="Foto da conta">
                      {initials(name)}
                    </ImageFieldPreview>
                    <ImageFieldContent>
                      <ImageFieldActions>
                        <ImageFieldUpload>Enviar foto</ImageFieldUpload>
                        <ImageFieldRemove />
                      </ImageFieldActions>
                      <ImageFieldDescription />
                    </ImageFieldContent>
                  </ImageField>
                  {fieldState.error && (
                    <FieldError id={errorId('avatarId')}>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Nome</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id="profile-name"
                    autoComplete="name"
                    {...invalidProps(fieldState.invalid, 'name')}
                  />
                  {fieldState.error && (
                    <FieldError id={errorId('name')}>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    {...invalidProps(fieldState.invalid, 'email')}
                  />
                  <FieldDescription>
                    Trocar o e-mail encerra a sessão em todos os aparelhos.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError id={errorId('email')}>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-phone">Telefone</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id="profile-phone"
                    inputMode="tel"
                    autoComplete="tel"
                    ref={withMask('(99) 99999-9999')}
                    {...invalidProps(fieldState.invalid, 'phone')}
                  />
                  {fieldState.error && (
                    <FieldError id={errorId('phone')}>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FormShellCard>

        <FormShellCard>
          <FieldSet>
            <FieldLegend>Trocar senha</FieldLegend>

            {/* O aviso vem antes dos campos, e não depois: quem lê depois já
                  digitou. */}
            <Alert>
              <AlertDescription>
                Deixe em branco para manter a senha atual. Trocá-la encerra a
                sessão em todos os aparelhos, inclusive neste.
              </AlertDescription>
            </Alert>

            <FieldGroup>
              <Controller
                control={form.control}
                name="currentPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-currentPassword">
                      Senha atual
                    </FieldLabel>
                    <InputPassword
                      {...field}
                      value={field.value ?? ''}
                      id="profile-currentPassword"
                      autoComplete="current-password"
                      {...invalidProps(fieldState.invalid, 'currentPassword')}
                    />
                    {fieldState.error && (
                      <FieldError id={errorId('currentPassword')}>
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-password">
                      Nova senha
                    </FieldLabel>
                    <InputPassword
                      {...field}
                      value={field.value ?? ''}
                      id="profile-password"
                      autoComplete="new-password"
                      {...invalidProps(fieldState.invalid, 'password')}
                    />
                    <FieldDescription>
                      Ao menos 8 caracteres, com maiúscula, minúscula, número e
                      símbolo.
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError id={errorId('password')}>
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </FormShellCard>
      </FormShellContent>
    </FormShell>
  )
}
