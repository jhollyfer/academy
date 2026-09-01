import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { CircuitBackground, StatItem } from '#/components/common/neon'

/**
 * Os fatos que a escola já tem fechados. Números reais, das artes de lançamento
 * - nenhum é estimativa nem enfeite de precisão.
 */
const FACTS = [
  { value: '4', label: 'meses de curso' },
  { value: '16', label: 'sábados de aula' },
  { value: '32h', label: 'de carga horária' },
  { value: '40', label: 'vagas por turma' },
] as const

export function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <CircuitBackground />

      {/*
        `min-h` e não `h-screen`: no Safari do iPhone a barra de endereço muda de
        altura ao rolar, e `h-screen` faz a seção pular junto.
      */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-24">
        <div>
          {/*
            Duas linhas, e a segunda no acento: é o gesto das artes, e é o que
            faz quem clicou no anúncio reconhecer a página antes de ler.
          */}
          <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance italic sm:text-5xl lg:text-6xl">
            A Maiyu Academy chegou em{' '}
            <span className="text-neon">Benjamin Constant</span>
          </h1>

          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Robótica e desenvolvimento web, presencial, aos sábados, dentro da FAMETRO.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button render={<Link to="/matricula" />} size="lg">
              Garanta sua vaga
              <ArrowRight />
            </Button>
            <Button
              render={<Link to="/cursos/$slug" params={{ slug: 'robotica' }} />}
              size="lg"
              variant="outline"
            >
              Ver os cursos
            </Button>
          </div>
        </div>

        {/*
          A foto vem do `picsum` com semente descritiva enquanto as imagens reais
          do laboratório não chegam. É placeholder anotado, não escolha: foto de
          banco de imagens numa cidade pequena é reconhecida como falsa por quem
          mora lá, e o efeito é o oposto do pretendido.

          TODO: trocar por foto real do laboratório na FAMETRO, 1200x900.
        */}
        <div className="chamfer neon-glow relative aspect-[4/3] overflow-hidden bg-surface">
          <img
            src="https://picsum.photos/seed/maiyu-academy-lab-robotica/1200/900"
            alt="Alunos em uma bancada de eletrônica montando um projeto de robótica"
            width={1200}
            height={900}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>

      {/*
        A barra de fatos fica **abaixo** do hero, não dentro dele: o hero é a
        proposta e o botão, e empilhar mais um bloco de texto ali empurraria o
        CTA para fora da primeira tela no celular.
      */}
      <div className="relative border-t border-white/5 bg-surface/40">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-8 sm:grid-cols-4">
          {FACTS.map((fact) => (
            <StatItem key={fact.label} value={fact.value} label={fact.label} />
          ))}
        </dl>
      </div>
    </section>
  )
}
