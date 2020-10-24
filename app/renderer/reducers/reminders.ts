import * as reminder from '../actions/reminders'
import { Reminders } from '../interfaces'
import produce from 'immer'

const initialState: Reminders = []

export const reminderReducer = produce(
  (draftState: Reminders = initialState, action: reminder.ReminderActions): Reminders => {
    switch (action.type) {
      case reminder.CREATE_REMINDER:
        draftState.push({
          id: action.id,
          text: action.text,
          deleted: false,
          remindAt: action.remindAt,
          itemId: action.itemId,
          lastUpdatedAt: null,
          deletedAt: null,
          createdAt: new Date().toISOString(),
        })
        break
      case reminder.DELETE_REMINDER_FROM_ITEM:
        const indexToDelete = draftState.findIndex((r) => r.itemId != action.itemId)
        draftState.splice(indexToDelete, 1)
        break

      default:
        return draftState
    }
  },
)
