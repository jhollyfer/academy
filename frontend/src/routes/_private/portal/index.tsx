import { createFileRoute } from '@tanstack/react-router'
import { portalEnrollmentsQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * A área de quem é atendido pela escola: responsável e aluno.
 *
 * Vive sob `_private` para herdar o guard de sessão, mas o recorte que importa é
 * do servidor - `/portal/enrollments` devolve só o que é da pessoa, e um
 * administrador que chegasse aqui receberia 403 do middleware de papel.
 */
export const Route = createFileRoute('/_private/portal/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(portalEnrollmentsQueryOptions()),
})
