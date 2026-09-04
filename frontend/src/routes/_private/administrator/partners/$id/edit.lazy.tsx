import { createLazyFileRoute } from '@tanstack/react-router'
import { PartnerFormEdit } from '../-components/form-edit'

export const Route = createLazyFileRoute(
  '/_private/administrator/partners/$id/edit',
)({
  component: PartnerFormEdit,
})
