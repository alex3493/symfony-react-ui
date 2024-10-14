export default class ModelBase {
  id: string | number

  created_at: Date
  updated_at?: Date | undefined

  constructor(model: ModelBase) {
    this.id = model.id || ''
    this.created_at = new Date(model.created_at)
    this.updated_at = model.updated_at ? new Date(model.created_at) : undefined
  }

  getCreatedAt() {
    return this.created_at.toLocaleString()
  }

  getUpdatedAt() {
    if (!this.updated_at) return ''
    return this.updated_at.toLocaleString()
  }

  isValidId(): boolean {
    return !!this.id
  }

  displayName(): string {
    return this.id.toString()
  }
}
