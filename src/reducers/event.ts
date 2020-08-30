import * as event from '../actions/event'
import { Events } from '../interfaces/event'
import produce from 'immer'

const initialState: Events = {
    currentCalendar: null,
    events: {},
}

export const eventReducer = produce(
    (draftState: Events = initialState, action: event.EventActions): Events => {
        switch (action.type) {
            case event.SET_CALENDAR:
                draftState.currentCalendar = action.name
                break
            case event.CREATE_EVENT:
                if (!draftState.events[draftState?.currentCalendar]) {
                    draftState.events[draftState.currentCalendar] = [action.event]
                } else {
                    draftState.events[draftState.currentCalendar] = [
                        ...draftState.events[draftState.currentCalendar],
                        action.event,
                    ]
                }
                break

            default:
                return draftState
        }
    },
)
