export const CREATE_EVENT = 'CREATE_EVENT'

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

export type EventActions = CreateEventAction
