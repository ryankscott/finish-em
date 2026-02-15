import { useEffect, useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { endOfDay, startOfDay, startOfWeek } from '@/lib/datetime'

import type { Project, Task } from '@/server/types'

type PriorityFilter = 'all' | '1' | '2' | '3' | '4'
type DuePresetFilter =
  | 'all'
  | 'today'
  | 'tomorrow'
  | 'this_week'
  | 'overdue'
  | 'no_due_date'
type ProjectFilter = 'all' | `${number}`
type TaskQueryValue = string | number | boolean | undefined
type TaskQuery = Record<string, TaskQueryValue>

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function queryForDuePreset(preset: DuePresetFilter, now = new Date()) {
  switch (preset) {
    case 'today': {
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString(),
      }
    }
    case 'tomorrow': {
      const tomorrow = addDays(now, 1)
      return {
        from: startOfDay(tomorrow).toISOString(),
        to: endOfDay(tomorrow).toISOString(),
      }
    }
    case 'this_week': {
      const weekStart = startOfWeek(now)
      const weekEnd = addDays(weekStart, 6)
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(weekEnd).toISOString(),
      }
    }
    case 'overdue': {
      const yesterday = new Date(startOfDay(now).getTime() - 1)
      return {
        to: endOfDay(yesterday).toISOString(),
      }
    }
    case 'no_due_date': {
      return {
        noDueDate: true,
      }
    }
    case 'all':
    default:
      return {}
  }
}

export function TaskView(props: {
  title: string
  description?: string
  query?: Record<string, string | number | boolean | undefined>
  showProjectFilter?: boolean
  defaultFilters?: {
    priority?: PriorityFilter
    projectId?: 'all' | number
    duePreset?: DuePresetFilter
  }
}) {
  const showProjectFilter = props.showProjectFilter ?? true
  const defaultPriorityFilter: PriorityFilter = props.defaultFilters?.priority ?? 'all'
  const defaultDuePreset: DuePresetFilter = props.defaultFilters?.duePreset ?? 'all'
  const defaultProjectFilter: ProjectFilter =
    props.defaultFilters?.projectId === undefined || props.defaultFilters?.projectId === 'all'
      ? 'all'
      : (String(props.defaultFilters.projectId) as ProjectFilter)

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(defaultPriorityFilter)
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>(defaultProjectFilter)
  const [duePreset, setDuePreset] = useState<DuePresetFilter>(defaultDuePreset)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasActiveFilters =
    priorityFilter !== defaultPriorityFilter ||
    duePreset !== defaultDuePreset ||
    (showProjectFilter && projectFilter !== defaultProjectFilter)

  const mergedQuery = useMemo<TaskQuery>(() => {
    const query: TaskQuery = { ...(props.query ?? {}) }

    if (duePreset !== 'all') {
      delete query.from
      delete query.to
      delete query.noDueDate
      Object.assign(query, queryForDuePreset(duePreset))
    }

    if (priorityFilter === 'all') {
      delete query.priority
    } else {
      query.priority = priorityFilter
    }

    if (showProjectFilter) {
      if (projectFilter === 'all') {
        delete query.projectId
      } else {
        query.projectId = Number(projectFilter)
      }
    }

    return query
  }, [duePreset, priorityFilter, projectFilter, props.query, showProjectFilter])

  useEffect(() => {
    if (!showProjectFilter) {
      setProjects([])
      return
    }

    let active = true
    api
      .listProjects()
      .then((data) => {
        if (active) {
          setProjects(data)
        }
      })
      .catch(() => {
        if (active) {
          setProjects([])
        }
      })

    return () => {
      active = false
    }
  }, [showProjectFilter])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listTasks(mergedQuery)
      setTasks(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [JSON.stringify(mergedQuery)])

  return (
    <AppLayout title={props.title} description={props.description} onTaskCreated={load}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-40 flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Priority</span>
          <Select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
          >
            <option value="all">All priorities</option>
            <option value="1">P1</option>
            <option value="2">P2</option>
            <option value="3">P3</option>
            <option value="4">P4</option>
          </Select>
        </label>

        {showProjectFilter && (
          <label className="flex min-w-48 flex-col gap-1 text-sm">
            <span className="text-muted-foreground text-xs">Project</span>
            <Select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value as ProjectFilter)}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </Select>
          </label>
        )}

        <label className="flex min-w-44 flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs">Due date</span>
          <Select
            value={duePreset}
            onChange={(event) => setDuePreset(event.target.value as DuePresetFilter)}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This week</option>
            <option value="overdue">Overdue</option>
            <option value="no_due_date">No due date</option>
          </Select>
        </label>

        <Button
          type="button"
          variant="outline"
          disabled={!hasActiveFilters}
          onClick={() => {
            setPriorityFilter(defaultPriorityFilter)
            setProjectFilter(defaultProjectFilter)
            setDuePreset(defaultDuePreset)
          }}
        >
          Clear filters
        </Button>
      </div>

      {loading && <p className="text-sm text-zinc-600">Loading tasks...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <TaskList tasks={tasks} onRefresh={load} />}
    </AppLayout>
  )
}
