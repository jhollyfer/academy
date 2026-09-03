import { createLazyFileRoute } from '@tanstack/react-router'
import { InviteForm } from './-components/invite-form'

export const Route = createLazyFileRoute('/authentication/invite/$token/')({
  component: InviteForm,
})
