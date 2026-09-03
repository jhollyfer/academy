import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassDetail } from '../-components/detail'

export const Route = createLazyFileRoute(
  '/_private/administrator/classes/$id/',
)({
  component: ClassDetail,
})
