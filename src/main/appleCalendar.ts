import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import { app } from 'electron';
import log from 'electron-log';
import os from 'os';
import * as semver from 'semver';
import { getErrorMessage } from '../renderer/utils';

const isLegacy = semver.lte(os.release(), '22.0.0');

type CalendarQueryType =
  | 'GET_CALENDARS'
  | 'GET_EVENTS'
  | 'GET_RECURRING_EVENTS';

type CalendarQueries = Record<CalendarQueryType, string>;
const legacyCalendarQueries: CalendarQueries = {
  GET_CALENDARS: `SELECT Z_PK as id, ZTITLE as title FROM ZNODE WHERE ZTITLE IS NOT NULL;`,
  GET_EVENTS: `SELECT
    zci.Z_PK as id,
    zci.ZTITLE as title,
    zci.ZMYATTENDEESTATUS as status,
    zci.ZNOTES as summary,
    zci.ZISALLDAY as allDayEvent,
    ZRECURRENCERULE as recurring,
    zl.ZTITLE as location,
    zci.ZTIMEZONE as timezone,
    datetime(zci.ZSTARTDATE,'unixepoch','31 years') as startDate,
    datetime(zci.ZENDDATE,'unixepoch','31 years') as endDate,
    datetime(zci.ZCREATIONDATE,'unixepoch','31 years') as creationDate,
    group_concat(za.ZCOMMONNAME) as attendees
    FROM ZCALENDARITEM zci
    LEFT JOIN ZLOCATION zl on zl.Z_PK = zci.ZSTRUCTUREDLOCATION
    LEFT JOIN ZATTENDEE za on za.ZEVENT = zci.Z_PK
    WHERE zci.ZCALENDAR = ?
    AND datetime(zci.ZSTARTDATE,'unixepoch','31 years') > datetime('now', '-7 day')
    AND datetime(zci.ZSTARTDATE,'unixepoch','31 years') < datetime('now', '+7 day')
    GROUP BY 1,2,3,4,5,6,7,8,9
    ORDER BY zci.Z_PK ASC
;`,
  GET_RECURRING_EVENTS: `SELECT
    zci.Z_PK as id,
    zci.ZTITLE as title,
    zci.ZMYATTENDEESTATUS as status,
    zci.ZNOTES as summary,
    zci.ZISALLDAY as allDayEvent,
    zl.ZTITLE as location,
    zci.ZTIMEZONE as timezone,
    datetime(zci.ZSTARTDATE,'unixepoch','31 years') as startDate,
    datetime(zci.ZENDDATE,'unixepoch','31 years') as endDate,
    datetime(zci.ZCREATIONDATE,'unixepoch','31 years') as creationDate,
    ZRECURRENCERULE as recurrence,
    group_concat(za.ZCOMMONNAME) as attendees
    FROM ZCALENDARITEM zci
    LEFT JOIN ZLOCATION zl on zl.Z_PK = zci.ZSTRUCTUREDLOCATION
    LEFT JOIN ZATTENDEE za on za.ZEVENT = zci.Z_PK
    WHERE zci.ZCALENDAR = ?
    AND ZRECURRENCERULE IS NOT NULL
    AND datetime(zci.ZCREATIONDATE,'unixepoch','31 years') > datetime('now', '-2 year')
    GROUP BY 1,2,3,4,5,6,7,8,9
    ORDER BY zci.Z_PK ASC
    ;`,
};
const currentCalendarQueries: CalendarQueries = {
  GET_CALENDARS: `
SELECT UUID, ROWID as id, title from Calendar WHERE title IS NOT NULL;
`,

  GET_EVENTS: `
SELECT
ci.uuid,
ci.ROWID as id,
ci.summary as title,
ci.status as status,
ci.description as summary,
ci.all_day as allDayEvent,
l.title as location,
datetime(ci.start_date, 'unixepoch','31 years') as startDate,
datetime(ci.end_date, 'unixepoch','31 years') as endDate,
datetime(ci.creation_date,'unixepoch','31 years') as creationDate,
GROUP_CONCAT(distinct p.email) as attendees
FROM CalendarItem ci
LEFT JOIN Location l on ci.location_id = l.ROWID
LEFT JOIN Participant p on ci.ROWID = p.owner_id
WHERE ci.calendar_id = ?
AND datetime(ci.creation_date,'unixepoch','31 years') > datetime('now', '-2 year')
GROUP BY 1,2,3,4,5,6,7,8;
`,
  GET_RECURRING_EVENTS: '',
};

const calendarQueries = isLegacy
  ? legacyCalendarQueries
  : currentCalendarQueries;

export type AppleCalendarEvent = {
  id: string;
  title: string;
  status: string;
  summary: string;
  allDayEvent: number;
  location: string;
  timezone: string;
  startDate: string;
  endDate: string;
  creationDate: string;
  attendees: string;
  recurrence: string;
};

const generateDatabasePath = () => {
  if (isLegacy) {
    return `${app.getPath('home')}/Library/Calendars/Calendar\ Cache`;
  }
  return `${app.getPath('home')}/Library/Calendars/Calendar.sqlitedb`;
};

export const setupAppleCalDatabase = async (): Promise<sqlite.Database<
  sqlite3.Database,
  sqlite3.Statement
> | null> => {
  const databasePath = generateDatabasePath();
  log.info(`Loading Apple Calendar DB at: ${databasePath}`);
  try {
    const db = await sqlite.open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    return db;
  } catch (e) {
    log.error(`Failed to open Apple Cal Database - ${getErrorMessage(e)}`);
    return null;
  }
};

export const getAppleCalendars = async (db: sqlite.Database) => {
  try {
    const stmt = await db.prepare(calendarQueries['GET_CALENDARS']);
    return await stmt.all();
  } catch (error) {
    `Failed to get Apple Calendars from cache db - ${getErrorMessage(error)}`;
    return null;
  }
};

export const getEventsForCalendar = async (
  db: sqlite.Database,
  calendarId: string
) => {
  try {
    const stmt = await db.prepare(calendarQueries['GET_EVENTS']);
    await stmt.bind({ 1: calendarId });
    return await stmt.all();
  } catch (e) {
    log.error(
      `Failed to get events from Apple Calendars - ${getErrorMessage(e)}`
    );
    return null;
  }
};

export const getRecurringEventsForCalendar = async (
  db: sqlite.Database,
  calendarId: string
) => {
  try {
    const stmt = await db.prepare(calendarQueries['GET_RECURRING_EVENTS']);
    await stmt.bind({ 1: calendarId });
    return await stmt.all();
  } catch (e) {
    log.error(
      `Failed to get recurring events from Apple Calendars - ${getErrorMessage(
        e
      )}`
    );
    return null;
  }
};

export const appleMailLinkScript = `
    tell application "Mail"
    set theSelection to selection
    set theMessage to item 1 of theSelection
    set theSubject to subject of theMessage
    set theSender to sender of theMessage
    set theID to message id of theMessage
    set theLink to "message://%3c" & theID & "%3e"
        set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
        set the clipboard to theItem
    return theItem
  end tell
`;
