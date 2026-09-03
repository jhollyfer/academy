import type * as React from 'react'
import { HandHeart, Path, UsersThree } from '@phosphor-icons/react'

import { CardContent, CardDescription, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Leaf } from '#/components/common/marks'
import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'

/**
 * Por que a escola existe.
 *
 * A página tinha onze seções sobre **o que** a escola faz - cursos, horários,
 * vagas, matrícula - e nenhuma sobre para que ela existe. Este bloco é essa
 * resposta, e ele fica antes de "para quem é": a pessoa decide se é para ela
 * depois de saber o que a escola está tentando fazer, não antes.
 *
 * **Nada aqui promete emprego a quem se matricula.** É a mesma linha que o
 * bloco seguinte defende, e ela não afrouxou: abrir uma porta e garantir a
 * passagem por ela são coisas diferentes, e só a primeira está no alcance de
 * uma escola que ainda não formou ninguém. Por isso os verbos são de intenção -
 * "nasce para", "existe para" -, e a única entrega afirmada é a que a página
 * inteira já sustenta: a base e o projeto.
 *
 * "Sem distinção de raça, cor ou etnia" está escrito, e não subentendido: numa
 * região onde a maior parte dos jovens é indígena, o silêncio não é neutro.
 *
 * Mas está escrito como compromisso da escola, e não como lista de grupos. A
 * primeira versão dizia "jovens indígenas e não indígenas", e ela nomeava uma
 * divisão para logo depois negá-la - quem lê fica com a divisão. Uma escola que
 * é de todo mundo daqui não precisa dividir todo mundo em dois para dizer isso.
 */
const PILLARS = [
  {
    icon: UsersThree,
    title: 'Talento daqui, sem filtro',
    description:
      'A escola é da juventude do Alto Solimões, sem distinção de raça, cor ou etnia. O talento já está na região; o que faltava era a porta.',
  },
  {
    icon: Path,
    title: 'A porta do mercado de TI',
    description:
      'A escola existe para abrir o caminho até o mercado de tecnologia: base de verdade, projeto pronto e a curiosidade de quem descobriu que dá para construir.',
  },
  {
    icon: HandHeart,
    title: 'Ação social e comunidade',
    description:
      'Ações beneficentes e sociais fazem parte do projeto, e não são um anexo dele. A escola só faz sentido dentro da comunidade onde está.',
  },
] as const

export function Mission(): React.JSX.Element {
  return (
    <section
      data-slot="home-mission"
      className="relative overflow-hidden bg-background"
    >
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. Cada seção era um cartão flutuando
        sobre o fundo, e empilhadas viravam uma pilha de cartões com
        listras de fundo entre eles. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Leaf className="-top-24 -right-24 size-80 -rotate-12 text-primary/10" />

        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            className={REVEAL}
            lead="Por que esta"
            accent="escola existe"
          />

          <p
            className={cn(
              REVEAL,
              'delay-100 mt-6 max-w-[64ch] text-body-md text-muted-foreground sm:text-body-lg',
            )}
          >
            A Maiyu nasce para ser a primeira escola de tecnologia do Alto
            Solimões, para que morar aqui deixe de ser o motivo pelo qual alguém
            não entra nessa área.
          </p>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <SectionCard
                key={pillar.title}
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <CardContent className="flex flex-col gap-4">
                  {/* O mesmo disco do WhatsApp e do "o que você leva": ícone
                      centrado num círculo de `--primary`. */}
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary">
                    <pillar.icon
                      weight="regular"
                      className="size-6 text-primary-foreground"
                    />
                  </span>

                  <CardTitle className="text-heading-sm text-foreground">
                    {pillar.title}
                  </CardTitle>
                  <CardDescription className="text-body-sm text-muted-foreground">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </SectionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
