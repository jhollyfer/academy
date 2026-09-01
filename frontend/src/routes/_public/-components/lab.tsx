import * as React from 'react'
import { Reveal } from './reveal'

/**
 * O laboratório.
 *
 * Seção de imagem larga, e não mais um par de cards: é a terceira vez que a
 * página mostraria um bloco de texto ao lado de uma foto, e três seguidas viram
 * ritmo de template. Aqui a foto ocupa a largura toda e o texto assenta por
 * cima, o que também é honesto com o conteúdo - a estrutura física é o
 * argumento, não a legenda dela.
 *
 * TODO: trocar por foto real da bancada e dos kits, 2000x1000.
 */
export function Lab(): React.JSX.Element {
  return (
    <section className="relative">
      <div className="relative isolate h-[420px] overflow-hidden lg:h-[520px]">
        <img
          src="https://picsum.photos/seed/maiyu-academy-bancada-arduino/2000/1000"
          alt="Bancada do laboratório com kits de eletrônica, placas e ferramentas"
          width={2000}
          height={1000}
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/*
          O véu escuro não é enfeite: sem ele o texto branco sobre uma foto de
          bancada clara cai abaixo de 4,5:1 e deixa de ser legível.
        */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-background/30"
        />

        <div className="mx-auto flex h-full max-w-7xl items-end px-4 pb-12">
          <Reveal className="max-w-[46ch]">
            <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl">
              Aula com a placa <span className="text-neon">na mão</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Kit de eletrônica, bancada e computador na FAMETRO. Você não precisa levar nada.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
