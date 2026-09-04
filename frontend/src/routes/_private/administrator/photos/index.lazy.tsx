import { createLazyFileRoute } from '@tanstack/react-router'
import { PhotosTable } from './-components/table'

export const Route = createLazyFileRoute('/_private/administrator/photos/')({
  component: PhotosTable,
})
