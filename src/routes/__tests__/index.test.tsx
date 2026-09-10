import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__tests__/index/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__tests__/index/test"!</div>
}
