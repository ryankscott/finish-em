import { createContext, useContext, useMemo, useState } from 'react'

type AssistantUiContextValue = {
  desktopVisible: boolean
  setDesktopVisible: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
}

const AssistantUiContext = createContext<AssistantUiContextValue | null>(null)

export function AssistantUiProvider(props: { children: React.ReactNode }) {
  const [desktopVisible, setDesktopVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo(
    () => ({
      desktopVisible,
      setDesktopVisible,
      mobileOpen,
      setMobileOpen,
    }),
    [desktopVisible, mobileOpen],
  )

  return (
    <AssistantUiContext.Provider value={value}>
      {props.children}
    </AssistantUiContext.Provider>
  )
}

export function useAssistantUi() {
  const value = useContext(AssistantUiContext)
  if (!value) {
    throw new Error('useAssistantUi must be used inside AssistantUiProvider')
  }
  return value
}
