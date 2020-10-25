export default class Area {
  constructor(
    key: string,
    name: string,
    deleted: boolean,
    description: string,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string,
  ) {
    this.key = key
    this.name = name
    this.deleted = deleted
    this.description = description
    this.lastUpdatedAt = lastUpdatedAt
    this.deletedAt = deletedAt
    this.createdAt = createdAt
  }
}
