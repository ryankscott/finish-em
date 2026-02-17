import { format, isValid, parseISO } from 'date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { TaskView } from '@/components/tasks/TaskView'
import { api } from '@/lib/api-client'

import type { Project } from '@/server/types'

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectRoute,
})

function ProjectRoute() {
  const { projectId } = Route.useParams()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const id = Number(projectId)
    if (Number.isNaN(id)) {
      setProject(null)
      return
    }

    api
      .getProject(id)
      .then((data) => setProject(data))
      .catch(() => setProject(null))
  }, [projectId])

  const projectDateRange = useMemo(() => {
    if (!project?.startAt && !project?.endAt) {
      return ''
    }

    const formatDate = (value: string | null) => {
      if (!value) return ''
      const parsed = parseISO(value)
      if (!isValid(parsed)) {
        return value
      }
      return format(parsed, 'MMM d, yyyy')
    }

    const start = formatDate(project.startAt)
    const end = formatDate(project.endAt)

    if (start && end) {
      return `${start} → ${end}`
    }

    return start || end
  }, [project])

  const title = project
    ? `${project.emoji ? `${project.emoji} ` : ''}${project.name}`
    : `Project ${projectId}`

  const description = project
    ? [project.description, projectDateRange].filter(Boolean).join(' • ') || 'Project task list'
    : 'Project task list'

  return (
    <TaskView
      title={title}
      description={description}
      query={{ projectId, status: 'open' }}
      showProjectFilter={false}
    />
  )
}
