import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { List, WhatsappLogo } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
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
    <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur">
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
              className="text-sm text-ink-soft transition-colors hover:text-ink"
              activeProps={{ className: 'text-ink' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-ink lg:justify-self-center"
        >
          Maiyu Academy
        </Link>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
          <Button
            variant="pill-outline"
            size="pill"
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

          <EnrollmentCta className="hidden sm:inline-flex" />

          {/*
            O menu de celular é um Sheet, e o item de navegação fecha por
            `SheetClose` envolvendo o `Link` - e não por um `onClick` que mexe em
            estado. É a regra do padrão: o componente é não-controlado.
          */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="lg:hidden"
                  aria-label="Abrir menu"
                >
                  <List />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 bg-cream">
              <SheetTitle className="text-lg font-semibold">
                Maiyu Academy
              </SheetTitle>

              <nav aria-label="Principal" className="grid gap-1 px-4">
                {LINKS.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <Link
                        to={link.to}
                        params={link.params}
                        className="rounded-md px-3 py-2.5 text-base text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
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
                      className="rounded-md px-3 py-2.5 text-base text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      WhatsApp
                    </a>
                  }
                />

                <EnrollmentCta className="mt-3 w-full" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
