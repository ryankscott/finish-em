export type TuiFocusArea = "sidebar" | "tasks" | "assistant"

type ToggleAssistantVisibilityOptions = {
  showAssistant: boolean
  canDockAssistant: boolean
  focusArea: TuiFocusArea
}

export function toggleAssistantVisibility({
  showAssistant,
  canDockAssistant,
  focusArea,
}: ToggleAssistantVisibilityOptions): {
  showAssistant: boolean
  focusArea: TuiFocusArea
} {
  const nextShowAssistant = !showAssistant

  if (!nextShowAssistant && focusArea === "assistant") {
    return { showAssistant: false, focusArea: "tasks" }
  }

  if (nextShowAssistant && !canDockAssistant) {
    return { showAssistant: true, focusArea: "assistant" }
  }

  return { showAssistant: nextShowAssistant, focusArea }
}

type MainPaneWidthOptions = {
  terminalWidth: number
  showAssistant: boolean
  canDockAssistant: boolean
  assistantDockWidth?: number
}

export function getMainPaneTerminalWidth({
  terminalWidth,
  showAssistant,
  canDockAssistant,
  assistantDockWidth = 50,
}: MainPaneWidthOptions): number {
  if (showAssistant && canDockAssistant) {
    return Math.max(terminalWidth - assistantDockWidth, 40)
  }

  return terminalWidth
}
