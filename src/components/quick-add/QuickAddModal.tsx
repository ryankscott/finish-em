import { format, parseISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

type ParsePreview = {
  title: string
  projectName: string | null
  priority: number | null
  dueAt: string | null
  scheduledAt: string | null
  recurrencePreset: string | null
  recurrenceRRule: string | null
  warnings: string[]
  source: string
  confidence: number
}

export function QuickAddModal(props: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const { open, onClose, onCreated } = props
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ParsePreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handle = window.setTimeout(async () => {
      if (text.trim().length < 2) {
        setPreview(null)
        return
      }

      try {
        const result = await api.parseQuickAdd(text)
        setPreview(result as ParsePreview)
      } catch {
        setPreview(null)
      }
    }, 250)

    return () => window.clearTimeout(handle)
  }, [text, open])

  const subtitle = useMemo(() => {
    if (!preview) {
      return 'Type naturally: "Pay rent p1 #Inbox tomorrow every month"'
    }

    return `${preview.source} parse (${Math.round(preview.confidence * 100)}%)`
  }, [preview])

  if (!open) {
    return null
  }

  const submit = async () => {
    if (text.trim().length === 0) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      await api.createQuickAdd(text)
      setText('')
      setPreview(null)
      onCreated()
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-28">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">Quick Add</h2>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-auto rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Esc
          </Button>
        </div>

        <div className="p-5 space-y-3">
          <input
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Task, priority, project, date, recurrence"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-red-400"
          />

          {preview && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 grid grid-cols-2 gap-2">
              <span>Title: {preview.title}</span>
              <span>Project: {preview.projectName ?? 'Inbox'}</span>
              <span>Priority: {preview.priority ?? 4}</span>
              <span>Due: {preview.dueAt ? format(parseISO(preview.dueAt), 'PPp') : 'none'}</span>
              <span>
                Scheduled:{' '}
                {preview.scheduledAt ? format(parseISO(preview.scheduledAt), 'PPp') : 'none'}
              </span>
              <span>
                Repeat: {preview.recurrencePreset ?? preview.recurrenceRRule ?? 'none'}
              </span>
              {preview.warnings.length > 0 && (
                <p className="col-span-2 text-amber-700">
                  Warnings: {preview.warnings.join(', ')}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-auto rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={submit}
              disabled={loading || text.trim().length === 0}
              className="h-auto rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
