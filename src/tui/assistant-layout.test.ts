import { describe, expect, it } from "vitest"

import {
  getMainPaneTerminalWidth,
  toggleAssistantVisibility,
  type TuiFocusArea,
} from "./assistant-layout"

describe("toggleAssistantVisibility", () => {
  it("collapses assistant and moves focus to tasks when assistant was focused", () => {
    const next = toggleAssistantVisibility({
      showAssistant: true,
      canDockAssistant: true,
      focusArea: "assistant",
    })

    expect(next).toEqual({
      showAssistant: false,
      focusArea: "tasks" satisfies TuiFocusArea,
    })
  })

  it("expands assistant and focuses assistant when in overlay mode", () => {
    const next = toggleAssistantVisibility({
      showAssistant: false,
      canDockAssistant: false,
      focusArea: "tasks",
    })

    expect(next).toEqual({
      showAssistant: true,
      focusArea: "assistant" satisfies TuiFocusArea,
    })
  })
})

describe("getMainPaneTerminalWidth", () => {
  it("shrinks main pane when docked assistant is visible", () => {
    expect(
      getMainPaneTerminalWidth({
        terminalWidth: 180,
        showAssistant: true,
        canDockAssistant: true,
      }),
    ).toBe(130)
  })

  it("returns full terminal width when assistant is collapsed", () => {
    expect(
      getMainPaneTerminalWidth({
        terminalWidth: 180,
        showAssistant: false,
        canDockAssistant: true,
      }),
    ).toBe(180)
  })

  it("returns full terminal width when assistant is overlay", () => {
    expect(
      getMainPaneTerminalWidth({
        terminalWidth: 120,
        showAssistant: true,
        canDockAssistant: false,
      }),
    ).toBe(120)
  })
})
