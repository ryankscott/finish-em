import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { TaskView } from '@/components/tasks/TaskView'
import { api } from '@/lib/api-client'

export const Route = createFileRoute('/inbox')({
  component: InboxRoute,
})

function InboxRoute() {
  const [inboxId, setInboxId] = useState<number | null>(null)

  useEffect(() => {
    api
      .listProjects()
      .then((projects) => projects.find((project) => project.isInbox)?.id ?? null)
      .then(setInboxId)
      .catch(() => setInboxId(null))
  }, [])

  if (!inboxId) {
    return (
      <TaskView
        title="Inbox"
        description="Loading inbox project..."
        query={{ status: 'open' }}
      />
    )
  }

  return (
    <TaskView
      title="Inbox"
      description="Capture and triage tasks"
      query={{ status: 'open' }}
      defaultFilters={{ projectId: inboxId }}
    />
  )
}
