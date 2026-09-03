import { createLazyFileRoute } from '@tanstack/react-router'
import { EnrollmentDetail } from '../-components/detail'

export const Route = createLazyFileRoute(
  '/_private/administrator/enrollments/$id/',
)({
  component: EnrollmentDetail,
})
