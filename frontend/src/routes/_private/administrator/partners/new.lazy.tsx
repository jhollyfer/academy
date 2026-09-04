import { createLazyFileRoute } from '@tanstack/react-router'
import { PartnerFormCreate } from './-components/form-create'

export const Route = createLazyFileRoute(
  '/_private/administrator/partners/new',
)({
  component: PartnerFormCreate,
})
