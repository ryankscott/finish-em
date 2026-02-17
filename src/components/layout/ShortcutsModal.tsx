import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ShortcutsModal(props: { open: boolean; onClose: () => void }) {
  const shortcuts = [
    ['Cmd/Ctrl+K', 'Open quick add'],
    ['q', 'Open quick add'],
    ['j / k', 'Move selection in task list'],
    ['x', 'Toggle completion for selected task'],
    ['e', 'Edit selected task title'],
    ['/', 'Focus filter/search field'],
    ['Esc', 'Close dialogs'],
    ['?', 'Toggle this help'],
  ]

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map(([keys, action]) => (
            <div key={keys} className="flex items-center justify-between gap-6">
              <span className="text-sm text-zinc-700 flex-1">{action}</span>
              <kbd className="rounded bg-zinc-100 border border-zinc-200 px-2 py-1 text-xs font-mono whitespace-nowrap">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
