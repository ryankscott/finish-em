import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { RecurrencePreset } from '@/server/types'

import { formatDateField, resolveDateField } from '../lib/date-field'
import { useHotkeyScope } from '../lib/hotkeys'
import { useProjects, useTaskMutations } from '../lib/queries'
import { useUi } from '../state/ui'
import { TaskReminderField } from './TaskReminderField'

const RECURRENCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'every_weekday', label: 'Every weekday' },
]

const fieldClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      {children}
    </label>
  )
}

export function TaskEditDialog() {
  const ui = useUi()
  const { data: projects = [] } = useProjects()
  const { updateTask } = useTaskMutations()
  const task = ui.editingTask

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<number>(0)
  const [priority, setPriority] = useState<number>(4)
  const [due, setDue] = useState('')
  const [scheduled, setScheduled] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [blockedReason, setBlockedReason] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setProjectId(task.projectId)
    setPriority(task.priority)
    setDue(formatDateField(task.dueAt))
    setScheduled(formatDateField(task.scheduledAt))
    setRecurrence(task.recurrencePreset ?? '')
    setBlockedReason(task.blockedReason ?? '')
    setNotes(task.notes)
  }, [task])

  const submit = () => {
    if (!task) return
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    const dueAt = resolveDateField(due, task.dueAt)
    const scheduledAt = resolveDateField(scheduled, task.scheduledAt)
    if (dueAt === 'invalid' || scheduledAt === 'invalid') {
      toast.error('Dates accept: today, tomorrow, monday, next week, 2026-07-01')
      return
    }
    updateTask.mutate(
      {
        taskId: task.id,
        input: {
          title: title.trim(),
          projectId,
          priority: priority as 1 | 2 | 3 | 4,
          dueAt,
          scheduledAt,
          recurrencePreset: (recurrence || null) as RecurrencePreset,
          blockedReason: blockedReason.trim() ? blockedReason.trim() : null,
          notes,
        },
      },
      {
        onSuccess: () => {
          toast.success('Task saved')
          ui.closeTaskEditor()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  useHotkeyScope(
    {
      escape: () => ui.closeTaskEditor(),
      'mod+enter': () => submit(),
    },
    { enabled: task !== null, allowInInput: true },
  )

  return (
    <Dialog.Root open={task !== null} onOpenChange={(open) => !open && ui.closeTaskEditor()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-5 shadow-2xl"
          onEscapeKeyDown={() => ui.closeTaskEditor()}
        >
          <Dialog.Title className="mb-4 text-sm font-semibold">Edit task</Dialog.Title>
          <div className="flex flex-col gap-3">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(Number(e.target.value))}
                  className={fieldClass}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.emoji ? `${project.emoji} ` : ''}
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className={fieldClass}
                >
                  <option value={1}>P1 · Urgent</option>
                  <option value={2}>P2 · High</option>
                  <option value={3}>P3 · Normal</option>
                  <option value={4}>P4 · Low</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due (today, monday, 2026-07-01…)">
                <input value={due} onChange={(e) => setDue(e.target.value)} className={fieldClass} />
              </Field>
              <Field label="Scheduled">
                <input
                  value={scheduled}
                  onChange={(e) => setScheduled(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Recurrence">
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className={fieldClass}
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Blocked reason">
                <input
                  value={blockedReason}
                  onChange={(e) => setBlockedReason(e.target.value)}
                  className={fieldClass}
                  placeholder="Empty = not blocked"
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={fieldClass}
              />
            </Field>
            {task ? <TaskReminderField taskId={task.id} /> : null}
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted">
            <span>esc to cancel · ⌘⏎ to save</span>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-accent px-4 py-2 font-medium text-background"
            >
              Save task
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
