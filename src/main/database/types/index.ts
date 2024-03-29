/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/
export interface AreaEntity {
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'description'?: string | null;
  'emoji'?: string | null;
  'id'?: number | null;
  'key': string;
  'lastUpdatedAt'?: string | null;
  'name'?: string | null;
}
export interface AreaOrderEntity {
  'areaKey': string;
  'id'?: number | null;
  'sortOrder': number;
}
export interface CalendarEntity {
  'active'?: boolean | null;
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'id'?: number | null;
  'key': string;
  'lastUpdatedAt'?: string | null;
  'name': string;
}
export interface ComponentEntity {
  'id'?: number | null;
  'key': string;
  'location'?: string | null;
  'parameters'?: Object | null;
  'type'?: string | null;
  'viewKey'?: string | null;
}
export interface ComponentOrderEntity {
  'componentKey': string;
  'id'?: number | null;
  'sortOrder': number;
}
export interface EventEntity {
  'allDay'?: boolean | null;
  'attendees'?: Object | null;
  'calendarKey'?: string | null;
  'createdAt'?: string | null;
  'description'?: string | null;
  'endAt'?: string | null;
  'id'?: number | null;
  'key': string;
  'location'?: string | null;
  'recurrence'?: string | null;
  'startAt'?: string | null;
  'title'?: string | null;
}
export interface FeatureEntity {
  'enabled'?: boolean | null;
  'id'?: number | null;
  'key': string;
  'metadata'?: Object | null;
  'name'?: string | null;
}
export interface ItemEntity {
  'areaKey'?: string | null;
  'completed'?: boolean | null;
  'completedAt'?: string | null;
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'dueAt'?: string | null;
  'id'?: number | null;
  'key': string;
  'labelKey'?: string | null;
  'lastUpdatedAt'?: string | null;
  'parentKey'?: string | null;
  'projectKey'?: string | null;
  'repeat'?: string | null;
  'scheduledAt'?: string | null;
  'snoozedUntil'?: string | null;
  'text'?: string | null;
  'type'?: string | null;
}
export interface ItemOrderEntity {
  'componentKey': string;
  'id'?: number | null;
  'itemKey': string;
  'sortOrder': number;
}
export interface LabelEntity {
  'colour'?: string | null;
  'id'?: number | null;
  'key': string;
  'name'?: string | null;
}
export interface MigrationsEntity {
  'down': string;
  'id'?: number | null;
  'name': string;
  'up': string;
}
export interface ProjectEntity {
  'areaKey'?: string | null;
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'description'?: string | null;
  'emoji'?: string | null;
  'endAt'?: string | null;
  'id'?: number | null;
  'key': string;
  'lastUpdatedAt'?: string | null;
  'name'?: string | null;
  'startAt'?: string | null;
}
export interface ProjectOrderEntity {
  'id'?: number | null;
  'projectKey': string;
  'sortOrder': number;
}
export interface ReminderEntity {
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'id'?: number | null;
  'itemKey'?: string | null;
  'key': string;
  'lastUpdatedAt'?: string | null;
  'remindAt'?: string | null;
  'text'?: string | null;
}
export interface ViewEntity {
  'createdAt'?: string | null;
  'deleted'?: boolean | null;
  'deletedAt'?: string | null;
  'icon'?: string | null;
  'id'?: number | null;
  'key': string;
  'lastUpdatedAt'?: string | null;
  'name'?: string | null;
  'type'?: string | null;
}
export interface ViewOrderEntity {
  'id'?: number | null;
  'sortOrder': number;
  'viewKey': string;
}
export interface WeeklyGoalEntity {
  'goal'?: string | null;
  'id'?: number | null;
  'key': string;
  'week'?: string | null;
}
