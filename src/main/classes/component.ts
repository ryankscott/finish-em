import { getView, getComponentOrder } from '../api'
export default class Area {
  constructor(key: string, viewKey: string, location: string, type: string, parameters: object) {
    this.key = key
    this.viewKey = viewKey
    this.location = location
    this.type = type
    this.parameters = parameters
  }

  view(obj, ctx) {
    return getView({ key: this.viewKey }, ctx)
  }
  sortOrder(obj, ctx) {
    return getComponentOrder({ componentKey: this.key }, ctx)
  }
}
