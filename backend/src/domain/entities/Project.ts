import { isEmpty, isInteger, isNil, trim } from 'lodash-es'
import { ValidationError } from '../errors/ValidationError'

type ProjectCreateData = {
  name: string
  slug: string
  description?: string
  createdById: number
}

type ProjectReconstituteData = {
  id: number
  name: string
  description: string | null
  slug: string
  createdById: number
  memberIds?: number[]
  taskIds?: number[]
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type ProjectConstructorProps = {
  id: number
  name: string
  description: string | null
  slug: string
  createdById: number
  memberIds: number[]
  taskIds: number[]
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class Project {
  private readonly _id: number
  private _name: string
  private _description: string | null
  private _slug: string
  private readonly _createdById: number
  private _memberIds: number[]
  private _taskIds: number[]
  private _deletedAt: Date | null
  private readonly _createdAt: Date
  private _updatedAt: Date

  private constructor(props: ProjectConstructorProps) {
    this._id = props.id
    this._name = props.name
    this._description = props.description
    this._slug = props.slug
    this._createdById = props.createdById
    this._memberIds = props.memberIds
    this._taskIds = props.taskIds
    this._deletedAt = props.deletedAt
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt

    this.validate()
  }

  private validate(): void {
    if (!isInteger(this._id) || this._id < 0) {
      throw new ValidationError('ID must be a non-negative integer')
    }

    const name = trim(this._name)
    if (isEmpty(name)) {
      throw new ValidationError('Project name is required')
    }

    if (name.length > 255) {
      throw new ValidationError('Project name cannot exceed 255 characters')
    }

    if (this._description !== null) {
      const description = trim(this._description)
      if (description.length > 5000) {
        throw new ValidationError('Project description cannot exceed 5000 characters')
      }
    }

    if (!isInteger(this._createdById) || this._createdById < 0) {
      throw new ValidationError('Creator ID must be a non-negative integer')
    }
  }

  static create(data: ProjectCreateData): Project {
    return new Project({
      id: 0,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      createdById: data.createdById,
      memberIds: [data.createdById], // Creator is automatically a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static reconstitute(data: ProjectReconstituteData): Project {
    return new Project({
      id: data.id,
      name: data.name,
      description: data.description,
      slug: data.slug,
      createdById: data.createdById,
      memberIds: data.memberIds ?? [],
      taskIds: data.taskIds ?? [],
      deletedAt: data.deletedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  get id(): number {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get slug() {
    return this._slug
  }

  get description(): string | null {
    return this._description
  }

  get createdById(): number {
    return this._createdById
  }

  get memberIds(): number[] {
    return [...this._memberIds]
  }

  get taskIds(): number[] {
    return [...this._taskIds]
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get isDeleted(): boolean {
    return !isNil(this._deletedAt)
  }

  isCreator(userId: number): boolean {
    return this._createdById === userId
  }

  hasMember(userId: number): boolean {
    return this._memberIds.includes(userId)
  }

  canUserEdit(userId: number): boolean {
    return this.isCreator(userId)
  }

  canUserDelete(userId: number): boolean {
    return this.isCreator(userId)
  }

  canUserView(userId: number): boolean {
    return this.isCreator(userId) || this.hasMember(userId)
  }

  getMemberCount(): number {
    return this._memberIds.length
  }

  getTaskCount(): number {
    return this._taskIds.length
  }

  canAddMember(): boolean {
    return this._memberIds.length < 20
  }

  addMember(userId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    if (this.hasMember(userId)) {
      throw new ValidationError('User is already a member')
    }

    if (!this.canAddMember()) {
      throw new ValidationError('Project has reached maximum member limit')
    }

    this._memberIds.push(userId)
    this._updatedAt = new Date()
  }

  removeMember(userId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    if (!this.hasMember(userId)) {
      throw new ValidationError('User is not a member')
    }

    if (this.createdById === userId) {
      throw new ValidationError('Project creator must always be a member')
    }

    this._memberIds = this._memberIds.filter(id => id !== userId)
    this._updatedAt = new Date()
  }

  addTask(taskId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    if (this._taskIds.includes(taskId)) {
      throw new ValidationError('Task already belongs to this project')
    }

    this._taskIds.push(taskId)
    this._updatedAt = new Date()
  }

  removeTask(taskId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    this._taskIds = this._taskIds.filter(id => id !== taskId)
    this._updatedAt = new Date()
  }

  updateName(name: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    this._name = name
    this._updatedAt = new Date()
    this.validate()
  }

  updateDescription(description: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted project')
    }

    this._description = description
    this._updatedAt = new Date()
    this.validate()
  }

  delete(): void {
    if (this.isDeleted) {
      throw new ValidationError('Project is already deleted')
    }

    this._deletedAt = new Date()
    this._updatedAt = new Date()
  }
}
