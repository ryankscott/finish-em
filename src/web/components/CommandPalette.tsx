import { useNavigate } from '@tanstack/react-router'
import { Command } from 'cmdk'

import { useProjects } from '../lib/queries'
import { useUi } from '../state/ui'

export function CommandPalette() {
  const ui = useUi()
  const navigate = useNavigate()
  const { data: projects = [] } = useProjects()

  const go = (to: string) => {
    ui.setPaletteOpen(false)
    navigate({ to })
  }

  const run = (action: () => void) => {
    ui.setPaletteOpen(false)
    action()
  }

  const views: Array<[string, string]> = [
    ['Today', '/today'],
    ['Inbox', '/inbox'],
    ['Upcoming', '/upcoming'],
    ['Overdue', '/overdue'],
    ['Blocked', '/blocked'],
    ['By Priority', '/priority'],
    ['Completed', '/completed'],
    ['Deleted', '/deleted'],
    ['Reminders', '/reminders'],
    ['Settings', '/settings'],
  ]

  return (
    <Command.Dialog
      open={ui.paletteOpen}
      onOpenChange={ui.setPaletteOpen}
      label="Command palette"
      className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl"
    >
      <Command.Input
        placeholder="Jump to view or project…"
        className="w-full border-b border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted/60"
      />
      <Command.List className="max-h-72 overflow-y-auto p-2 [&_[cmdk-item]]:flex [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-2 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item][data-selected=true]]:bg-surface">
        <Command.Empty className="px-3 py-6 text-center text-muted">
          No results
        </Command.Empty>
        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
        >
          <Command.Item onSelect={() => run(() => ui.openQuickAdd())}>
            Add task
            <span className="ml-auto text-xs text-muted">a</span>
          </Command.Item>
          <Command.Item onSelect={() => run(() => ui.openProjectDialog({ mode: 'create' }))}>
            New project
            <span className="ml-auto text-xs text-muted">P</span>
          </Command.Item>
          <Command.Item onSelect={() => run(() => ui.setHelpOpen(true))}>
            Keyboard shortcuts
            <span className="ml-auto text-xs text-muted">?</span>
          </Command.Item>
        </Command.Group>
        <Command.Group
          heading="Views"
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
        >
          {views.map(([label, to]) => (
            <Command.Item key={to} onSelect={() => go(to)}>
              {label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Projects"
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
        >
          {projects
            .filter((p) => !p.isInbox)
            .map((project) => (
              <Command.Item
                key={project.id}
                onSelect={() => go(`/projects/${project.id}`)}
              >
                {project.emoji ? `${project.emoji} ` : ''}
                {project.name}
              </Command.Item>
            ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
