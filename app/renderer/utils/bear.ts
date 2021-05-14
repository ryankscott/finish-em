const xcall = require('xcall')
const client = new xcall('bear')
const open = require('open')

const TOKEN_ID = '2D890E-E92087-1AAFC5'
const BEAR_TODO_REGEX = /^- \[ \]\s+(\w*)/

type BearNote = {
  identifier: string
  note: string
}

const getTodosFromString = (input: string): string[] => {
  const lines = input.split('\n')
  if (!lines.length) return

  return lines.reduce((acc, currentValue) => {
    const match = currentValue.match(BEAR_TODO_REGEX)
    if (match) acc.push(match[1])
    return acc
  }, [])
}

const getNoteContents = async (id: string): Promise<BearNote> => {
  try {
    const res = await client.call('open-note', { id: id, show_window: 'no', open_note: 'no' })
    if (res) {
      return JSON.parse(res)
    }
  } catch (err) {
    console.error(`Failed to get note contents from note ${id} from bear - ${err}`)
    return null
  }
}

const getNotesWithTodos = async () => {
  try {
    const res = await client.call('todo', { token: TOKEN_ID, show_window: 'no' })
    if (res) {
      const resp = JSON.parse(res)
      const notes: BearNote[] = JSON.parse(resp.notes)
      return notes.map((n) => {
        return n.identifier
      })
    }
  } catch (err) {
    console.error(`Failed to get notes with todos from bear - ${err}`)
    return null
  }
}

export const getAllTodos = async (): Promise<any> => {
  const noteIds = await getNotesWithTodos()
  if (!noteIds) return
  return Promise.all(
    noteIds.map(async (n) => {
      const noteContents = await getNoteContents(n)
      if (!noteContents) return
      const todos = getTodosFromString(noteContents.note)
      return [n, todos]
    }),
  )
}

export const createNote = (noteTitle, contents) => {
  const noteURL = new URL('/create', 'bear://x-callback-url/')
  noteURL.search = `text=yes&title=${encodeURI(noteTitle)}&text=${encodeURI(contents)}`
  open(noteURL.toString())
}
