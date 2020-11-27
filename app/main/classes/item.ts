import {
  getArea,
  getLabel,
  getItem,
  getProject,
  getItemOrder,
  getItemsByParent,
  getRemindersByItem,
} from '../api'
export default class Item {
  constructor(
    key: string,
    type: string,
    text: string,
    deleted: boolean,
    completed: boolean,
    parentKey: string,
    projectKey: string,
    dueAt: string,
    scheduledAt: string,
    lastUpdatedAt: string,
    completedAt: string,
    createdAt: string,
    deletedAt: string,
    repeat: string,
    labelKey: string,
    areaKey: string,
  ) {
    this.key = key
    this.type = type
    this.text = text
    this.deleted = deleted
    this.completed = completed
    this.parentKey = parentKey
    this.projectKey = projectKey
    this.dueAt = dueAt ? dueAt : null
    this.scheduledAt = scheduledAt ? scheduledAt : null
    this.lastUpdatedAt = lastUpdatedAt ? lastUpdatedAt : null
    this.deletedAt = deletedAt ? deletedAt : null
    this.createdAt = createdAt ? createdAt : null
    this.completedAt = completedAt ? completedAt : null
    this.repeat = repeat
    this.labelKey = labelKey
    this.areaKey = areaKey
  }

  area(obj, ctx) {
    return getArea({ key: this.areaKey }, ctx)
  }
  label(obj, ctx) {
    return getLabel({ key: this.labelKey }, ctx)
  }
  project(obj, ctx) {
    return getProject({ key: this.projectKey }, ctx)
  }
  parent(obj, ctx) {
    return getItem({ key: this.parentKey }, ctx)
  }

  children(obj, ctx) {
    return getItemsByParent({ parentKey: this.key }, ctx)
  }

  reminders(obj, ctx) {
    return getRemindersByItem({ itemKey: this.key }, ctx)
  }

  sortOrder(obj, ctx) {
    return getItemOrder({ itemKey: this.key }, ctx)
  }
}
