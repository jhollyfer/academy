import type * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/admin/matriculas/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return <p>matriculas</p>
}
