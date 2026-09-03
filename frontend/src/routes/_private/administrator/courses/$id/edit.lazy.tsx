import { createLazyFileRoute } from '@tanstack/react-router'
import { CourseFormEdit } from '../-components/form-edit'

export const Route = createLazyFileRoute(
  '/_private/administrator/courses/$id/edit',
)({
  component: CourseFormEdit,
})
