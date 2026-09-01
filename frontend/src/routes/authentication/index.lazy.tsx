import * as React from 'react'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { AuthenticationSignInValidator } from '#/lib/validator'
import type { AuthenticationSignInPayload } from '#/lib/validator'
import { useSignIn } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { applyMutationError } from '#/lib/form-errors'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Route as SignInRoute } from './index'

/** Os campos que o backend pode marcar. `root` não entra: é o canal de "a
 *  mensagem é do formulário", e o helper já o trata. */
const FIELDS = ['email', 'password'] as const

export const Route = createLazyFileRoute('/authentication/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const search = SignInRoute.useSearch()

  const form = useForm<AuthenticationSignInPayload>({
    resolver: vineResolver(AuthenticationSignInValidator),
    // `onTouched` e não `onChange`: validar a cada tecla acusa "e-mail
    // inválido" enquanto a pessoa ainda está digitando o `@`.
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useSignIn({
    onSuccess: async function () {
      // Invalidar antes de navegar: o guard lê o cache no `beforeLoad`, e sem
      // isto ele reusaria a ausência de sessão de um segundo atrás - o login
      // "não funcionaria" sem erro nenhum na tela.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })
      await router.navigate({ to: search.redirect ?? '/admin' })
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
    <div className="relative flex min-h-svh items-center justify-center px-4 py-12">

      <div className="relative w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Maiyu <span className="text-neon-ink">Academy</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso da secretaria.
        </p>

        <form onSubmit={form.handleSubmit(submit)} className="mt-8">
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
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />

            {form.formState.errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending && 'Entrando...'}
              {!mutation.isPending && 'Entrar'}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
