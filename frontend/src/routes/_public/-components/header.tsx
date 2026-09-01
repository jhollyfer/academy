import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { List } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '#/components/ui/sheet'

/**
 * Os destinos do site. Uma lista e não JSX repetido: o menu de desktop e o de
 * celular leem a mesma coisa, e duas cópias divergiriam no primeiro link novo.
 */
const LINKS = [
  { to: '/cursos/$slug', params: { slug: 'robotica' }, label: 'Robótica' },
  { to: '/cursos/$slug', params: { slug: 'web-development' }, label: 'Desenvolvimento web' },
  { to: '/sobre', params: undefined, label: 'A escola' },
] as const

export function Header(): React.JSX.Element {
  return (
    // `sticky` e não `fixed`: fixo tira o elemento do fluxo e obriga a compensar
    // a altura com um espaçador, que é onde o layout escorrega quando a barra
    // muda de tamanho.
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight italic">
          Maiyu <span className="text-neon">Academy</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
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

        <div className="ml-auto flex items-center gap-2">
          <Button render={<Link to="/matricula" />} className="hidden sm:inline-flex">
            Garanta sua vaga
          </Button>

          {/*
            O menu de celular é um Sheet, e o item de navegação fecha por
            `SheetClose` envolvendo o `Link` - e não por um `onClick` que mexe em
            estado. É a regra do padrão: o componente é não-controlado.
          */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <List />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-lg font-extrabold italic">
                Maiyu <span className="text-neon">Academy</span>
              </SheetTitle>

              <nav aria-label="Principal" className="grid gap-1 px-4">
                {LINKS.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <Link
                        to={link.to}
                        params={link.params}
                        className="rounded-md px-3 py-2.5 text-base text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}
                <SheetClose
                  render={
                    <Link
                      to="/matricula"
                      className="mt-3 rounded-md bg-primary px-3 py-2.5 text-center font-medium text-primary-foreground"
                    >
                      Garanta sua vaga
                    </Link>
                  }
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
