import { createLazyFileRoute } from '@tanstack/react-router'
import { PhotoFormCreate } from './-components/form-create'

export const Route = createLazyFileRoute('/_private/administrator/photos/new')({
  component: PhotoFormCreate,
})
