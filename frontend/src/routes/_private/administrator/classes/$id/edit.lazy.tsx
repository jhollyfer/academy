import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassFormEdit } from '../-components/form-edit'

export const Route = createLazyFileRoute(
  '/_private/administrator/classes/$id/edit',
)({
  component: ClassFormEdit,
})
