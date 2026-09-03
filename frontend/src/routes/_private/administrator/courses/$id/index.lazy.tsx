import { createLazyFileRoute } from '@tanstack/react-router'
import { CourseDetail } from '../-components/detail'

export const Route = createLazyFileRoute(
  '/_private/administrator/courses/$id/',
)({
  component: CourseDetail,
})
