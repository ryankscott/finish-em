export default class Reminder {
  constructor(
    key: string,
    name: string,
    deleted: boolean,
    remindAt: string,
    itemKey: string,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string,
  ) {
    this.key = key
    this.name = name
    this.deleted = deleted
    this.remindAt = remindAt
    this.itemKey = itemKey
    this.lastUpdatedAt = lastUpdatedAt
    this.deletedAt = deletedAt
    this.createdAt = createdAt
  }
}
