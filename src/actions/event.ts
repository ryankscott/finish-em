export const CREATE_EVENT = 'CREATE_EVENT'
export const SET_CALENDAR = 'SET_CALENDAR'
import { EventType } from '../interfaces/event'

export type CreateEventAction = {
    type: typeof CREATE_EVENT
    event: EventType
}
export function createEvent(e: EventType): CreateEventAction {
    console.log('Creating action')
    return {
        type: CREATE_EVENT,
        event: e,
    }
}

export type SetCalendarAction = {
    type: typeof SET_CALENDAR
    name: string
}

export function setCalendar(name: string): SetCalendarAction {
    return {
        type: SET_CALENDAR,
        name: name,
    }
}

export type EventActions = CreateEventAction | SetCalendarAction
