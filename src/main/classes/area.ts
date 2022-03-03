import { getItemsByArea, getProjectsByArea, getAreaOrder } from '../api';

export default class Area {
  constructor(
    key: string,
    name: string,
    deleted: boolean,
    description: string,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string,
    emoji: string
  ) {
    this.key = key;
    this.name = name;
    this.deleted = deleted;
    this.description = description;
    this.lastUpdatedAt = lastUpdatedAt || null;
    this.deletedAt = deletedAt || null;
    this.createdAt = createdAt || null;
    this.emoji = emoji;
  }

  projects(obj, ctx) {
    return getProjectsByArea({ areaKey: this.key }, ctx);
  }

  items(obj, ctx) {
    return getItemsByArea({ areaKey: this.key }, ctx);
  }

  sortOrder(obj, ctx) {
    return getAreaOrder({ areaKey: this.key }, ctx);
  }
}
