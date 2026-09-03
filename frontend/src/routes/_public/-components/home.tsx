import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  storefrontCoursesQueryOptions,
  storefrontFaqsQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { CourseCards } from './course-cards'
import { Faq } from './faq'
import { FinalBanner } from './final-banner'
import { Hero } from './hero'
import { Mission } from './mission'
import { HowToEnroll } from './how-to-enroll'
import { Market } from './market'
import { School } from './school'
import { StatsBar } from './stats-bar'
import { Team } from './team'
import { WhatYouGet } from './what-you-get'
import { WhereAndWhen } from './where-and-when'
import { WhoItsFor } from './who-its-for'

/**
 * A home, montada.
 *
 * Só composição. A ordem aqui é a ordem na tela, e ela conta uma sequência: o
 * que é, quanto dura, por que presencial, o que se leva, quais são os cursos,
 * como se matricular, quem ensina, **por que a escola existe**, para quem é,
 * onde e quando, o que ficou em dúvida, e o convite.
 *
 * A missão vem depois da equipe e antes de "para quem é": ela responde para que
 * a escola existe, e é essa resposta que a pessoa usa para decidir se é para
 * ela. Antes da equipe seria promessa sem quem a sustente.
 *
 * `useQuery` e não `useSuspenseQuery`: a API fora do ar não pode derrubar a
 * página inteira. Onze das treze seções não dependem de consulta nenhuma - hero,
 * escola, o que você recebe, matrícula, equipe, para quem é, onde e quando e o
 * banner continuam de pé, e as duas que dependem somem em vez de levar o resto
 * junto.
 */
export function Home(): React.JSX.Element {
  const courses = useQuery(storefrontCoursesQueryOptions())
  const faqs = useQuery(storefrontFaqsQueryOptions())

  return (
    <>
      <Hero />
      <StatsBar />
      <School />
      <WhatYouGet />
      {/* Sem curso não há seção: um título "Dois cursos" sobre nada é pior que
          a ausência do bloco. */}
      {courses.data && courses.data.data.length > 0 && (
        <CourseCards courses={courses.data.data} />
      )}
      <Market />
      <HowToEnroll />
      <Team />
      <Mission />
      <WhoItsFor />
      <WhereAndWhen />
      <Faq faqs={faqs.data?.data ?? []} />
      <FinalBanner />
    </>
  )
}
