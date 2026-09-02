import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { List, WhatsappLogo } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import { PillButton } from '#/components/common/pill-button'
import { ThemeToggle } from '#/components/common/theme-toggle'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { navLinkVariants } from './nav-link'
import { whatsappUrl } from '#/lib/site'

/**
 * Os destinos do site. Uma lista e não JSX repetido: o menu de desktop e o de
 * celular leem a mesma coisa, e duas cópias divergiriam no primeiro link novo.
 */
const LINKS = [
  { to: '/cursos/$slug', params: { slug: 'robotica' }, label: 'Robótica' },
  {
    to: '/cursos/$slug',
    params: { slug: 'web-development' },
    label: 'Desenvolvimento web',
  },
  { to: '/sobre', params: undefined, label: 'A escola' },
] as const

const HEADER_MESSAGE =
  'Olá! Vi o site da Maiyu Academy e quero tirar uma dúvida.'

/**
 * A faixa do topo: navegação à esquerda, marca ao centro, contato e matrícula à
 * direita.
 *
 * A marca ao centro só a partir de `lg`. Abaixo disso o centro é disputado pelo
 * botão de menu e pelo CTA, e uma marca centralizada entre os dois fica torta em
 * qualquer largura: no celular ela volta para a esquerda, que é onde o polegar
 * espera o caminho de volta para a home.
 *
 * `sticky` e não `fixed`: fixo tira o elemento do fluxo e obriga a compensar a
 * altura com um espaçador, que é onde o layout escorrega quando a barra muda de
 * tamanho.
 */
export function Header(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 lg:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              params={link.params}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: 'text-foreground' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="text-heading-sm text-foreground lg:justify-self-center"
        >
          Maiyu Academy
        </Link>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
          <PillButton
            tone="outline"
            scale="md"
            className="hidden md:inline-flex"
            render={
              <a
                href={whatsappUrl(HEADER_MESSAGE)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappLogo />
                WhatsApp
              </a>
            }
          />

          {/*
            O mesmo botão do painel, e não um segundo: ele faltava aqui, e a
            vitrine seguia o tema do sistema sem ninguém poder trocar. Fica
            antes da pílula de matrícula de propósito - o CTA é o último
            elemento da barra em toda largura.
          */}
          <ThemeToggle className="size-11 lg:size-8" />

          <EnrollmentCta className="hidden sm:inline-flex" />

          {/*
            O menu de celular é um Sheet, e o item de navegação fecha por
            `SheetClose` envolvendo o `Link` - e não por um `onClick` que mexe em
            estado. É a regra do padrão: o componente é não-controlado.
          */}
          <Sheet>
            <SheetTrigger
              render={
                // `size-11` e não o `size-8` do `icon-lg`: é o único caminho
                // para o menu no celular, e um alvo de 32px erra debaixo do
                // polegar.
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="size-11 lg:hidden"
                  aria-label="Abrir menu"
                >
                  <List />
                </Button>
              }
            />
            <SheetContent side="right" className="w-80 bg-background">
              {/*
                `SheetHeader` e `SheetFooter` e não os filhos nus: o padding do
                painel mora neles. Sem eles o título encostava na borda enquanto
                a navegação logo abaixo tinha recuo próprio.
              */}
              <SheetHeader>
                <SheetTitle className="text-heading-sm text-foreground">
                  Maiyu Academy
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navegação do site e contato.
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Principal" className="grid gap-1 px-6">
                {LINKS.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <Link
                        to={link.to}
                        params={link.params}
                        className={navLinkVariants({ tone: 'sheet' })}
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}

                <SheetClose
                  render={
                    <a
                      href={whatsappUrl(HEADER_MESSAGE)}
                      target="_blank"
                      rel="noreferrer"
                      className={navLinkVariants({ tone: 'sheet' })}
                    >
                      WhatsApp
                    </a>
                  }
                />
              </nav>

              {/*
                O CTA também dentro de `SheetClose`: ele navega para
                `/matricula`, e sem fechar o painel a rota trocava atrás de um
                Sheet aberto, com o scroll da página preso.
              */}
              <SheetFooter>
                {/*
                  `scale="lg"` e não o `md` padrão: o `md` tem 40px de altura,
                  e este é um botão de dedo no rodapé de um painel de celular -
                  os 48px do `lg` passam com folga dos 44px da WCAG 2.5.5.
                */}
                <SheetClose
                  render={<EnrollmentCta scale="lg" className="w-full" />}
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
