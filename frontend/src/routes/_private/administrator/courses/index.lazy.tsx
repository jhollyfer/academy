import { createLazyFileRoute } from '@tanstack/react-router'
import { CoursesTable } from './-components/table'

export const Route = createLazyFileRoute('/_private/administrator/courses/')({
  component: CoursesTable,
})
