import { createFileRoute } from '@tanstack/react-router'
import {
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  isSameDay,
  format,
  parseISO,
} from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Repeat, Hash, Plus } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { QuickAddModal } from '@/components/quick-add/QuickAddModal'
import { PRIORITY_BADGE_CLASSES } from '@/components/tasks/Task'
import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select-v2'
import { api } from '@/lib/api-client'

import type { Goal, Project, Task } from '@/server/types'

export const Route = createFileRoute('/upcoming')({
  component: UpcomingRoute,
})

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function formatDayHeader(date: Date, today: Date) {
  const dayMonth = format(date, 'd MMM')
  if (isSameDay(date, today)) {
    return `${dayMonth} \u00b7 Today`
  }
  if (isSameDay(date, addDays(today, 1))) {
    return `${dayMonth} \u00b7 Tomorrow`
  }
  return `${dayMonth} \u00b7 ${format(date, 'EEEE')}`
}

function formatDueDate(dateString: string | null) {
  if (!dateString) return null
  return format(parseISO(dateString), 'd MMM yyyy')
}

type DayColumn = {
  key: string
  label: string
  date: Date | null // null for "overdue"
  tasks: Task[]
  isOverdue?: boolean
}

type ViewMode = 'day' | 'work-week' | 'week'

function UpcomingRoute() {
  const [viewMode, setViewMode] = useState<ViewMode>('work-week')
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()))
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalTitle, setGoalTitle] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = useMemo(() => startOfDay(new Date()), [])

  const daysToShow = useMemo(() => {
    if (viewMode === 'day') return 1
    if (viewMode === 'work-week') return 5
    return 7
  }, [viewMode])

  // For work-week, snap to Monday so columns always show Mon-Fri
  const columnStartDate = useMemo(() => {
    if (viewMode === 'work-week') return startOfWeek(anchorDate, { weekStartsOn: 1 })
    return anchorDate
  }, [viewMode, anchorDate])

  const weekStartKey = useMemo(() => dateKey(startOfWeek(anchorDate, { weekStartsOn: 1 })), [anchorDate])
  const anchorKey = useMemo(() => dateKey(anchorDate), [anchorDate])

  const goalPeriodType = viewMode === 'day' ? 'daily' as const : 'weekly' as const
  const goalPeriodStart = viewMode === 'day' ? anchorKey : weekStartKey

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rangeEnd = addDays(columnStartDate, daysToShow - 1)
      const [taskData, overdueData, projectData, goalData, allTaskData] = await Promise.all([
        api.listTasks({
          status: 'open',
          from: startOfDay(columnStartDate).toISOString(),
          to: endOfDay(rangeEnd).toISOString(),
        }),
        api.listTasks({
          status: 'open',
          to: startOfDay(columnStartDate).toISOString(),
        }),
        api.listProjects(),
        api.listGoals({ periodType: goalPeriodType, periodStart: goalPeriodStart }),
        api.listTasks({ status: 'open' }),
      ])
      // Filter overdueData to only include tasks with a due date before today
      const overdueFiltered = overdueData.filter(
        (t) => t.dueAt && parseISO(t.dueAt) < startOfDay(columnStartDate),
      )
      setTasks([...overdueFiltered, ...taskData])
      setProjects(projectData)
      setGoals(goalData)
      setAllTasks(allTaskData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [columnStartDate, daysToShow, goalPeriodType, goalPeriodStart])

  useEffect(() => {
    load()
  }, [load])

  const projectMap = useMemo(() => {
    const map: Record<number, Project> = {}
    for (const p of projects) {
      map[p.id] = p
    }
    return map
  }, [projects])

  const columns = useMemo<DayColumn[]>(() => {
    const overdueTasks = tasks.filter(
      (t) => t.dueAt && parseISO(t.dueAt) < startOfDay(columnStartDate),
    )

    const cols: DayColumn[] = []

    if (overdueTasks.length > 0) {
      cols.push({
        key: 'overdue',
        label: 'Overdue',
        date: null,
        tasks: overdueTasks,
        isOverdue: true,
      })
    }

    for (let i = 0; i < daysToShow; i++) {
      const day = addDays(columnStartDate, i)
      const key = dateKey(day)
      const dayTasks = tasks.filter((t) => {
        if (!t.dueAt) return false
        return dateKey(parseISO(t.dueAt)) === key
      })
      cols.push({
        key,
        label: formatDayHeader(day, today),
        date: day,
        tasks: dayTasks,
      })
    }
    return cols
  }, [tasks, columnStartDate, today, daysToShow])

  const goToToday = useCallback(() => {
    setAnchorDate(startOfDay(new Date()))
  }, [])

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      const step = viewMode === 'day' ? 1 : 7
      setAnchorDate(addDays(anchorDate, direction === 'next' ? step : -step))
    },
    [anchorDate, viewMode],
  )

  const addGoal = useCallback(async () => {
    const title = goalTitle.trim()
    if (!title) return
    setSavingGoal(true)
    setError(null)
    try {
      await api.createGoal({
        periodType: goalPeriodType,
        periodStart: goalPeriodStart,
        title,
      })
      setGoalTitle('')
      await load()
    } catch (goalError) {
      setError(goalError instanceof Error ? goalError.message : 'Failed to save goal')
    } finally {
      setSavingGoal(false)
    }
  }, [goalTitle, load, goalPeriodType, goalPeriodStart])

  const toggleGoal = useCallback(
    async (goal: Goal) => {
      setSavingGoal(true)
      setError(null)
      try {
        await api.updateGoal(goal.id, { done: !goal.done })
        await load()
      } catch (goalError) {
        setError(goalError instanceof Error ? goalError.message : 'Failed to update goal')
      } finally {
        setSavingGoal(false)
      }
    },
    [load],
  )

  const openQuickAdd = useCallback(() => {
    setQuickAddOpen(true)
  }, [])


  return (
    <AppLayout title="Upcoming" fullWidth onTaskCreated={load}>
      <div className="flex flex-col align-center justify-center  min-w-0  overflow-x-hidden">
        {/* Navigation bar */}
        <div className="mb-6 flex w-full min-w-0 flex-row justify-between">
            <SelectRoot value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="h-8 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="work-week">Work Week</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </SelectRoot>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {loading && <p className="text-sm text-zinc-500">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <section className="max-w-4xl rounded-xl border border-zinc-200 bg-white p-4 mb-6">
            <h3 className="text-base font-semibold text-zinc-900">
              {viewMode === 'day' ? 'Daily goals' : 'Weekly goals'}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <Input
                value={goalTitle}
                onChange={(event) => setGoalTitle(event.target.value)}
                placeholder={viewMode === 'day' ? 'Set a daily goal' : 'Set a weekly goal'}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addGoal()
                  }
                }}
              />
              <Button type="button" onClick={addGoal} disabled={savingGoal}>
                Add goal
              </Button>
            </div>

            <ul className="mt-3 space-y-2">
              {goals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={() => toggleGoal(goal)}
                    disabled={savingGoal}
                  />
                  <span className={goal.done ? 'text-zinc-500 line-through' : 'text-zinc-900'}>
                    {goal.title}
                  </span>
                </li>
              ))}
              {goals.length === 0 && (
                <li className="text-sm text-zinc-500">No goals yet.</li>
              )}
            </ul>
          </section>
        )}

        {!loading && !error && (
          <div className="min-w-0 overflow-x-auto rounded-xl border border-zinc-200 p-4">
            <div className="flex w-max gap-4">
              {columns.map((col) => (
                <div key={col.key} className="w-72 shrink-0">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${col.isOverdue ? 'text-zinc-900' : 'text-zinc-700'}`}
                    >
                      {col.label}
                    </h3>
                    <span className="text-sm text-zinc-400">{col.tasks.length}</span>
                  </div>
                </div>

                {/* Task cards */}
                <div className="space-y-2">
                  {col.tasks.map((task) => {
                    const project = projectMap[task.projectId]
                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-zinc-200 bg-white p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-2.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`mt-0.5 h-4.5 w-4.5 rounded-full border-2 shrink-0 ${PRIORITY_BADGE_CLASSES[task.priority]}`}
                            onClick={async () => {
                              await api.completeTask(task.id)
                              await load()
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 leading-snug">
                              {task.title}
                            </p>
                            {task.notes && (
                              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                {task.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {col.isOverdue && task.dueAt && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  {formatDueDate(task.dueAt)}
                                </span>
                              )}
                              {(task.recurrencePreset || task.recurrenceRRule) && (
                                <Repeat className="size-3 text-zinc-400" />
                              )}
                              {project && (
                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                  {project.isInbox ? (
                                    <>
                                      <svg
                                        className="size-3"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                      >
                                        <rect x="2" y="3" width="12" height="10" rx="1.5" />
                                        <path d="M2 10h4l1 2h2l1-2h4" />
                                      </svg>
                                      {project.name}
                                    </>
                                  ) : (
                                    <>
                                      <Hash className="size-3" />
                                      {project.name}
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add task button */}
                  {!col.isOverdue && col.key !== 'overdue' && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto flex items-center gap-1.5 mt-2 text-sm text-zinc-400 hover:text-red-500 transition-colors w-full py-1.5"
                      onClick={openQuickAdd}
                    >
                      <Plus className="size-4" />
                      Add task
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !error && (
          <section className="mt-6 max-w-4xl">
            <h3 className="text-base font-semibold text-zinc-900 mb-3">All Tasks</h3>
            <TaskList tasks={allTasks} onRefresh={load} />
          </section>
        )}
      </div>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={load}
      />
    </AppLayout>
  )
}
