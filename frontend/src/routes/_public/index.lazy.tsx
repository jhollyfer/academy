import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { Home } from './-components/home'
import { WhatsappFloat } from './-components/whatsapp-float'

export const Route = createLazyFileRoute('/_public/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return (
    <>
      <Home />
      <WhatsappFloat message="Olá! Vi o site da Maiyu Academy e quero saber sobre as vagas." />
    </>
  )
}
