export type EventType = {
    id: string
    title: string
    start: string
    end: string
    description: string
    allDay?: boolean
    resource?: any
}

export type Event = {
    [calendar: string]: EventType[]
}

export type Events = {
    events: Event
    currentCalendar: string
}
