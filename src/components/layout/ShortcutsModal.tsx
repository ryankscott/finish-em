export function ShortcutsModal(props: { open: boolean; onClose: () => void }) {
  if (!props.open) {
    return null
  }

  const shortcuts = [
    ['Cmd/Ctrl+K', 'Open quick add'],
    ['q', 'Open quick add'],
    ['j / k', 'Move selection in task list'],
    ['x', 'Toggle completion for selected task'],
    ['e', 'Edit selected task title'],
    ['/', 'Focus filter/search field'],
    ['Esc', 'Close dialogs'],
    ['?', 'Open this help'],
  ]

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-zinc-200 shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Keyboard shortcuts</h3>
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            onClick={props.onClose}
          >
            Esc
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {shortcuts.map(([keys, action]) => (
            <li key={keys} className="flex items-center justify-between gap-4">
              <kbd className="rounded bg-zinc-100 border border-zinc-200 px-2 py-1 text-xs">
                {keys}
              </kbd>
              <span className="text-zinc-700">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
