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
  const res = await client.call('open-note', { id: id, show_window: false })
  if (res) {
    console.log(JSON.parse(res))
    return JSON.parse(res)
  }
}

const getNotesWithTodos = async () => {
  const res = await client.call('todo', { token: TOKEN_ID, show_window: false })
  if (res) {
    const resp = JSON.parse(res)
    const notes: BearNote[] = JSON.parse(resp.notes)
    return notes.map((n) => {
      return n.identifier
    })
  } else {
    console.log(res)
    return null
  }
}

export const getAllTodos = async (): Promise<any> => {
  const noteIds = await getNotesWithTodos()
  return Promise.all(
    noteIds.map(async (n) => {
      const noteContents = await getNoteContents(n)
      const todos = getTodosFromString(noteContents.note)
      return [n, todos]
    }),
  )
}

export const createNote = (noteTitle, contents) => {
  console.log(contents)
  const noteURL = new URL('/create', 'bear://x-callback-url/')
  noteURL.search = `text=yes&title=${encodeURI(noteTitle)}&text=${encodeURI(contents)}`
  open(noteURL.toString())
}
