export type EventType = {
    id: string
    title: string
    start: Date
    end: Date
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
