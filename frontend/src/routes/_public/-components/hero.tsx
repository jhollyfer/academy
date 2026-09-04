import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { PillButton } from '#/components/common/pill-button'
import { CircuitTrails, Petal } from '#/components/common/marks'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { enrollmentStateFrom, scheduleSummary } from '#/lib/enrollment-state'
import { formatDate, pluralize } from '#/lib/format'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * A primeira dobra: o bloco verde arredondado com a chamada e a data da turma.
 *
 * O argumento é o da escola inteira, e ele não é sobre a Maiyu: é sobre quem lê.
 * "Você não precisa sair daqui" responde à razão pela qual alguém do Alto
 * Solimões desistiria antes de perguntar o preço.
 *
 * A subchamada carrega data, dia, horário e vagas porque são as quatro coisas
 * que a pessoa precisa saber para decidir se continua rolando. Elas vêm da
 * turma anunciada, e não escritas à mão: a página já anunciou 40 vagas em março
 * enquanto a matrícula dizia que não havia turma, e não vai anunciar de novo.
 *
 * O bloco tem margem lateral e canto de 32px em vez de sangrar até a borda:
 * é o gesto do sistema, e é o que faz o creme da página aparecer em volta como
 * moldura.
 */
export function Hero(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const state = enrollmentStateFrom(data?.data)

  const summary = scheduleSummary(data?.data)

  // Os turnos saem das turmas, não da frase: enquanto era uma turma de manhã, a
  // frase estava certa por coincidência, e passou a mentir no dia em que a
  // escola abriu turma à tarde e à noite.
  let shifts = ''
  if (summary.shiftsLabel) shifts = ` de ${summary.shiftsLabel}`

  // Sem turma anunciada a frase perde a data em vez de inventar uma. O que
  // sobra continua verdadeiro.
  let schedule = `Aulas presenciais aos sábados${shifts}, em Benjamin Constant.`
  if (state.kind !== 'NONE') {
    schedule = `A próxima turma começa em ${formatDate(state.startsAt)}. Aulas presenciais aos sábados${shifts}, em Benjamin Constant.`
  }

  // "São cinco turmas de 40 vagas" quando todas têm a mesma capacidade; o total
  // quando não têm. Nenhum dos dois é escrito à mão.
  let times = ''
  if (summary.timesLabel) times = `, das ${summary.timesLabel}`

  let seats = ''
  if (summary.classCount > 0 && summary.seatsPerClass !== null) {
    seats = `São ${pluralize(summary.classCount, 'turma', 'turmas')} de ${summary.seatsPerClass} vagas${times}.`
  } else if (summary.classCount > 0) {
    seats = `São ${summary.totalSeats} vagas em ${summary.classCount} turmas.`
  }

  return (
    <section
      data-slot="home-hero"
      className="relative overflow-hidden bg-brand-ink"
    >
      {/*
        Sangria total, como a seção dos cursos: a faixa atravessa a largura
        inteira, sem raio e sem respiro lateral no invólucro. O recuo que sobra
        é o do conteúdo, e mora no `mx-auto max-w-7xl` de dentro. Antes cada
        bloco de marca era um cartão flutuando sobre o fundo do tema, e
        empilhados viravam uma pilha de cartões com listras claras entre eles.

        O bloco da marca: preto esverdeado, e **igual nos dois temas**.
        `bg-brand-ink` é literal, não token de tema, pelo mesmo motivo do preto
        do `not-found-page`. O hero é a assinatura da escola; ele não vira creme
        porque alguém está no tema claro. O tema decide o resto da página.
      */}
      <div className="relative px-4 pt-14 pb-0 sm:px-6 lg:px-8 lg:pt-20">
        <CircuitTrails className="text-neon/25" />
        <Petal className="-top-24 -right-20 size-96 text-neon/5" />

        <div className="relative mx-auto grid max-w-7xl gap-10">
          {/*
            O padrão de título da marca: primeira linha branca, segunda em neon.
            Duas linhas e não três, que é o teto do condensado itálico em caixa
            alta - a partir da terceira ele deixa de ser título e vira bloco.

            `<span>` com `block` e não `<br>`: a quebra aqui é estrutura do
            título, não uma quebra de conveniência, e um `<br>` some no
            `text-balance` de telas estreitas justamente onde ela mais importa.

            O texto no código fica em caixa mista e quem sobe para caixa alta é a
            `@utility brand-title`. Leitor de tela pronuncia "você" como palavra;
            "VOCÊ" escrito no JSX ele pode soletrar como sigla.
          */}
          <h1
            className={cn(
              REVEAL,
              'brand-title text-display-md text-balance sm:text-display-lg lg:text-display-xl',
            )}
          >
            <span className="block text-white">
              Você não precisa sair daqui
            </span>
            <span className="block text-neon">para aprender tecnologia</span>
          </h1>

          {/*
            O apoio numa segunda linha, e não numa coluna ao lado do título.
            Em coluna o `h1` ficava com ~600px e o condensado em caixa alta
            quebrava em quatro linhas; o teto do desenho é duas. Largura inteira
            resolve sem encolher a tipografia, que nas artes é o elemento
            grande.

            `max-w-[52ch]` no bloco: o título usa a largura toda, o parágrafo
            não pode. Linha de texto corrido acompanhando 1280px é ilegível.
          */}
          <div className={cn(REVEAL, 'delay-100 max-w-[52ch]')}>
            {/*
              De quem é a escola, antes do horário. O hero dizia o que ela
              oferece e quando; não dizia para quem.

              A frase terminava em "para a juventude daqui. Toda ela." - que
              tentava dizer inclusão sem nomear ninguém, e saía ambígua: "toda
              ela" lia tanto como a escola quanto como a juventude.

              Agora os povos são nomeados, e a diferença em relação ao que o
              comentário antigo evitava está na **forma**. "Indígenas e não
              indígenas" opõe dois blocos e deixa a divisão na cabeça de quem
              lê; uma lista aberta que termina em "de toda a comunidade
              amazônica" soma sem separar, e o travessão final é o que a mantém
              aberta em vez de exaustiva.

              Nomear importa aqui: numa região onde a maior parte da juventude é
              ribeirinha ou indígena, uma escola que só diz "para todos" deixa
              cada um decidir sozinho se o "todos" o inclui.

              Sem o superlativo no hero, e sem selo carregando-o. Ele é
              afirmado na seção da escola e na de missão, onde entra como frase
              inteira e com as qualificações que o tornam verificável.

              Um selo com a alegação dentro foi tentado aqui e saiu: rótulo
              flutuante anunciando o próprio pioneirismo é o gesto que denuncia
              página montada às pressas, e ele enfraquece justamente a
              afirmação que queria destacar. Quem é o primeiro escreve isso
              numa frase; quem precisa provar é que põe num selo.
            */}
            <p className="max-w-[46ch] text-body-md font-medium text-white sm:text-body-lg">
              Uma escola de tecnologia no Alto Solimões, para a juventude
              ribeirinha, indígena e cabocla, de toda a comunidade amazônica.
            </p>

            {/*
              Horário e vagas num parágrafo só, e não em dois empilhados.

              São a mesma resposta - "quando é, e ainda cabe alguém" -, e o hero
              é um momento, não uma ficha. Três blocos de texto sob o título
              faziam a primeira dobra virar lista, e empurravam o CTA para
              baixo da linha do celular, que é onde quase todo mundo abre a
              página.
            */}
            <p className="mt-3 max-w-[52ch] text-body-md text-white/80 sm:text-body-lg">
              {schedule}
              {seats && ` ${seats}`}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <EnrollmentCta tone="neon" scale="lg" />

              {/*
                Âncora e não `Link`: os cursos são a seção logo abaixo, e não uma
                rota. Trocar de tela para ver dois cards seria pior que rolar
                até eles.
              */}
              <PillButton
                tone="neon-outline"
                scale="lg"
                render={<a href="#cursos">Ver os cursos</a>}
              />
            </div>
          </div>
        </div>

        {/*
          A ilustração encosta na base do bloco e transborda um pouco, que é o
          que impede o retângulo verde de terminar num corte reto. `mt-12` e não
          margem negativa: negativa criaria rolagem horizontal em 360px.

          A partir de `lg` ela sobe. Com o título ocupando a largura inteira, o
          apoio e o CTA terminam na metade da altura do bloco, e sobrava uma
          faixa de preto chapado entre o último botão e a bancada. A margem
          negativa puxa o desenho para dentro dessa faixa; ele fica à direita do
          vazio que o parágrafo deixou, que é como as artes distribuem o peso.
        */}
        <img
          src="/ilustracoes/bancada-arduino.svg"
          alt="Uma bancada com placa Arduino, protoboard e um notebook com código"
          width={400}
          height={300}
          // A primeira coisa que se vê. Adiá-la deixaria o bloco verde vazio
          // enquanto o resto da página já terminou de montar.
          loading="eager"
          fetchPriority="high"
          className={cn(
            REVEAL,
            'delay-200 relative mx-auto mt-10 w-full max-w-md lg:-mt-20 lg:max-w-xl',
          )}
        />
      </div>
    </section>
  )
}
