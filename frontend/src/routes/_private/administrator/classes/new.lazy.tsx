import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassFormCreate } from './-components/form-create'

export const Route = createLazyFileRoute('/_private/administrator/classes/new')(
  {
    component: ClassFormCreate,
  },
)
