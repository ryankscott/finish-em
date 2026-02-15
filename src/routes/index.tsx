import { createFileRoute } from '@tanstack/react-router'

import { TaskView } from '@/components/tasks/TaskView'

export const Route = createFileRoute('/')({
  component: TodayRoute,
})

function TodayRoute() {
  return (
    <TaskView
      title="Today"
      description="Tasks due today and active priorities"
      query={{ status: 'open' }}
      defaultFilters={{ duePreset: 'today' }}
    />
  )
}
