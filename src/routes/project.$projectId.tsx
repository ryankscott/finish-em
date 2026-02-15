import { createFileRoute } from '@tanstack/react-router'

import { TaskView } from '@/components/tasks/TaskView'

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectRoute,
})

function ProjectRoute() {
  const { projectId } = Route.useParams()

  return (
    <TaskView
      title={`Project ${projectId}`}
      description="Project task list"
      query={{ projectId, status: 'open' }}
      showProjectFilter={false}
    />
  )
}
