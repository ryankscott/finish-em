import { exec } from 'child_process';

const xcall = require('xcall');
const client = new xcall('bear');
const open = require('open');
const log = require('electron-log');
log.transports.console.level = 'info';

const BEAR_TODO_REGEX = /^- \[ \]\s+(.+)/;

type BearNote = {
  identifier: string;
  note: string;
};

const killXCall = () => {
  exec('killall xcall', (error, stdout, stderr) => {
    if (error) {
      return;
    }
  });
};

const getTodosFromString = (input: string): string[] => {
  if (!input) {
    log.info('No input string provided');
    return [];
  }
  const lines = input.split('\n');
  if (!lines.length) {
    log.error('No new lines found in note');
    return;
  }

  return lines.reduce((acc, currentValue) => {
    const match = currentValue.match(BEAR_TODO_REGEX);
    if (match) acc.push(match[1]);
    return acc;
  }, []);
};

const getNoteContents = async (id: string): Promise<BearNote> => {
  try {
    const res = await client.call('open-note', {
      id: id,
      show_window: 'no',
      open_note: 'no',
    });
    if (res) {
      return JSON.parse(res);
    }
  } catch (err) {
    console.error(
      `Failed to get note contents from note ${id} from bear - ${err}`
    );
    return null;
  }
};

const getNotesWithTodos = async (token: string) => {
  try {
    const res = await client.call('todo', { token: token, show_window: 'no' });
    if (res) {
      log.info(`Got response from bear notes`);
      const resp = JSON.parse(res);
      log.info(`Parsed response payload`);
      const notes: BearNote[] = JSON.parse(resp.notes);
      log.info(`Parsing ${notes.length} notes`);
      return notes.map((n) => {
        return n.identifier;
      });
    } else {
      return null;
    }
  } catch (err) {
    log.error(
      `Failed to get notes with todos from bear - ${JSON.stringify(err)}`
    );
    return null;
  }
};

// TODO: Do not use this - it never actually finishes
export const getAllTodos = async (token: string): Promise<any> => {
  killXCall();
  log.info(`Getting all notes from Bear with todos`);
  const noteIds = await getNotesWithTodos(token);
  if (!noteIds) return;
  log.info(`Found ${noteIds.length} notes with todos`);

  return Promise.all(
    noteIds.map(async (n) => {
      log.info(`Getting contents for note with id ${n}`);
      const noteContents = await getNoteContents(n);
      if (!noteContents) {
        log.error(`Didn't get note contents for note - ${n}`);
        return [n, []];
      }
      const todos = getTodosFromString(noteContents.note);
      log.info(`Found ${todos.length} todos for note id ${n}`);
      return [n, todos];
    })
  );
};

export const createNote = (noteTitle, contents) => {
  const noteURL = new URL('/create', 'bear://x-callback-url/');
  noteURL.search = `text=yes&title=${encodeURI(noteTitle)}&text=${encodeURI(
    contents
  )}`;
  open(noteURL.toString());
};
