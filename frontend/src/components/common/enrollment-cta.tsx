import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  ENROLLMENT_CTA_LABEL,
  WAITING_LIST_MESSAGE,
  enrollmentStateFrom,
} from '#/lib/enrollment-state'
import { whatsappUrl } from '#/lib/site'
import type { Merge } from '#/lib/interfaces'

/**
 * O resto das props vai para o `Button` porque este botão é embrulhável: dentro
 * do menu mobile ele mora num `<SheetClose render={<EnrollmentCta />} />`, e o
 * Base UI funde `onClick` e `ref` no elemento do `render`. Um componente que
 * não espalha o resto descarta os dois em silêncio - a pessoa navega e o painel
 * fica aberto por cima da página.
 *
 * `render` fica de fora: quem decide o elemento renderizado é este componente,
 * que é o que ele existe para decidir.
 */
type EnrollmentCtaProps = Merge<
  Omit<React.ComponentProps<typeof Button>, 'render' | 'children'>,
  {
    /** O curso a pré-selecionar, quando o botão sai de dentro de um card. */
    courseSlug?: string
  }
>

/**
 * O botão de matrícula, em qualquer lugar da vitrine.
 *
 * É o único componente que decide para onde "Garanta sua vaga" leva, e ele
 * existe porque a página tinha quatro botões com esse texto levando todos a
 * `/matricula` sem perguntar se havia turma. Quem chegava lá lia "nenhuma turma
 * aberta" depois de clicar num convite.
 *
 * Sem turma anunciada o botão deixa de prometer matrícula: vira conversa no
 * WhatsApp, que é onde a secretaria sabe responder quando abre. Mandar a pessoa
 * a um formulário vazio gasta o clique dela para não entregar nada.
 *
 * `useQuery` e não uma prop vinda de cima: o cabeçalho vive no layout e não
 * recebe os dados da rota. Como a chave é a mesma que a home já busca, o
 * TanStack Query devolve do cache - o botão do topo e o do rodapé não são duas
 * requisições, são duas leituras da mesma.
 *
 * `useQuery` e não `useSuspenseQuery` pelo mesmo motivo do loader: uma consulta
 * fora do ar não pode derrubar o cabeçalho de todas as páginas. Enquanto ela não
 * volta, o botão mostra o rótulo de captação, que é o que serve tanto para
 * "ainda não sei" quanto para "não há turma".
 */
export function EnrollmentCta({
  variant = 'pill',
  size = 'pill',
  className,
  courseSlug,
  ...rest
}: EnrollmentCtaProps): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())

  const state = enrollmentStateFrom(data?.data)
  const label = ENROLLMENT_CTA_LABEL[state.kind]

  // O curso de onde o botão saiu, quando ele saiu de dentro de um card. Vazio
  // é a home e o cabeçalho, que não escolhem por ninguém.
  let search: { curso?: string } = {}
  if (courseSlug) search = { curso: courseSlug }

  if (state.kind === 'NONE') {
    return (
      <Button
        {...rest}
        variant={variant}
        size={size}
        className={className}
        render={
          <a
            href={whatsappUrl(WAITING_LIST_MESSAGE)}
            target="_blank"
            rel="noreferrer"
          >
            {label}
            <ArrowRight />
          </a>
        }
      />
    )
  }

  return (
    <Button
      {...rest}
      variant={variant}
      size={size}
      className={className}
      render={
        // `search` e não caminho: a matrícula lê `?curso` para já abrir no curso
        // de onde a pessoa veio, e recarregar a página não perde a escolha.
        <Link to="/matricula" search={search}>
          {label}
          <ArrowRight />
        </Link>
      }
    />
  )
}
