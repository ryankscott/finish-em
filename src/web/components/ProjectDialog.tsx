import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { JiraTicketStatus } from '@/server/types'

import { formatDateField, resolveDateField } from '../lib/date-field'
import { useHotkeyScope } from '../lib/hotkeys'
import { useProjectMutations } from '../lib/queries'
import { useUi } from '../state/ui'

const fieldClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-accent'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '—' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      {children}
    </label>
  )
}

function StatusSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClass}
      aria-label="Status"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/** A link URL paired with an optional Jira ticket status. */
function LinkRow({
  label,
  url,
  setUrl,
  status,
  setStatus,
  withStatus = true,
}: {
  label: string
  url: string
  setUrl: (value: string) => void
  status?: string
  setStatus?: (value: string) => void
  withStatus?: boolean
}) {
  return (
    <div className={withStatus ? 'grid grid-cols-[1fr_8rem] gap-3' : ''}>
      <Field label={label}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={fieldClass} />
      </Field>
      {withStatus && setStatus ? (
        <Field label="Status">
          <StatusSelect value={status ?? ''} onChange={setStatus} />
        </Field>
      ) : null}
    </div>
  )
}

const asStatus = (value: string): JiraTicketStatus | null =>
  value ? (value as JiraTicketStatus) : null

