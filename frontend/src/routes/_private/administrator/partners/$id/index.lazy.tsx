import { createLazyFileRoute } from '@tanstack/react-router'
import { PartnerDetail } from '../-components/detail'

export const Route = createLazyFileRoute(
  '/_private/administrator/partners/$id/',
)({
  component: PartnerDetail,
})
