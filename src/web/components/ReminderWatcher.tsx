import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { api } from '../lib/api'

/**
 * Background poller that mirrors the TUI reminder bell: every 60s it checks for
 * due reminders and raises a toast plus a desktop notification (when the user
 * has granted permission) for each one it hasn't surfaced yet this session.
 */
export function ReminderWatcher() {
  const notified = useRef(new Set<number>())

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  const { data: due = [] } = useQuery({
    queryKey: ['reminders', 'due'],
    queryFn: () => api.listDueReminders(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    for (const reminder of due) {
      if (notified.current.has(reminder.id)) continue
      notified.current.add(reminder.id)
      toast(`Reminder: ${reminder.taskTitle}`)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('finish-em', { body: reminder.taskTitle })
        } catch {
          // Some browsers throw when constructing notifications without a SW.
        }
      }
    }
  }, [due])

  return null
}
