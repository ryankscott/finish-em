import * as event from '../actions/event'
import { Events } from '../interfaces/event'
import produce from 'immer'

const initialState: Events = []

export const eventReducer = produce(
    (draftState: Events = initialState, action: event.EventActions): Events => {
        switch (action.type) {
            case event.CREATE_EVENT:
                console.log(action)
                break

            default:
                return draftState
        }
    },
)
