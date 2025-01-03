import { StoreSchema } from '../../main/settings'
import { useEffect, useState } from 'react'

export function useSettings() {
  const [settings, setSettings] = useState<StoreSchema>()

  useEffect(() => {
    const getSettings = async () => {
      const s = await window.api.getSettings()
      setSettings(s)
    }
    getSettings()
  }, [])
  return settings
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return isOnline
}
