import { useEffect } from 'react'

type HotkeyHandler = (event: KeyboardEvent) => void

type HotkeyMap = Record<string, HotkeyHandler>

function keyFor(event: KeyboardEvent) {
  const parts: string[] = []

  if (event.metaKey || event.ctrlKey) {
    parts.push('mod')
  }
  if (event.shiftKey) {
    parts.push('shift')
  }

  parts.push(event.key.toLowerCase())

  return parts.join('+')
}

function shouldIgnore(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (!target) {
    return false
  }

  const tag = target.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  )
}

export function useHotkeys(map: HotkeyMap, options?: { allowInInput?: string[] }) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const current = keyFor(event)
      const allowInInput = options?.allowInInput ?? []

      if (shouldIgnore(event) && !allowInInput.includes(current)) {
        return
      }

      const handler = map[current]
      if (!handler) {
        return
      }

      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [map, options])
}
