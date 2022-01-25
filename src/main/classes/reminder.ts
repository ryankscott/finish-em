export default class Reminder {
  constructor(
    key: string,
    text: string,
    deleted: boolean,
    remindAt: string,
    itemKey: string,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string
  ) {
    this.key = key;
    this.text = text;
    this.deleted = deleted;
    this.remindAt = remindAt;
    this.itemKey = itemKey;
    this.lastUpdatedAt = lastUpdatedAt;
    this.deletedAt = deletedAt;
    this.createdAt = createdAt;
  }
}
