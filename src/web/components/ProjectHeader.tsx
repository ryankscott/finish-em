import { format, parseISO } from 'date-fns'
import { ExternalLink, Pencil } from 'lucide-react'

import type { JiraTicketStatus, Project } from '@/server/types'

import { cn } from '../lib/cn'
import { useUi } from '../state/ui'

const STATUS_CLASS: Record<JiraTicketStatus, string> = {
  todo: 'text-p2 border-p2/40',
  in_progress: 'text-accent border-accent/40',
  done: 'text-p3 border-p3/40',
}

const STATUS_LABEL: Record<JiraTicketStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

function shortUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const tail = pathname.split('/').filter(Boolean).pop()
    return tail ? `${hostname.replace(/^www\./, '')}/${tail}` : hostname
  } catch {
    return url
  }
}

function LinkLine({
  label,
  url,
  status,
}: {
  label: string
  url: string
  status?: JiraTicketStatus | null
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 font-medium text-muted">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-1 text-accent hover:underline"
      >
        <span className="truncate">{shortUrl(url)}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
      {status ? (
        <span className={cn('rounded border px-1.5 text-[10px]', STATUS_CLASS[status])}>
          {STATUS_LABEL[status]}
        </span>
      ) : null}
    </div>
  )
}

export function ProjectHeader({ project, count }: { project: Project; count: number }) {
  const ui = useUi()
  const hasDiscovery = !!(project.jiraDiscoveryUrl || project.confluenceUrl)
  const hasDelivery = !!(
    project.jiraDeliveryUrl ||
    project.jiraDocsUrl ||
    project.jiraReleaseNoteUrl ||
    project.teamsReleaseNoteUrl
  )

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex items-baseline gap-2">
        <h1 className="text-base font-semibold">
          {project.emoji ? `${project.emoji} ` : ''}
          {project.name}
        </h1>
        <span className="text-xs text-muted">{count}</span>
        <button
          type="button"
          onClick={() => ui.openProjectDialog({ mode: 'edit', project })}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {project.description ? (
        <p className="mt-1 text-sm text-muted">{project.description}</p>
      ) : null}

      {project.startAt || project.endAt ? (
        <div className="mt-1 flex gap-4 text-xs text-muted">
          {project.startAt ? (
            <span>Start {format(parseISO(project.startAt), 'MMM d, yyyy')}</span>
          ) : null}
          {project.endAt ? (
            <span>End {format(parseISO(project.endAt), 'MMM d, yyyy')}</span>
          ) : null}
        </div>
      ) : null}

      {hasDiscovery ? (
        <div className="mt-3">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
            Discovery
          </div>
          <div className="flex flex-col gap-1">
            {project.jiraDiscoveryUrl ? (
              <LinkLine label="Jira" url={project.jiraDiscoveryUrl} status={project.jiraDiscoveryStatus} />
            ) : null}
            {project.confluenceUrl ? (
              <LinkLine label="PRD" url={project.confluenceUrl} />
            ) : null}
          </div>
        </div>
      ) : null}

      {hasDelivery ? (
        <div className="mt-3">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
            Delivery
          </div>
          <div className="flex flex-col gap-1">
            {project.jiraDeliveryUrl ? (
              <LinkLine label="Epic" url={project.jiraDeliveryUrl} status={project.jiraDeliveryStatus} />
            ) : null}
            {project.jiraDocsUrl ? (
              <LinkLine label="Docs" url={project.jiraDocsUrl} status={project.jiraDocsStatus} />
            ) : null}
            {project.jiraReleaseNoteUrl ? (
              <LinkLine label="Release" url={project.jiraReleaseNoteUrl} status={project.jiraReleaseNoteStatus} />
            ) : null}
            {project.teamsReleaseNoteUrl ? (
              <LinkLine label="Teams" url={project.teamsReleaseNoteUrl} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
