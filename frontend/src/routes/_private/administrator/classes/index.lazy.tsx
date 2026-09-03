import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassesTable } from './-components/table'

export const Route = createLazyFileRoute('/_private/administrator/classes/')({
  component: ClassesTable,
})
