import { createFileRoute } from '@tanstack/react-router'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * A ficha da própria conta: nome, e-mail, papel, situação e desde quando existe
 * - tudo o que `GET /account/profile` responde.
 *
 * Ler e editar são rotas separadas, como nos dois projetos irmãos: esta é a
 * única tela do painel que a pessoa abre para **conferir** quem ela é, e um
 * formulário não responde nada disso sem ser preenchido. Juntas, abrir o perfil
 * significaria entrar em modo de edição de senha para descobrir o próprio
 * e-mail.
 *
 * O `loader` reusa a mesma `queryOptions` do guard de `_private/layout.tsx`, com
 * a mesma chave: aqui não sai requisição nova, o cache já está cheio.
 */
export const Route = createFileRoute('/_private/profile/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountQueryOptions()),
})
