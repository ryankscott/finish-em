import * as Dialog from '@radix-ui/react-dialog'

import { useUi } from '../state/ui'

const SECTIONS: Array<[string, Array<[string, string]>]> = [
  [
    'Navigation',
    [
      ['j / ↓', 'Move down'],
      ['k / ↑', 'Move up'],
      ['g / G', 'First / last task'],
      ['space', 'Expand or collapse subtasks'],
      ['\\', 'Toggle sidebar'],
      ['/', 'Search tasks'],
      ['⌘K', 'Command palette'],
      ['1–8', 'Switch view (Today, Inbox, Upcoming…)'],
    ],
  ],
  [
    'Tasks',
    [
      ['x', 'Complete or reopen task'],
      ['a', 'Quick add task'],
      ['s', 'Add subtask to selected task'],
      ['e / enter', 'Edit task (incl. reminder)'],
      ['d', 'Delete task'],
      ['u', 'Restore task (Deleted view)'],
      ['o', 'Open link in task'],
    ],
  ],
  [
    'Projects',
    [
      ['P', 'New project'],
      ['', 'Edit / delete via sidebar hover'],
    ],
  ],
  [
    'Upcoming',
    [
      ['h / l', 'Previous / next column'],
      ['[ / ]', 'Previous / next week'],
      ['t', 'Jump to today'],
      ['v', 'Cycle day / work week / week'],
      ['g', 'Add goal'],
    ],
  ],
  [
    'General',
    [
      ['r', 'Refresh data'],
      ['?', 'Toggle this help'],
      ['esc', 'Close dialogs'],
      ['⌘⏎', 'Save in edit dialog'],
    ],
  ],
]

export function HelpDialog() {
  const ui = useUi()
  return (
    <Dialog.Root open={ui.helpOpen} onOpenChange={ui.setHelpOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 shadow-2xl">
          <Dialog.Title className="mb-4 text-sm font-semibold">
            Keyboard shortcuts
          </Dialog.Title>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {SECTIONS.map(([section, rows]) => (
              <div key={section}>
                <div className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {section}
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map(([keys, action]) => (
                      <tr key={keys}>
                        <td className="w-36 py-0.5 pr-3 font-mono text-xs text-accent">
                          {keys}
                        </td>
                        <td className="py-0.5 text-muted">{action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
