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
    <footer className="mt-3 rounded-t-block bg-foreground px-4 dark:bg-card pt-16 pb-10 sm:mt-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-heading-sm text-background dark:text-card-foreground">
              Maiyu Academy
            </p>
            <p className="mt-3 max-w-[38ch] text-body-sm text-background/70 dark:text-muted-foreground">
              Escola de tecnologia em {ADDRESS.city}, no Amazonas. Aulas
              presenciais aos sábados.
            </p>
            {/* TODO: acrescentar o logradouro quando `ADDRESS.street` for preenchido. */}
            <p className="mt-4 text-sm text-background/70 dark:text-muted-foreground">
              {ADDRESS.city}, {ADDRESS.state}
            </p>
          </div>

          <nav
            aria-label="Cursos"
            className="grid content-start gap-2.5 text-sm"
          >
            <p className="font-medium text-background dark:text-card-foreground">
              Cursos
            </p>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'robotica' }}
              className="text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              Robótica
            </Link>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'web-development' }}
              className="text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              Desenvolvimento web
            </Link>
            <Link
              to="/sobre"
              className="text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              A escola
            </Link>
          </nav>

          <div className="grid content-start gap-2.5 text-sm">
            <p className="font-medium text-background dark:text-card-foreground">
              Contato
            </p>
            <a
              href={whatsappUrl(FOOTER_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              <WhatsappLogo className="size-4" />
              {formatPhone(WHATSAPP_NUMBER.slice(2))}
            </a>
            <a
              href="https://instagram.com/maiyu.academy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              <InstagramLogo className="size-4" />
              maiyu.academy
            </a>
          </div>

          <nav
            aria-label="Legal"
            className="grid content-start gap-2.5 text-sm"
          >
            <p className="font-medium text-background dark:text-card-foreground">
              Legal
            </p>
            <Link
              to="/privacidade"
              className="text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              className="text-background/70 dark:text-muted-foreground transition-colors hover:text-background dark:hover:text-card-foreground"
            >
              Termos de uso
            </Link>
          </nav>
        </div>

        <Separator className="my-10 bg-background/20 dark:bg-foreground/20" />

        <p className="text-sm text-background/70 dark:text-muted-foreground">
          © {new Date().getFullYear()} Maiyu Academy
        </p>
      </div>
    </footer>
  )
}
