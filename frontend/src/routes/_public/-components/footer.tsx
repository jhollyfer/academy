import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'

import { Separator } from '#/components/ui/separator'
import { ADDRESS, WHATSAPP_NUMBER, whatsappUrl } from '#/lib/site'
import { formatPhone } from '#/lib/format'
import { navLinkVariants } from './nav-link'

const FOOTER_MESSAGE = 'Olá! Quero saber mais sobre os cursos da Maiyu Academy.'

/**
 * O rodapé, em bloco escuro com os cantos de cima arredondados.
 *
 * Os cantos arredondados só no topo: o rodapé encosta na base da janela, e
 * arredondar embaixo deixaria duas fatias de creme nos cantos inferiores, que
 * é o tipo de detalhe que parece falha de renderização.
 *
 * Três colunas e nenhuma de aplicativo: não há aplicativo. A referência tem uma,
 * e copiá-la seria anunciar um produto que não existe.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-brand-ink px-4 pt-16 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-heading-sm text-white">Maiyu Academy</p>
            <p className="mt-3 max-w-[38ch] text-body-sm text-white/70">
              Escola de tecnologia em {ADDRESS.city}, no Amazonas. Aulas
              presenciais aos sábados.
            </p>
            {/* TODO: acrescentar o logradouro quando `ADDRESS.street` for preenchido. */}
            <p className="mt-4 text-sm text-white/70">
              {ADDRESS.city}, {ADDRESS.state}
            </p>
          </div>

          <nav aria-label="Cursos" className="grid content-start gap-1 text-sm">
            <p className="font-medium text-white">Cursos</p>
            <Link
              to="/courses/$slug"
              params={{ slug: 'robotics' }}
              className={navLinkVariants()}
            >
              Robótica
            </Link>
            <Link
              to="/courses/$slug"
              params={{ slug: 'web-development' }}
              className={navLinkVariants()}
            >
              Desenvolvimento web
            </Link>
            <Link to="/about" className={navLinkVariants()}>
              Quem somos
            </Link>
          </nav>

          <div className="grid content-start gap-1 text-sm">
            <p className="font-medium text-white">Contato</p>
            <a
              href={whatsappUrl(FOOTER_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className={navLinkVariants()}
            >
              <WhatsappLogo className="size-4" />
              {formatPhone(WHATSAPP_NUMBER.slice(2))}
            </a>
            <a
              href="https://instagram.com/maiyu.academy"
              target="_blank"
              rel="noreferrer"
              className={navLinkVariants()}
            >
              <InstagramLogo className="size-4" />
              maiyu.academy
            </a>
          </div>

          <nav aria-label="Legal" className="grid content-start gap-1 text-sm">
            <p className="font-medium text-white">Legal</p>
            <Link to="/privacy" className={navLinkVariants()}>
              Privacidade
            </Link>
            <Link to="/terms" className={navLinkVariants()}>
              Termos de uso
            </Link>
          </nav>
        </div>

        <Separator className="my-10 bg-neon/15" />

        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} Maiyu Academy
        </p>
      </div>
    </footer>
  )
}
