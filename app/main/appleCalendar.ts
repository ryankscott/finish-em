import * as sqlite from 'sqlite'
import * as sqlite3 from 'sqlite3'
import { app } from 'electron'
const log = require('electron-log')

export type AppleCalendarEvent = {
  id: string
  title: string
  status: string
  summary: string
  allDayEvent: number
  location: string
  timezone: string
  startDate: string
  endDate: string
  creationDate: string
  attendees: string
  recurrence: string
}

export const setupAppleCalDatabase = async (): Promise<
  sqlite.Database<sqlite3.Database, sqlite3.Statement>
> => {
  const databasePath = `${app.getPath('home')}/Library/Calendars/Calendar\ Cache`
  log.info(`Loading Apple Calendar DB at: ${databasePath}`)

  return await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  })
}

export const getAppleCalendars = async (db: sqlite.Database) => {
  const res = await db.all(`
SELECT 
    Z_PK as id, 
    ZTITLE as title
FROM ZNODE 
WHERE ZTITLE IS NOT NULl;`)
  if (res) {
    return res
  } else {
    console.log('error')
    return null
  }
}

export const getEventsForCalendar = async (db: sqlite.Database, calendarId: string) => {
  const res = await db.all(
    `SELECT 
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
    WHERE zci.ZCALENDAR = ${calendarId}
    AND datetime(zci.ZSTARTDATE,'unixepoch','31 years') > datetime('now', '-7 day')
    AND datetime(zci.ZSTARTDATE,'unixepoch','31 years') < datetime('now', '+7 day')
    GROUP BY 1,2,3,4,5,6,7,8,9
    ORDER BY zci.Z_PK ASC
    ;`,
  )

  if (res) {
    return res
  } else {
    console.log('error')
    return null
  }
}

export const getRecurringEventsForCalendar = async (db: sqlite.Database, calendarId: string) => {
  const res = await db.all(
    `SELECT 
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
    WHERE zci.ZCALENDAR = ${calendarId}
    AND ZRECURRENCERULE IS NOT NULL
    AND datetime(zci.ZCREATIONDATE,'unixepoch','31 years') > datetime('now', '-2 year') 
    GROUP BY 1,2,3,4,5,6,7,8,9
    ORDER BY zci.Z_PK ASC 
    ;`,
  )

  if (res) {
    return res
  } else {
    console.log('error')
    return null
  }
}

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
`
