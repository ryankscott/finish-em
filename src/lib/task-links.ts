/**
 * Parsing and display helpers for inline links in task title and notes.
 * Convention: Markdown-style [link text](url); bare URLs displayed with domain as label.
 */

/** A segment of parsed content: either plain text or a link with url and optional label */
export type TaskLinkSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; url: string; label: string | null }

/** Display segment for TUI: text to show and, for links, the URL to open */
export type TaskLinkDisplaySegment =
  | { type: 'text'; text: string }
  | { type: 'link'; displayLabel: string; url: string }

const LABELED_LINK_RE = /\[([^\]]*)\]\(([^)\s]+)\s*\)/g
const BARE_URL_RE = /https?:\/\/[^\s)]+/g

/**
 * Parses a string into segments (plain text vs link with url and optional label).
 * Supports Markdown [link text](url) and bare URL detection. Matches are non-overlapping;
 * labeled links are matched first, then bare URLs in remaining text.
 */
export function parseTaskLinkSegments(input: string): TaskLinkSegment[] {
  if (!input) return []

  const segments: TaskLinkSegment[] = []
  let lastEnd = 0

  // Match [link text](url) first
  LABELED_LINK_RE.lastIndex = 0
  let match: RegExpExecArray | null
  const labeledRanges: { start: number; end: number; label: string; url: string }[] = []
  while ((match = LABELED_LINK_RE.exec(input)) !== null) {
    labeledRanges.push({
      start: match.index,
      end: match.index + match[0].length,
      label: match[1].trim() || null,
      url: match[2].trim(),
    })
  }

  // Build segments: text and labeled links in order
  let pos = 0
  for (const link of labeledRanges) {
    if (link.start > pos) {
      const text = input.slice(pos, link.start)
      segments.push(...parseBareUrls(text))
    }
    segments.push({
      type: 'link',
      url: link.url,
      label: link.label && link.label.length > 0 ? link.label : null,
    })
    pos = link.end
  }
  if (pos < input.length) {
    segments.push(...parseBareUrls(input.slice(pos)))
  }

  return segments
}

function parseBareUrls(text: string): TaskLinkSegment[] {
  const segments: TaskLinkSegment[] = []
  BARE_URL_RE.lastIndex = 0
  let match: RegExpExecArray | null
  let lastEnd = 0
  while ((match = BARE_URL_RE.exec(text)) !== null) {
    if (match.index > lastEnd) {
      segments.push({ type: 'text', text: text.slice(lastEnd, match.index) })
    }
    segments.push({ type: 'link', url: match[0].trim(), label: null })
    lastEnd = match.index + match[0].length
  }
  if (lastEnd < text.length) {
    segments.push({ type: 'text', text: text.slice(lastEnd) })
  }
  if (segments.length === 0 && text.length > 0) {
    segments.push({ type: 'text', text })
  }
  return segments
}

const FALLBACK_LABEL = 'link'

/**
 * Ensures the URL has an http(s) scheme. Used at storage time so
 * downstream consumers (open-url, display) always get a valid URL.
 */
export function ensureScheme(url: string): string {
  const u = url.trim()
  if (!u) return u
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

/**
 * Derives the display label for a link: custom label if present,
 * else last meaningful path segment (decoded), else hostname, else fallback.
 */
export function getLinkDisplayLabel(url: string, customLabel: string | null): string {
  if (customLabel != null && customLabel.trim() !== '') {
    return customLabel.trim()
  }
  try {
    const parsed = new URL(ensureScheme(url))
    const pathSegments = parsed.pathname.split('/').filter(Boolean)
    const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null
    if (lastSegment && lastSegment !== '/' && parsed.pathname !== '/') {
      return decodeURIComponent(lastSegment)
    }
    return parsed.hostname || FALLBACK_LABEL
  } catch {
    return FALLBACK_LABEL
  }
}

/**
 * Given title or notes string, returns segments suitable for TUI rendering:
 * text segments and link segments with displayLabel (and url for opening).
 */
export function toDisplaySegments(input: string): TaskLinkDisplaySegment[] {
  const parsed = parseTaskLinkSegments(input)
  return parsed.map((seg): TaskLinkDisplaySegment => {
    if (seg.type === 'text') {
      return { type: 'text', text: seg.text }
    }
    return {
      type: 'link',
      displayLabel: getLinkDisplayLabel(seg.url, seg.label),
      url: seg.url,
    }
  })
}

/**
 * Returns the plain display string for a title or notes (links shown as [label]).
 * Use this when rendering to a single string; for interactive open-link you need toDisplaySegments.
 */
export function toDisplayString(input: string): string {
  const segments = toDisplaySegments(input)
  return segments
    .map((s) => (s.type === 'text' ? s.text : `[${s.displayLabel}]`))
    .join('')
}

/**
 * Replaces bare URLs in text with [label](url) so stored form is consistent and labels are editable.
 * Ensures all URLs have an http(s) scheme.
 * Already-labeled links [text](url) are preserved but still get scheme-normalized.
 */
export function normalizeBareUrlsInText(input: string): string {
  if (!input) return input
  const segments = parseTaskLinkSegments(input)
  return segments
    .map((seg): string => {
      if (seg.type === 'text') return seg.text
      const url = ensureScheme(seg.url)
      const label =
        seg.label != null && seg.label.trim() !== ''
          ? seg.label.trim()
          : getLinkDisplayLabel(url, null)
      return `[${label}](${url})`
    })
    .join('')
}
