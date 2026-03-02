import { describe, expect, it } from 'bun:test'

import { shouldStartProjectEdit } from '@/tui/App'

describe('shouldStartProjectEdit', () => {
  it('returns true for edit key in project view with active project', () => {
    expect(shouldStartProjectEdit('e', 'project', 42)).toBe(true)
  })

  it('returns false outside project view', () => {
    expect(shouldStartProjectEdit('e', 'today', 42)).toBe(false)
  })

  it('returns false when no active project is selected', () => {
    expect(shouldStartProjectEdit('e', 'project', null)).toBe(false)
  })

  it('returns false for non-edit keys', () => {
    expect(shouldStartProjectEdit('x', 'project', 42)).toBe(false)
  })
})
