import { getArea } from '../api'
export default class Project {
  constructor(
    key: string,
    name: string,
    deleted: boolean,
    description: string,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string,
    startAt: string,
    endAt: string,
    areaKey: string,
  ) {
    this.key = key
    this.name = name
    this.deleted = deleted
    this.description = description
    this.lastUpdatedAt = lastUpdatedAt
    this.deletedAt = deletedAt
    this.createdAt = createdAt
    this.startAt = startAt
    this.endAt = endAt
    this.areaKey = areaKey
  }

  area(obj, ctx) {
    return getArea({ key: this.areaKey }, ctx)
  }
}
