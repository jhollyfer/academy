import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'
import { ADDRESS, WHATSAPP_NUMBER, whatsappUrl } from '#/lib/site'
import { formatPhone } from '#/lib/format'

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-extrabold tracking-tight italic">
              Maiyu <span className="text-neon">Academy</span>
            </p>
            <p className="mt-3 max-w-[38ch] text-sm text-muted-foreground">
              Escola de tecnologia em {ADDRESS.city}, no Amazonas. Aulas na {ADDRESS.street}.
            </p>
          </div>

          <nav aria-label="Cursos" className="grid content-start gap-2 text-sm">
            <p className="font-medium">Cursos</p>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'robotica' }}
              className="text-muted-foreground hover:text-foreground"
            >
              Robótica
            </Link>
            <Link
              to="/cursos/$slug"
              params={{ slug: 'web-development' }}
              className="text-muted-foreground hover:text-foreground"
            >
              Desenvolvimento web
            </Link>
            <Link to="/sobre" className="text-muted-foreground hover:text-foreground">
              A escola
            </Link>
          </nav>

          <div className="grid content-start gap-2 text-sm">
            <p className="font-medium">Contato</p>
            <a
              href={whatsappUrl('Olá! Quero saber mais sobre os cursos da Maiyu Academy.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <WhatsappLogo className="size-4" />
              {formatPhone(WHATSAPP_NUMBER.slice(2))}
            </a>
            <a
              href="https://instagram.com/maiyu.academy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <InstagramLogo className="size-4" />
              Instagram
            </a>
          </div>
        </div>

        {/*
          O wordmark gigante do rodapé, gesto das duas referências. `select-none`
          e `aria-hidden`: é a marca desenhada em tipo, e o leitor de tela já
          leu "Maiyu Academy" no início do rodapé - repetir seria ler a mesma
          coisa duas vezes.
        */}
        <p
          aria-hidden
          className="mt-16 select-none font-display text-[16vw] leading-[0.8] font-extrabold tracking-tighter text-white/5 italic"
        >
          MAIYU
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Maiyu Academy</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link to="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link to="/termos" className="hover:text-foreground">
              Termos de uso
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
