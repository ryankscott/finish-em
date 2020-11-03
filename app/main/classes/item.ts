import { getArea, getLabel, getItem, getProject } from '../api'
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
    scheuledAt: string,
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
    this.dueAt = dueAt
    this.scheuledAt = scheuledAt
    this.lastUpdatedAt = lastUpdatedAt
    this.completedAt = completedAt
    this.createdAt = createdAt
    this.deletedAt = deletedAt
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
}
