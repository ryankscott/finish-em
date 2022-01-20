import { getViewOrder } from '../api'
export default class View {
  constructor(
    key: string,
    name: string,
    icon: string,
    type: string,
    deleted: boolean,
    deletedAt: string,
    lastUpdatedAt: string,
    createdAt: string,
  ) {
    this.key = key
    this.name = name
    this.icon = icon
    this.type = type
    this.deleted = deleted
    this.lastUpdatedAt = lastUpdatedAt ? lastUpdatedAt : null
    this.deletedAt = deletedAt ? deletedAt : null
    this.createdAt = createdAt ? createdAt : null
  }

  sortOrder(obj, ctx) {
    return getViewOrder({ viewKey: this.key }, ctx)
  }
}
