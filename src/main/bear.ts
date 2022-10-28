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

const getNoteContents = async (id: string): Promise<BearNote | null> => {
  try {
    const res = await client.call('open-note', {
      id: id,
      show_window: 'no',
      open_note: 'no',
    });
    if (res) {
      return JSON.parse(res);
    }
    return null
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

export const createNote = (noteTitle: string, contents: string) => {
  const noteURL = new URL('/create', 'bear://x-callback-url/');
  noteURL.search = `text=yes&title=${encodeURI(noteTitle)}&text=${encodeURI(
    contents
  )}`;
  open(noteURL.toString());
};
