import { createFileRoute } from '@tanstack/react-router'

import { TaskView } from '@/components/tasks/TaskView'

export const Route = createFileRoute('/completed')({
  component: CompletedRoute,
})

function CompletedRoute() {
  return (
    <TaskView
      title="Completed"
      description="View your completed tasks"
      query={{ status: 'completed' }}
    />
  )
}
