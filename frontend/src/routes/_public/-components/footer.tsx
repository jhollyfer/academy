import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'

import { Separator } from '#/components/ui/separator'
import { ADDRESS, WHATSAPP_NUMBER, whatsappUrl } from '#/lib/site'
import { formatPhone } from '#/lib/format'

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
    <footer className="mt-3 rounded-t-block bg-ink px-4 pt-16 pb-10 sm:mt-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold tracking-tight text-cream">
              Maiyu Academy
            </p>
            <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-cream/60">
              Escola de tecnologia em {ADDRESS.city}, no Amazonas. Aulas
              presenciais aos sábados.
            </p>
            {/* TODO: acrescentar o logradouro quando `ADDRESS.street` for preenchido. */}
            <p className="mt-4 text-sm text-cream/60">
              {ADDRESS.city}, {ADDRESS.state}
            </p>
          </div>

          <nav
            aria-label="Cursos"
            className="grid content-start gap-2.5 text-sm"
          >
            <p className="font-medium text-cream">Cursos</p>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'robotica' }}
              className="text-cream/60 transition-colors hover:text-neon"
            >
              Robótica
            </Link>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'web-development' }}
              className="text-cream/60 transition-colors hover:text-neon"
            >
              Desenvolvimento web
            </Link>
            <Link
              to="/sobre"
              className="text-cream/60 transition-colors hover:text-neon"
            >
              A escola
            </Link>
          </nav>

          <div className="grid content-start gap-2.5 text-sm">
            <p className="font-medium text-cream">Contato</p>
            <a
              href={whatsappUrl(FOOTER_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-neon"
            >
              <WhatsappLogo className="size-4" />
              {formatPhone(WHATSAPP_NUMBER.slice(2))}
            </a>
            <a
              href="https://instagram.com/maiyu.academy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-neon"
            >
              <InstagramLogo className="size-4" />
              maiyu.academy
            </a>
          </div>

          <nav
            aria-label="Legal"
            className="grid content-start gap-2.5 text-sm"
          >
            <p className="font-medium text-cream">Legal</p>
            <Link
              to="/privacidade"
              className="text-cream/60 transition-colors hover:text-neon"
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              className="text-cream/60 transition-colors hover:text-neon"
            >
              Termos de uso
            </Link>
          </nav>
        </div>

        <Separator className="my-10 bg-cream/10" />

        <p className="text-sm text-cream/50">
          © {new Date().getFullYear()} Maiyu Academy
        </p>
      </div>
    </footer>
  )
}
