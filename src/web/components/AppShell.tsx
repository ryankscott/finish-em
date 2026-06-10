import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useRef } from 'react'
import { Toaster } from 'sonner'

import { useHotkeyScope } from '../lib/hotkeys'
import { useUi } from '../state/ui'
import { CommandPalette } from './CommandPalette'
import { HelpDialog } from './HelpDialog'
import { ProjectDialog } from './ProjectDialog'
import { QuickAdd } from './QuickAdd'
import { ReminderWatcher } from './ReminderWatcher'
import { Sidebar } from './Sidebar'
import { TaskEditDialog } from './TaskEditDialog'

const VIEW_KEYS = [
  '/today',
  '/inbox',
  '/upcoming',
  '/overdue',
  '/blocked',
  '/priority',
  '/completed',
  '/deleted',
]

export function AppShell() {
  const ui = useUi()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchRef = useRef<HTMLInputElement>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useHotkeyScope({
    a: () => ui.openQuickAdd(),
    'shift+a': () => ui.openQuickAdd(),
    'shift+p': () => ui.openProjectDialog({ mode: 'create' }),
    '/': () => searchRef.current?.focus(),
    '?': () => ui.setHelpOpen(!ui.helpOpen),
    'mod+k': () => ui.setPaletteOpen(!ui.paletteOpen),
    '\\': () => ui.toggleSidebar(),
    r: () => queryClient.invalidateQueries(),
    ...Object.fromEntries(
      VIEW_KEYS.map((to, index) => [
        String(index + 1),
        () => navigate({ to }),
      ]),
    ),
  })

  // mod+k must also work while typing in inputs
  useHotkeyScope(
    {
      'mod+k': () => ui.setPaletteOpen(!ui.paletteOpen),
    },
    { allowInInput: true },
  )

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            ref={searchRef}
            value={ui.search}
            placeholder="Search tasks ( / )"
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted/60"
            onChange={(e) => {
              ui.setSearch(e.target.value)
              if (pathname !== '/search') navigate({ to: '/search' })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                ui.setSearch('')
                e.currentTarget.blur()
                navigate({ to: '/today' })
              }
            }}
          />
          <span className="ml-auto text-xs text-muted">? for shortcuts</span>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <QuickAdd />
      <TaskEditDialog />
      <ProjectDialog />
      <HelpDialog />
      <CommandPalette />
      <ReminderWatcher />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  )
}
