import type * as React from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { AuthenticationInviteAcceptValidator } from '#/lib/validator'
import type { AuthenticationInviteAcceptPayload } from '#/lib/validator'
import { useAuthenticationInviteAccept } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { applyMutationError } from '#/lib/form-errors'
import { errorId, invalidProps } from '#/lib/form-a11y'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  AuthShell,
  AuthShellBrand,
  AuthShellDescription,
} from '../../../-components/auth-shell'
import { InputPassword } from '../../../-components/input-password'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'

const route = getRouteApi('/authentication/invite/$token/')

/** Os campos que o backend pode marcar. `root` não entra: o helper já o trata. */
const FIELDS = ['password', 'passwordConfirmation'] as const

/**
 * A tela onde o titular escolhe a própria senha.
 *
 * Existe para que a secretaria nunca digite a credencial de uma família: ela
 * cadastra a conta, e o link no e-mail traz a pessoa até aqui.
 *
 * O convite já foi conferido no `loader`, então um link morto não chega a
 * desenhar formulário nenhum - quem clicou lê o motivo e sabe o que fazer, em
 * vez de escolher uma senha para vê-la recusada no envio.
 */
export function InviteForm(): React.JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const state = route.useLoaderData()
  const { token } = route.useParams()

  const form = useForm<AuthenticationInviteAcceptPayload>({
    resolver: vineResolver(AuthenticationInviteAcceptValidator),
    mode: 'onTouched',
    defaultValues: { password: '', passwordConfirmation: '' },
  })

  const mutation = useAuthenticationInviteAccept(token, {
    onSuccess: async function () {
      // O `POST` já devolveu os cookies da sessão: daqui a pessoa entra direto,
      // sem passar pelo login para digitar a senha que acabou de escolher.
      // Invalidar antes de navegar, como no sign-in - o guard do `_private` lê
      // este cache no `beforeLoad`.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })
      await router.navigate({ to: '/administrator' })
    },
    onError: function (error) {
      applyMutationError({
        form,
        error,
        fields: FIELDS,
        retry: { id: 'invite', onClick: () => form.handleSubmit(submit)() },
      })
    },
  })

  function submit(values: AuthenticationInviteAcceptPayload) {
    mutation.mutate(values)
  }

  if (!state.usable) {
    return (
      <AuthShell>
        <AuthShellBrand>Maiyu Academy</AuthShellBrand>

        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Este convite não pode ser usado</AlertTitle>
          <AlertDescription>{state.reason}</AlertDescription>
        </Alert>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthShellBrand>Maiyu Academy</AuthShellBrand>
      <AuthShellDescription>
        Escolha a senha do seu acesso.
      </AuthShellDescription>

      {/* `method="post"` pelo mesmo motivo do sign-in: um envio na janela entre
          o HTML chegar e o React hidratar é nativo, e o padrão do HTML é GET -
          que poria a senha na barra de endereço e no histórico. */}
      <form method="post" onSubmit={form.handleSubmit(submit)} className="mt-8">
        <FieldGroup>
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Nova senha</FieldLabel>
                <InputPassword
                  {...field}
                  id="password"
                  required
                  autoComplete="new-password"
                  {...invalidProps(fieldState.invalid, 'password')}
                />
                {fieldState.error && (
                  <FieldError id={errorId('password')}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="passwordConfirmation"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="passwordConfirmation">
                  Confirme a senha
                </FieldLabel>
                <InputPassword
                  {...field}
                  id="passwordConfirmation"
                  required
                  autoComplete="new-password"
                  {...invalidProps(fieldState.invalid, 'passwordConfirmation')}
                />
                {fieldState.error && (
                  <FieldError id={errorId('passwordConfirmation')}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending && 'Salvando…'}
            {!mutation.isPending && 'Definir senha e entrar'}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
