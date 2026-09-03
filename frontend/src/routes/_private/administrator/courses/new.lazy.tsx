import { createLazyFileRoute } from '@tanstack/react-router'
import { CourseFormCreate } from './-components/form-create'

export const Route = createLazyFileRoute('/_private/administrator/courses/new')(
  {
    component: CourseFormCreate,
  },
)
