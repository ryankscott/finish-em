import { describe, expect, it } from 'bun:test'

import { shouldStartProjectEdit } from '@/tui/App'
import type { View } from '@/tui/hooks/useNavigation'

describe('shouldStartProjectEdit', () => {
  it('returns true for edit key in project view with active project and sidebar focused', () => {
    expect(shouldStartProjectEdit('e', 'project', 42, 'sidebar')).toBe(true)
  })

  it('returns false outside project view', () => {
    expect(shouldStartProjectEdit('e', 'today', 42, 'sidebar')).toBe(false)
  })

  it('returns false when no active project is selected', () => {
    expect(shouldStartProjectEdit('e', 'project', null, 'sidebar')).toBe(false)
  })

  it('returns false for non-edit keys', () => {
    expect(shouldStartProjectEdit('x', 'project', 42, 'sidebar')).toBe(false)
  })

  it('returns false when focus is not on sidebar', () => {
    expect(shouldStartProjectEdit('e', 'project', 42, 'tasks')).toBe(false)
  })
})

// Guard logic for `u` (undelete) keybinding: only active in deleted view
function shouldUndelete(input: string, view: View, hasSelectedTask: boolean): boolean {
  return input === 'u' && view === 'deleted' && hasSelectedTask
}

describe('u keybinding guard (undelete)', () => {
  it('returns true when pressing u in deleted view with selected task', () => {
    expect(shouldUndelete('u', 'deleted', true)).toBe(true)
  })

  it('returns false when pressing u outside deleted view', () => {
    const nonDeletedViews: View[] = ['today', 'inbox', 'upcoming', 'completed', 'project', 'settings']
    for (const view of nonDeletedViews) {
      expect(shouldUndelete('u', view, true)).toBe(false)
    }
  })

  it('returns false when pressing u in deleted view with no task selected', () => {
    expect(shouldUndelete('u', 'deleted', false)).toBe(false)
  })

  it('returns false for non-u keys in deleted view', () => {
    expect(shouldUndelete('d', 'deleted', true)).toBe(false)
    expect(shouldUndelete('x', 'deleted', true)).toBe(false)
  })
})
