import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
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

import type { Task } from '@/server/types'

export const Route = createFileRoute('/upcoming')({
  component: UpcomingRoute,
})

type ViewMode = 'week' | 'day'
type WeekMode = 'work' | 'full'

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function startOfWeek(date = new Date()) {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = (day + 6) % 7
  next.setDate(next.getDate() - diff)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function labelForDay(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function UpcomingRoute() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [weekMode, setWeekMode] = useState<WeekMode>('work')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selectedDayKey, setSelectedDayKey] = useState(() => dateKey(new Date()))
  const [tasks, setTasks] = useState<Task[]>([])
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const weekStartKey = useMemo(() => dateKey(weekStart), [weekStart])

  const visibleDays = useMemo(() => {
    const count = weekMode === 'work' ? 5 : 7
    return Array.from({ length: count }, (_, index) => addDays(weekStart, index))
  }, [weekMode, weekStart])

  const visibleDayKeys = useMemo(() => visibleDays.map((day) => dateKey(day)), [visibleDays])

  useEffect(() => {
    if (!visibleDayKeys.includes(selectedDayKey)) {
      setSelectedDayKey(visibleDayKeys[0] ?? weekStartKey)
    }
  }, [selectedDayKey, visibleDayKeys, weekStartKey])

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (viewMode === 'day') {
        const currentDate = dateFromKey(selectedDayKey)
        const newDate = addDays(currentDate, direction === 'next' ? 1 : -1)
        setSelectedDayKey(dateKey(newDate))

        // Update week start if we've moved outside the current week
        if (!visibleDayKeys.includes(dateKey(newDate))) {
          setWeekStart(startOfWeek(newDate))
        }
      } else {
        // Week navigation
        const days = direction === 'next' ? 7 : -7
        setWeekStart(addDays(weekStart, days))
      }
    },
    [selectedDayKey, viewMode, visibleDayKeys, weekStart],
  )

  const handleViewChange = useCallback((value: string) => {
    if (value === 'day') {
      setViewMode('day')
    } else if (value === 'work-week') {
      setViewMode('week')
      setWeekMode('work')
    } else if (value === 'week') {
      setViewMode('week')
      setWeekMode('full')
    }
  }, [])

  const currentViewValue = useMemo(() => {
    if (viewMode === 'day') return 'day'
    return weekMode === 'work' ? 'work-week' : 'week'
  }, [viewMode, weekMode])

  const tasksByDay = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    for (const day of visibleDays) {
      grouped[dateKey(day)] = []
    }

    for (const task of tasks) {
      if (!task.dueAt) {
        continue
      }
      const key = dateKey(new Date(task.dueAt))
      if (grouped[key]) {
        grouped[key].push(task)
      }
    }

    return grouped
  }, [tasks, visibleDays])

  const selectedDayTasks = useMemo(() => {
    return tasksByDay[selectedDayKey] ?? []
  }, [selectedDayKey, tasksByDay])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const weekEnd = addDays(weekStart, weekMode === 'work' ? 4 : 6)
      const [taskData, unscheduledTaskData] = await Promise.all([
        api.listTasks({
          status: 'open',
          from: startOfDay(weekStart).toISOString(),
          to: endOfDay(weekEnd).toISOString(),
        }),
        api.listTasks({
          status: 'open',
          noDueDate: true,
        }),
      ])

      setTasks(taskData)
      setUnscheduledTasks(unscheduledTaskData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedDayKey, viewMode, weekMode, weekStart, weekStartKey])

  useEffect(() => {
    load()
  }, [load])



  const assignTaskToDay = useCallback(
    async (taskId: number, dayKey: string) => {
      setError(null)
      try {
        const date = dateFromKey(dayKey)
        await api.updateTask(taskId, { dueAt: date.toISOString() })
        await load()
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : 'Failed to assign task')
      }
    },
    [load],
  )

  return (
    <AppLayout
      title="Upcoming"
      description="Week and day views for this week"
      onTaskCreated={load}
    >
      <div className="flex flex-col w-full min-w-2xl   space-y-6">
        <div className="flex w-full flex-row  justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('prev')}>
            Previous
          </Button>

          <SelectRoot value={currentViewValue} onValueChange={handleViewChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="work-week">Work Week</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </SelectRoot>

          <Button type="button" variant="outline" onClick={() => navigate('next')}>
            Next
          </Button>
        </div>

        {loading && <p className="text-sm text-zinc-600">Loading upcoming items...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && viewMode === 'week' && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}
          >
            {visibleDays.map((day) => {
              const key = dateKey(day)
              const dayTasks = tasksByDay[key] ?? []

              return (
                <section key={key} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <button
                    type="button"
                    className="w-full text-left text-sm font-semibold text-zinc-900"
                    onClick={() => {
                      setSelectedDayKey(key)
                      setViewMode('day')
                    }}
                  >
                    {labelForDay(day)}
                  </button>
                  <p className="mt-1 text-xs text-zinc-500">{dayTasks.length} tasks</p>
                  <ul className="mt-3 space-y-2">
                    {dayTasks.map((task) => (
                      <li key={task.id} className="rounded border border-zinc-200 p-2 text-sm">
                        {task.title}
                      </li>
                    ))}
                    {dayTasks.length === 0 && (
                      <li className="text-xs text-zinc-500">No tasks due</li>
                    )}
                  </ul>
                </section>
              )
            })}
          </div>
        )}

        {!loading && !error && viewMode === 'day' && (
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold text-zinc-900">{selectedDayKey}</h3>
            <ul className="mt-3 space-y-2">
              {selectedDayTasks.map((task) => (
                <li key={task.id} className="rounded border border-zinc-200 p-2 text-sm">
                  {task.title}
                </li>
              ))}
              {selectedDayTasks.length === 0 && (
                <li className="text-sm text-zinc-500">No tasks due for this day.</li>
              )}
            </ul>
          </section>
        )}

        {!loading && !error && unscheduledTasks.length > 0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold text-zinc-900">
              Unscheduled Tasks ({unscheduledTasks.length})
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Assign these tasks to days in your week
            </p>
            <ul className="mt-3 space-y-2">
              {unscheduledTasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded border border-zinc-200 p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">{task.title}</p>
                    {task.scheduledAt && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Scheduled: {new Date(task.scheduledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {viewMode === 'week' && (
                    <div className="flex flex-wrap gap-1">
                      {visibleDays.map((day) => {
                        const key = dateKey(day)
                        const dayLabel = day.toLocaleDateString(undefined, {
                          weekday: 'short',
                        })
                        return (
                          <Button
                            key={key}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => assignTaskToDay(task.id, key)}
                          >
                            {dayLabel}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                  {viewMode === 'day' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => assignTaskToDay(task.id, selectedDayKey)}
                    >
                      Assign to {labelForDay(dateFromKey(selectedDayKey))}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}


      </div>
    </AppLayout>
  )
}