export function ProjectDialog() {
  const ui = useUi()
  const { createProject, updateProject } = useProjectMutations()
  const state = ui.projectDialog
  const editing = state?.mode === 'edit' ? state.project : null

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [jiraDiscoveryUrl, setJiraDiscoveryUrl] = useState('')
  const [jiraDiscoveryStatus, setJiraDiscoveryStatus] = useState('')
  const [confluenceUrl, setConfluenceUrl] = useState('')
  const [jiraDeliveryUrl, setJiraDeliveryUrl] = useState('')
  const [jiraDeliveryStatus, setJiraDeliveryStatus] = useState('')
  const [jiraDocsUrl, setJiraDocsUrl] = useState('')
  const [jiraDocsStatus, setJiraDocsStatus] = useState('')
  const [jiraReleaseNoteUrl, setJiraReleaseNoteUrl] = useState('')
  const [jiraReleaseNoteStatus, setJiraReleaseNoteStatus] = useState('')
  const [teamsReleaseNoteUrl, setTeamsReleaseNoteUrl] = useState('')

  useEffect(() => {
    if (!state) return
    const p = state.mode === 'edit' ? state.project : null
    setName(p?.name ?? '')
    setEmoji(p?.emoji ?? '')
    setDescription(p?.description ?? '')
    setStart(formatDateField(p?.startAt ?? null))
    setEnd(formatDateField(p?.endAt ?? null))
    setJiraDiscoveryUrl(p?.jiraDiscoveryUrl ?? '')
    setJiraDiscoveryStatus(p?.jiraDiscoveryStatus ?? '')
    setConfluenceUrl(p?.confluenceUrl ?? '')
    setJiraDeliveryUrl(p?.jiraDeliveryUrl ?? '')
    setJiraDeliveryStatus(p?.jiraDeliveryStatus ?? '')
    setJiraDocsUrl(p?.jiraDocsUrl ?? '')
    setJiraDocsStatus(p?.jiraDocsStatus ?? '')
    setJiraReleaseNoteUrl(p?.jiraReleaseNoteUrl ?? '')
    setJiraReleaseNoteStatus(p?.jiraReleaseNoteStatus ?? '')
    setTeamsReleaseNoteUrl(p?.teamsReleaseNoteUrl ?? '')
  }, [state])

  const submit = () => {
    if (!state) return
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }
    const startAt = resolveDateField(start, editing?.startAt ?? null)
    const endAt = resolveDateField(end, editing?.endAt ?? null)
    if (startAt === 'invalid' || endAt === 'invalid') {
      toast.error('Dates accept: today, tomorrow, monday, next week, 2026-07-01')
      return
    }

    const input = {
      name: name.trim(),
      emoji: emoji.trim() ? emoji.trim() : null,
      description: description.trim(),
      startAt,
      endAt,
      jiraDiscoveryUrl: jiraDiscoveryUrl.trim() || null,
      jiraDiscoveryStatus: asStatus(jiraDiscoveryStatus),
      confluenceUrl: confluenceUrl.trim() || null,
      jiraDeliveryUrl: jiraDeliveryUrl.trim() || null,
      jiraDeliveryStatus: asStatus(jiraDeliveryStatus),
      jiraDocsUrl: jiraDocsUrl.trim() || null,
      jiraDocsStatus: asStatus(jiraDocsStatus),
      jiraReleaseNoteUrl: jiraReleaseNoteUrl.trim() || null,
      jiraReleaseNoteStatus: asStatus(jiraReleaseNoteStatus),
      teamsReleaseNoteUrl: teamsReleaseNoteUrl.trim() || null,
    }

    const onSuccess = () => {
      toast.success(editing ? 'Project saved' : 'Project created')
      ui.closeProjectDialog()
    }
    const onError = (err: Error) => toast.error(err.message)

    if (editing) {
      updateProject.mutate({ projectId: editing.id, input }, { onSuccess, onError })
    } else {
      createProject.mutate(input, { onSuccess, onError })
    }
  }

  useHotkeyScope(
    {
      escape: () => ui.closeProjectDialog(),
      'mod+enter': () => submit(),
    },
    { enabled: state !== null, allowInInput: true },
  )

  return (
    <Dialog.Root
      open={state !== null}
      onOpenChange={(open) => !open && ui.closeProjectDialog()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface-raised p-5 shadow-2xl"
          onEscapeKeyDown={() => ui.closeProjectDialog()}
        >
          <Dialog.Title className="mb-4 text-sm font-semibold">
            {editing ? 'Edit project' : 'New project'}
          </Dialog.Title>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[1fr_5rem] gap-3">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  autoFocus
                />
              </Field>
              <Field label="Emoji">
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={fieldClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start (today, monday, 2026-07-01…)">
                <input value={start} onChange={(e) => setStart(e.target.value)} className={fieldClass} />
              </Field>
              <Field label="End">
                <input value={end} onChange={(e) => setEnd(e.target.value)} className={fieldClass} />
              </Field>
            </div>

            <div className="mt-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Discovery
            </div>
            <LinkRow
              label="Jira Discovery URL"
              url={jiraDiscoveryUrl}
              setUrl={setJiraDiscoveryUrl}
              status={jiraDiscoveryStatus}
              setStatus={setJiraDiscoveryStatus}
            />
            <LinkRow
              label="Confluence PRD URL"
              url={confluenceUrl}
              setUrl={setConfluenceUrl}
              withStatus={false}
            />

            <div className="mt-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Delivery
            </div>
            <LinkRow
              label="Jira Delivery Epic URL"
              url={jiraDeliveryUrl}
              setUrl={setJiraDeliveryUrl}
              status={jiraDeliveryStatus}
              setStatus={setJiraDeliveryStatus}
            />
            <LinkRow
              label="Jira Docs URL"
              url={jiraDocsUrl}
              setUrl={setJiraDocsUrl}
              status={jiraDocsStatus}
              setStatus={setJiraDocsStatus}
            />
            <LinkRow
              label="Jira Release Note URL"
              url={jiraReleaseNoteUrl}
              setUrl={setJiraReleaseNoteUrl}
              status={jiraReleaseNoteStatus}
              setStatus={setJiraReleaseNoteStatus}
            />
            <LinkRow
              label="Teams Release Note URL"
              url={teamsReleaseNoteUrl}
              setUrl={setTeamsReleaseNoteUrl}
              withStatus={false}
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted">
            <span>esc to cancel · ⌘⏎ to save</span>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-accent px-4 py-2 font-medium text-background"
            >
              {editing ? 'Save project' : 'Create project'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
