import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '../lib/cn'
import {
  useSettings,
  useSettingsMutations,
  useSyncMutations,
  useSyncStatus,
} from '../lib/queries'
import { ViewTitle } from './SimpleViews'

const fieldClass =
  'rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4">
      <div className="text-[11px] font-semibold tracking-wide text-muted uppercase">
        {title}
      </div>
      {children}
    </div>
  )
}

function relative(iso: string | null): string {
  if (!iso) return 'never'
  try {
    return format(parseISO(iso), 'MMM d, h:mm a')
  } catch {
    return iso
  }
}

export function SettingsView() {
  const { data: settings } = useSettings()
  const { updateSettings } = useSettingsMutations()
  const { data: sync } = useSyncStatus()
  const { enableSync, disableSync, syncNow } = useSyncMutations()

  const [timezone, setTimezone] = useState('')
  useEffect(() => {
    if (settings) setTimezone(settings.timezone)
  }, [settings])

  const saveTimezone = () => {
    const tz = timezone.trim()
    if (!tz) return
    updateSettings.mutate(
      { timezone: tz },
      {
        onSuccess: () => toast.success('Timezone saved'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const toggleSync = () => {
    const mutation = sync?.enabled ? disableSync : enableSync
    mutation.mutate(undefined, {
      onSuccess: (status) =>
        toast.success(status.enabled ? 'Sync enabled' : 'Sync disabled'),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <>
      <ViewTitle title="Settings" />
      <div className="max-w-xl px-4">
        <Section title="General">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Timezone
            <div className="flex items-center gap-2">
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Pacific/Auckland"
                className={cn(fieldClass, 'flex-1')}
              />
              <button
                type="button"
                onClick={saveTimezone}
                className="rounded-md border border-border px-3 py-2 text-foreground hover:bg-surface"
              >
                Save
              </button>
            </div>
          </label>
          {settings ? (
            <span className="text-xs text-muted">Updated {relative(settings.updatedAt)}</span>
          ) : null}
        </Section>

        <Section title="iCloud Sync">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSync}
              role="switch"
              aria-checked={sync?.enabled ?? false}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                sync?.enabled ? 'bg-accent' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform',
                  sync?.enabled ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
            <span className="text-sm">{sync?.enabled ? 'Enabled' : 'Disabled'}</span>
            {sync?.enabled ? (
              <button
                type="button"
                onClick={() =>
                  syncNow.mutate(undefined, {
                    onSuccess: (r) =>
                      toast.success(`Synced (↑${r.pushed} ↓${r.pulled})`),
                    onError: (err) => toast.error(err.message),
                  })
                }
                disabled={syncNow.isPending}
                className="ml-auto rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-surface disabled:opacity-50"
              >
                {syncNow.isPending ? 'Syncing…' : 'Sync now'}
              </button>
            ) : null}
          </div>
          {sync ? (
            <div className="flex flex-col gap-0.5 text-xs text-muted">
              <span>Device: {sync.deviceId ?? 'unknown'}</span>
              <span>Last sync: {relative(sync.lastSyncAt)}</span>
              <span>Pending changes: {sync.pendingChanges}</span>
            </div>
          ) : null}
        </Section>
      </div>
    </>
  )
}
