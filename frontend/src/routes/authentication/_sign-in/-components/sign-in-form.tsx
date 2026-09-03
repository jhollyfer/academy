import * as React from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { AuthenticationSignInValidator } from '#/lib/validator'
import type { AuthenticationSignInPayload } from '#/lib/validator'
import { useAuthenticationSignIn } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { applyMutationError } from '#/lib/form-errors'
import { errorId, invalidProps } from '#/lib/form-a11y'
import { Button } from '#/components/ui/button'
import {
  AuthShell,
  AuthShellBrand,
  AuthShellDescription,
} from '../../-components/auth-shell'
import { Input } from '#/components/ui/input'
import { InputPassword } from '../../-components/input-password'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'

const route = getRouteApi('/authentication/_sign-in/')

/** Os campos que o backend pode marcar. `root` não entra: é o canal de "a
 *  mensagem é do formulário", e o helper já o trata. */
const FIELDS = ['email', 'password'] as const

export function SignInForm(): React.JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const search = route.useSearch()

  const form = useForm<AuthenticationSignInPayload>({
    resolver: vineResolver(AuthenticationSignInValidator),
    // `onTouched` e não `onChange`: validar a cada tecla acusa "e-mail
    // inválido" enquanto a pessoa ainda está digitando o `@`.
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useAuthenticationSignIn({
    onSuccess: async function () {
      // Invalidar antes de navegar: o guard lê o cache no `beforeLoad`, e sem
      // isto ele reusaria a ausência de sessão de um segundo atrás - o login
      // "não funcionaria" sem erro nenhum na tela.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })
      await router.navigate({ to: search.redirect ?? '/administrator' })
    },
    onError: function (error) {
      applyMutationError({
        form,
        error,
        fields: FIELDS,
        // O reenvio só aparece em 5xx: erro de credencial não se resolve
        // clicando de novo, e oferecer o botão ali sugeriria que sim.
        retry: { id: 'sign-in', onClick: () => form.handleSubmit(submit)() },
      })
    },
  })

  function submit(values: AuthenticationSignInPayload) {
    mutation.mutate(values)
  }

  return (
    <AuthShell>
      <AuthShellBrand>Maiyu Academy</AuthShellBrand>
      <AuthShellDescription>Acesso da secretaria.</AuthShellDescription>

      {/*
        `method="post"` num formulário que só envia por JavaScript.
        Parece inútil e não é: entre o HTML do servidor chegar e o React
        hidratar existe uma janela de alguns segundos, e um envio dentro dela é
        nativo. Sem `method`, o padrão do HTML é GET, e um GET põe cada campo na
        query string - **a senha ia parar na barra de endereço**, no histórico
        do navegador e no `Referer` da próxima requisição.

        Com POST o pior caso vira um 405 do servidor, que é uma tela feia e
        nada mais. Foi assim que apareceu: uma varredura automatizada clicou em
        "Entrar" antes da hidratação e a URL voltou
        `?email=...&password=...`.
      */}
      <form method="post" onSubmit={form.handleSubmit(submit)} className="mt-8">
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  {...invalidProps(fieldState.invalid, 'email')}
                />
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
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                {/* `InputPassword` e não `<Input type="password">`: o olho
                      que revela a senha é o que evita a terceira tentativa de
                      quem errou uma letra. Mora em `-components/` do grupo, e
                      não aqui, porque a tela de convite pede senha também. */}
                <InputPassword
                  {...field}
                  id="password"
                  required
                  autoComplete="current-password"
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
            {mutation.isPending && 'Entrando…'}
            {!mutation.isPending && 'Entrar'}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
