import { createLazyFileRoute } from '@tanstack/react-router'
import { PhotoFormEdit } from '../-components/form-edit'

export const Route = createLazyFileRoute(
  '/_private/administrator/photos/$id/edit',
)({
  component: PhotoFormEdit,
})
