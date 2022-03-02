export default class Feature {
  constructor(key: string, name: string, enabled: boolean, metadata: object) {
    this.key = key
    this.name = name
    this.enabled = enabled
    this.metadata = metadata
  }
}
