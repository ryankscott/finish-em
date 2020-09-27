export const CREATE_REMINDER = 'CREATE_REMINDER'
export const DELETE_REMINDER = 'DELETE_REMINDER'
export const DELETE_REMINDER_FROM_ITEM = 'DELETE_REMINDER_FROM_ITEM'

export interface CreateReminderAction {
  type: typeof CREATE_REMINDER
  id: string
  text: string
  remindAt: string
  itemId?: string
}
export function createReminder(
  id: string,
  text: string,
  remindAt: string,
  itemId: string,
): CreateReminderAction {
  return {
    type: CREATE_REMINDER,
    id: id,
    text: text,
    remindAt: remindAt,
    itemId: itemId,
  }
}
export interface DeleteReminderAction {
  type: typeof DELETE_REMINDER
  id: string
}
export function deleteReminder(id: string): DeleteReminderAction {
  return {
    type: DELETE_REMINDER,
    id: id,
  }
}
export interface DeleteReminderFromItemAction {
  type: typeof DELETE_REMINDER_FROM_ITEM
  itemId: string
}
export function deleteReminderFromItem(itemId: string): DeleteReminderFromItemAction {
  return {
    type: DELETE_REMINDER_FROM_ITEM,
    itemId: itemId,
  }
}

export type ReminderActions =
  | CreateReminderAction
  | DeleteReminderAction
  | DeleteReminderFromItemAction
