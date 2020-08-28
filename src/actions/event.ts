export const CREATE_EVENT = 'CREATE_EVENT'
export const SET_CALENDAR = 'SET_CALENDAR'

export interface CreateEventAction {
    type: typeof CREATE_EVENT
    id: string
    title: string
    endAt: Date
    startAt: Date
    description?: string
    allDay?: boolean
    resource?: any
}
export function createEvent(
    id: string,
    title: string,
    endAt: Date,
    startAt: Date,
    description: string,
    allDay: boolean,
    resource: any,
): CreateEventAction {
    return {
        type: CREATE_EVENT,
        id: id,
        title: title,
        description: description,
        endAt: endAt,
        startAt: startAt,
        allDay: allDay,
        resource: resource,
    }
}

export interface SetCalendarAction {
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
