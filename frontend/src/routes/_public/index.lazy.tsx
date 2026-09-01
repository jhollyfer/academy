import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { Hero } from './-components/hero'
import { CourseCards } from './-components/course-cards'
import { EnrollmentWays } from './-components/enrollment-ways'
import { Team } from './-components/team'
import { Lab } from './-components/lab'
import { Pricing } from './-components/pricing'
import { Faq } from './-components/faq'
import { WhatsappFloat } from './-components/whatsapp-float'

export const Route = createLazyFileRoute('/_public/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  // `useSuspenseQuery` e não `useQuery`: o loader já garantiu o dado, então não
  // existe estado de carregamento a tratar aqui - e tratá-lo mesmo assim
  // renderizaria um esqueleto que ninguém chega a ver.
  const { data } = useSuspenseQuery(storefrontCoursesQueryOptions())

  const courses = data.data
  const [first] = courses

  return (
    <>
      <Hero />
      <CourseCards courses={courses} />
      <EnrollmentWays />
      <Team />
      <Lab />
      {/* O preço sai do primeiro curso: os dois custam o mesmo, e a seção fala
          da escola. Se um dia divergirem, ela vira uma comparação. */}
      {first && <Pricing course={first} />}
      {/* O FAQ da home é o do primeiro curso enquanto não houver um FAQ geral:
          `courseId` nulo no banco é justamente a pergunta que vale para a escola
          inteira, e a rota pública ainda não o expõe separado. */}
      {first?.faqs && <Faq faqs={first.faqs} />}
      <WhatsappFloat message="Olá! Vi o site da Maiyu Academy e quero saber sobre as vagas." />
    </>
  )
}
