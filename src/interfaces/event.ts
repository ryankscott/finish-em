export type Event = {
    id: string
    title: string
    start: Date
    end: Date
    description: string
    allDay?: boolean
    resource?: any
}

export type Events = {
    [calendar: string]: Event[]
}
