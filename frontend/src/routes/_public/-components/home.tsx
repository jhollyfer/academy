import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  storefrontCoursesQueryOptions,
  storefrontFaqsQueryOptions,
  storefrontPartnersQueryOptions,
  storefrontPhotosQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { CourseCards } from './course-cards'
import { Faq } from './faq'
import { Gallery } from './gallery'
import { FinalBanner } from './final-banner'
import { Hero } from './hero'
import { Mission } from './mission'
import { Partners } from './partners'
import { HowToEnroll } from './how-to-enroll'
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
 * como se matricular, quem ensina, **quem responde pela escola**, por que ela
 * existe, para quem é, onde e quando, o que ficou em dúvida, e o convite.
 *
 * A missão vem depois da equipe e antes de "para quem é": ela responde para que
 * a escola existe, e é essa resposta que a pessoa usa para decidir se é para
 * ela. Antes da equipe seria promessa sem quem a sustente.
 *
 * `useQuery` e não `useSuspenseQuery`: a API fora do ar não pode derrubar a
 * página inteira. Dez das treze seções não dependem de consulta nenhuma - hero,
 * escola, o que você recebe, matrícula, equipe, missão, para quem é, onde e
 * quando e o banner continuam de pé, e as três que dependem somem em vez de
 * levar o resto junto.
 */
export function Home(): React.JSX.Element {
  const courses = useQuery(storefrontCoursesQueryOptions())
  const faqs = useQuery(storefrontFaqsQueryOptions())
  const partners = useQuery(storefrontPartnersQueryOptions())
  const photos = useQuery(storefrontPhotosQueryOptions())

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
      <HowToEnroll />
      {/* Depois de "como se matricular" e antes da equipe: quem acabou de ler o
          passo a passo quer ver o lugar onde vai entrar. Sem foto a seção some
          inteira - o acervo ainda não existe, e uma grade vazia sob um título é
          pior que a ausência do bloco. */}
      {photos.data && photos.data.data.length > 0 && (
        <Gallery photos={photos.data.data} />
      )}
      <Team />
      {/* Logo depois da equipe, e antes da missão: "quem ensina" acabou de ser
          respondido, e "quem responde pela escola" é a pergunta seguinte. Sem
          parceiro cadastrado a seção some inteira - um título sobre uma grade
          vazia é pior que a ausência do bloco, como nos cursos. */}
      {partners.data && partners.data.data.length > 0 && (
        <Partners partners={partners.data.data} />
      )}
      <Mission />
      <WhoItsFor />
      <WhereAndWhen />
      <Faq faqs={faqs.data?.data ?? []} />
      <FinalBanner />
    </>
  )
}
