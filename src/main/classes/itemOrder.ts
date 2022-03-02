import { getItem } from '../api'

export default class ItemOrder {
  constructor(itemKey: string, sortOrder: number, componentKey: string) {
    this.itemKey = itemKey
    this.sortOrder = sortOrder
    this.componentKey = componentKey
  }

  item(obj, ctx) {
    return getItem({ key: this.itemKey }, ctx)
  }
}
