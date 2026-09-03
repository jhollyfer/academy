import { createLazyFileRoute } from '@tanstack/react-router'
import { EnrollmentsTable } from './-components/table'

export const Route = createLazyFileRoute(
  '/_private/administrator/enrollments/',
)({
  component: EnrollmentsTable,
})
