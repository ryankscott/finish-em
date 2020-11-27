import { getArea, getProjectOrder, getItemsByProject } from '../api'
export default class Project {
  constructor(
    key: string,
    name: string,
    deleted: boolean,
    description: string,
    lastUpdatedAt: Date,
    deletedAt: Date,
    createdAt: Date,
    startAt: Date,
    endAt: Date,
    areaKey: string,
  ) {
    this.key = key
    this.name = name
    this.deleted = deleted
    this.description = description
    this.lastUpdatedAt = lastUpdatedAt ? lastUpdatedAt : null
    this.deletedAt = deletedAt ? deletedAt : null
    this.createdAt = createdAt ? createdAt : null
    this.startAt = startAt ? startAt : null
    this.endAt = endAt ? endAt : null
    this.areaKey = areaKey
  }

  area(obj, ctx) {
    return getArea({ key: this.areaKey }, ctx)
  }

  items(obj, ctx) {
    return getItemsByProject({ projectKey: this.key }, ctx)
  }

  sortOrder(obj, ctx) {
    return getProjectOrder({ projectKey: this.key }, ctx)
  }
}
