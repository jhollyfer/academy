import { createLazyFileRoute } from '@tanstack/react-router'
import { PartnersTable } from './-components/table'

export const Route = createLazyFileRoute('/_private/administrator/partners/')({
  component: PartnersTable,
})
