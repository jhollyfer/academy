import type * as React from 'react'
import {
  Link,
  linkOptions,
  useMatchRoute,
  useRouter,
} from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpenIcon,
  CheckerboardIcon,
  GraduationCapIcon,
  SignOutIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'

import {
  Sidebar as Root,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  ConfirmDialog,
  ConfirmDialogCancel,
  ConfirmDialogConfirm,
  ConfirmDialogDescription,
  ConfirmDialogFooter,
  ConfirmDialogHeader,
  ConfirmDialogMedia,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'
import { useSignOut } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { initials } from '#/lib/labels'

/**
 * Os destinos do painel, tipados contra a árvore de rotas.
 *
 * `linkOptions` e não um array solto: ele preserva o tipo de `to`, então rota
 * removida ou renomeada vira erro de compilação aqui, em vez de um item de menu
 * que leva a lugar nenhum. Campos que não são do `<Link>` - `label`, `icon` -
 * são permitidos e vêm inferidos junto.
 *
 * A ordem é a do trabalho da secretaria: o curso existe antes da turma, e a
 * turma antes da matrícula.
 */
const NAVIGATION = linkOptions([
  { to: '/admin', label: 'Visão geral', icon: CheckerboardIcon },
  { to: '/admin/cursos', label: 'Cursos', icon: BookOpenIcon },
  { to: '/admin/turmas', label: 'Turmas', icon: GraduationCapIcon },
  { to: '/admin/matriculas', label: 'Matrículas', icon: UsersThreeIcon },
])

type NavigationItemType = (typeof NAVIGATION)[number]

/**
 * O destino do item que deve aparecer marcado, ou `undefined`.
 *
 * A regra é "o mais específico ganha". Com casamento difuso sozinho, `/admin`
 * é prefixo dos outros três e acenderia junto com eles em toda tela do painel.
 *
 * Difuso é o que se quer para o resto: em `/admin/turmas/abc-123` quem deve
 * estar marcado é Turmas.
 */
function useActiveTo(
  items: ReadonlyArray<NavigationItemType>,
): string | undefined {
  const matchRoute = useMatchRoute()

  let active: string | undefined

  for (const item of items) {
    // `label` e `icon` saem porque não são opções de rota.
    const { label: _label, icon: _icon, ...link } = item

    if (!matchRoute({ ...link, fuzzy: true })) continue
    if (active && active.length >= item.to.length) continue

    active = item.to
  }

  return active
}

/**
 * Um item de menu: o botão renderiza COMO o link, e não em volta dele.
 *
 * A ordem importa. Com o `<Link>` aninhado dentro do `SidebarMenuButton`, quem
 * recebe o clique é o botão e o `<a>` fica por dentro - sem preload no hover,
 * sem abrir em nova aba, sem clique do meio. Com `render`, o elemento final é
 * um `<a>` de verdade com as classes do botão.
 *
 * No mobile a sidebar é um Sheet, e navegar sem fechá-lo deixaria o drawer por
 * cima da tela nova. `setOpenMobile(false)` é a API que
 * `components/ui/sidebar.tsx` expõe para isso; no desktop ela não pinta nada.
 */
function NavigationItem({
  item,
  isActive,
}: {
  item: NavigationItemType
  isActive: boolean
}): React.JSX.Element {
  const { icon: Icon, label, ...link } = item
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        // Com a sidebar recolhida sobra só o ícone; o tooltip é o que devolve o
        // nome do destino, e o componente já o esconde quando ela está aberta.
        tooltip={label}
        render={<Link {...link} />}
        onClick={() => setOpenMobile(false)}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function Sidebar(): React.JSX.Element {
  const { setOpenMobile } = useSidebar()
  const router = useRouter()
  const queryClient = useQueryClient()

  // O guard de `_private/layout.tsx` já encheu este cache no `beforeLoad`, com
  // a mesma chave. Aqui não sai requisição nova.
  const { data: account } = useQuery(accountQueryOptions())

  const active = useActiveTo(NAVIGATION)

  const signOut = useSignOut({
    onSuccess: async function () {
      // Invalidar **antes** de navegar: o guard de `_private` lê o cache no
      // `beforeLoad`, e sem isto ele encontraria a sessão que acabou de morrer
      // e deixaria passar.
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.all })
      await router.navigate({ to: '/authentication' })
    },
  })

  return (
    <Root collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/admin" className="flex flex-row gap-4" />}
              onClick={() => setOpenMobile(false)}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GraduationCapIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Maiyu</span>
                <span className="truncate text-xs">Academy</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Secretaria</SidebarGroupLabel>
          <SidebarMenu>
            {NAVIGATION.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                isActive={active === item.to}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/*
            O bloco de quem entrou não é gatilho de nada. No simple-hub ele abre
            um menu, e o menu tem para onde ir - lá existe tela de perfil. Aqui
            não existe, e um `DropdownMenu` de um item só é um clique a mais
            para chegar no mesmo "Sair" que já está logo abaixo.
          */}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<div />}>
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={account?.avatar?.url} alt={account?.name} />
                <AvatarFallback className="rounded-lg">
                  {initials(account?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{account?.name}</span>
                <span className="truncate text-xs">{account?.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/*
            Sair não tem desfazer pela tela: quem clica sem querer volta para o
            login e refaz a autenticação. `AlertDialog` (via `ConfirmDialog`) e
            não `Dialog`, então nem `Esc` nem clique fora respondem por quem
            clicou.

            `mutate` e não `mutateAsync`: ninguém espera o resultado aqui, e a
            promise de `mutateAsync` rejeitaria sem handler.
          */}
          <SidebarMenuItem>
            <ConfirmDialog
              onConfirm={() => signOut.mutate()}
              trigger={
                <SidebarMenuButton tooltip="Sair" disabled={signOut.isPending}>
                  <SignOutIcon />
                  <span>Sair</span>
                </SidebarMenuButton>
              }
            >
              <ConfirmDialogHeader>
                <ConfirmDialogMedia>
                  <SignOutIcon />
                </ConfirmDialogMedia>
                <ConfirmDialogTitle>Sair da conta?</ConfirmDialogTitle>
                <ConfirmDialogDescription>
                  Você será desconectado e voltará para a tela de login.
                </ConfirmDialogDescription>
              </ConfirmDialogHeader>
              <ConfirmDialogFooter>
                <ConfirmDialogCancel />
                <ConfirmDialogConfirm>Sair</ConfirmDialogConfirm>
              </ConfirmDialogFooter>
            </ConfirmDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Root>
  )
}
