import { parseJSON } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import log from 'electron-log';
import {
  AppleCalendarEvent,
  getAppleCalendars,
  getEventsForCalendar,
  getRecurringEventsForCalendar,
  setupAppleCalDatabase,
} from './appleCalendar';
import AppDatabase from './database';
import { CalendarEntity, EventEntity } from './database/types';
import { AttendeeInput } from './resolvers-types';

const translateAppleEventToEvent = (
  events: AppleCalendarEvent[]
): EventEntity[] => {
  return events.map((e) => {
    const attendees: AttendeeInput[] = e.attendees
      ?.split(',')
      .map((a) => ({ name: a, email: a }));
    const startDate = e.timezone
      ? zonedTimeToUtc(e.startDate, e.timezone)
      : e.startDate;
    const endDate = e.timezone
      ? zonedTimeToUtc(e.endDate, e.timezone)
      : e.endDate;
    return {
      key: e.id,
      title: e.title,
      summary: e.summary,
      startAt: startDate,
      endAt: endDate,
      attendees,
      allDay: !!e.allDayEvent,
      location: e.location,
      recurrence: e.recurrence,
    };
  });
};

export const createCalendar = async ({
  apolloDb,
  key,
  name,
  active,
}: {
  apolloDb: AppDatabase;
  key: number;
  name: string;
  active: boolean;
}): Promise<CalendarEntity> => {
  return apolloDb.createCalendar(key.toString(), name, active);
};

export const saveCalendars = async ({
  apolloDb,
  activeCalendarKey,
}: {
  apolloDb: AppDatabase;
  activeCalendarKey?: string;
}) => {
  log.info(`Getting calendars from Apple Calendar`);

  const appleCalDb = await setupAppleCalDatabase();
  if (!appleCalDb) {
    log.error('Failed to set up Apple calendar db');
    return;
  }
  const calendars = await getAppleCalendars(appleCalDb);
  if (!calendars) {
    log.error('Failed to get calendars from Apple calendar cache');
    return;
  }
  log.info(`Saving ${calendars.length} calendars from Apple Calendar`);

  try {
    await Promise.all(
      calendars.map(async (c) => {
        return createCalendar({
          apolloDb,
          key: c.id,
          name: c.title,
          active: c.id.toString() === activeCalendarKey,
        });
      })
    );
  } catch (e) {
    log.error(`Failed to save calendars - ${e}`);
    return;
  }

  log.info(`All calendars saved`);
};

const saveEventsToDB = ({
  apolloDb,
  events,
  calendarKey,
}: {
  apolloDb: AppDatabase;
  events: EventEntity[];
  calendarKey: string;
}) => {
  log.info(`Saving ${events.length} events to DB`);
  events.forEach(async (e) => {
    try {
      if (!e.startAt) {
        log.warn(`Not saving event as ${e.title} has no startAt`);
        return;
      }

      if (!e.endAt) {
        log.warn(`Not saving event as ${e.title} has no endAt`);
        return;
      }

      await apolloDb.createEvent(
        e.key.toString(),
        e.title ?? '',
        e.description ?? '',
        parseJSON(e.startAt),
        parseJSON(e.endAt),
        e.allDay ?? false,
        calendarKey,
        e.location ?? '',
        (e.attendees as { name: string; email: string }[]) ?? null,
        e.recurrence ?? ''
      );
      log.debug(`Saved event with uid - ${e.key}`);
    } catch (err) {
      log.error(`Failed to save event to db - ${err}`);
    }
  });
  log.info(`Saved ${events.length} events to DB`);
};

export const saveAppleCalendarEvents = async ({
  apolloDb,
  getRecurringEvents,
}: {
  apolloDb: AppDatabase;
  getRecurringEvents: boolean;
}) => {
  const activeCalendar = await apolloDb.getActiveCalendar();
  if (!activeCalendar) {
    log.error('Failed to get active calendar when saving events');
    return;
  }

  const appleCalDb = await setupAppleCalDatabase();
  if (!appleCalDb) {
    log.error('Failed to set up Apple calendar db');
    return;
  }

  const appleEvents = await getEventsForCalendar(
    appleCalDb,
    activeCalendar.key
  );
  if (!appleEvents) {
    log.error('Failed to get events from Apple calendar');
    return;
  }
  const events = translateAppleEventToEvent(appleEvents);
  saveEventsToDB({ apolloDb, events, calendarKey: activeCalendar.key });

  if (getRecurringEvents) {
    const recurringAppleEvents = await getRecurringEventsForCalendar(
      appleCalDb,
      activeCalendar.key
    );
    if (!recurringAppleEvents) {
      log.error('Failed to get recurring events from Apple calendar');
      return;
    }
    const recurringEvents = translateAppleEventToEvent(recurringAppleEvents);
    saveEventsToDB({
      apolloDb,
      events: recurringEvents,
      calendarKey: activeCalendar.key,
    });
  }
};
