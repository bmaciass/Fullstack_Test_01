import { isEmpty, isInteger, isNil, trim } from 'lodash-es'
import { ValidationError } from '../errors/ValidationError'

export type TaskStatus = 'pending' | 'in_progress' | 'reviewing' | 'completed' | 'archived'
export type TaskPriority = 'low' | 'medium' | 'high'

type TaskCreateData = {
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  assignedUserIds?: number[]
}

type TaskReconstituteData = {
  id: number
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  assignedUserIds?: number[]
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type TaskConstructorProps = {
  id: number
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  assignedUserIds: number[]
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class Task {
  private readonly _id: number
  private _name: string
  private _description: string | null
  private _status: TaskStatus
  private _priority: TaskPriority
  private readonly _projectId: number
  private _assignedUserIds: number[]
  private _deletedAt: Date | null
  private readonly _createdAt: Date
  private _updatedAt: Date

  private constructor(props: TaskConstructorProps) {
    this._id = props.id
    this._name = props.name
    this._description = props.description
    this._status = props.status
    this._priority = props.priority
    this._projectId = props.projectId
    this._assignedUserIds = props.assignedUserIds
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
      throw new ValidationError('Task name is required')
    }

    if (name.length > 255) {
      throw new ValidationError('Task name cannot exceed 255 characters')
    }

    if (this._description) {
      const description = trim(this._description)

      if (isEmpty(description)) {
        throw new ValidationError('Task description is required')
      }

      if (description.length > 5000) {
        throw new ValidationError('Task description cannot exceed 5000 characters')
      }
    }

    const validStatuses: TaskStatus[] = [
      'pending',
      'in_progress',
      'reviewing',
      'completed',
      'archived',
    ]
    if (!validStatuses.includes(this._status)) {
      throw new ValidationError('Invalid task status')
    }

    const validPriorities: TaskPriority[] = ['low', 'medium', 'high']
    if (!validPriorities.includes(this._priority)) {
      throw new ValidationError('Invalid task priority')
    }

    if (!isInteger(this._projectId) || this._projectId < 0) {
      throw new ValidationError('Project ID must be a non-negative integer')
    }
  }

  static create(data: TaskCreateData): Task {
    return new Task({
      id: 0,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: data.projectId,
      assignedUserIds: data.assignedUserIds ?? [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static reconstitute(data: TaskReconstituteData): Task {
    return new Task({
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: data.projectId,
      assignedUserIds: data.assignedUserIds ?? [],
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

  get description(): string | null {
    return this._description
  }

  get status(): TaskStatus {
    return this._status
  }

  get priority(): TaskPriority {
    return this._priority
  }

  get projectId(): number {
    return this._projectId
  }

  get assignedUserIds(): number[] {
    return [...this._assignedUserIds]
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

  get isPending(): boolean {
    return this._status === 'pending'
  }

  get isInProgress(): boolean {
    return this._status === 'in_progress'
  }

  get isReviewing(): boolean {
    return this._status === 'reviewing'
  }

  get isCompleted(): boolean {
    return this._status === 'completed'
  }

  get isArchived(): boolean {
    return this._status === 'archived'
  }

  get isHighPriority(): boolean {
    return this._priority === 'high'
  }

  get isMediumPriority(): boolean {
    return this._priority === 'medium'
  }

  get isLowPriority(): boolean {
    return this._priority === 'low'
  }

  isAssignedToUser(userId: number): boolean {
    return this._assignedUserIds.includes(userId)
  }

  canBeStarted(): boolean {
    return this._status === 'pending' && !this.isDeleted
  }

  canBeCompleted(): boolean {
    return (this._status === 'in_progress' || this._status === 'reviewing') && !this.isDeleted
  }

  canBeArchived(): boolean {
    return this._status === 'completed' && !this.isDeleted
  }

  getAssignedUserCount(): number {
    return this._assignedUserIds.length
  }

  assignUser(userId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived) {
      throw new ValidationError('Cannot update archived task')
    }

    if (this.isAssignedToUser(userId)) {
      throw new ValidationError('User is already assigned to this task')
    }

    this._assignedUserIds.push(userId)
    this._updatedAt = new Date()
  }

  unassignUser(userId: number): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived) {
      throw new ValidationError('Cannot update archived task')
    }

    if (!this.isAssignedToUser(userId)) {
      throw new ValidationError('User is not assigned to this task')
    }

    this._assignedUserIds = this._assignedUserIds.filter(id => id !== userId)
    this._updatedAt = new Date()
  }

  updateName(name: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived) {
      throw new ValidationError('Cannot update archived task')
    }

    this._name = name
    this._updatedAt = new Date()
    this.validate()
  }

  updateDescription(description: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived) {
      throw new ValidationError('Cannot update archived task')
    }

    this._description = description
    this._updatedAt = new Date()
    this.validate()
  }

  updateStatus(status: TaskStatus): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived && status !== 'archived') {
      throw new ValidationError('Cannot change status of archived task. Unarchive first.')
    }

    this._status = status
    this._updatedAt = new Date()
    this.validate()
  }

  updatePriority(priority: TaskPriority): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    if (this.isArchived) {
      throw new ValidationError('Cannot update archived task')
    }

    this._priority = priority
    this._updatedAt = new Date()
    this.validate()
  }

  start(): void {
    if (!this.canBeStarted()) {
      throw new ValidationError('Task cannot be started')
    }

    this._status = 'in_progress'
    this._updatedAt = new Date()
  }

  moveToReview(): void {
    if (this._status !== 'in_progress') {
      throw new ValidationError('Only in-progress tasks can be moved to review')
    }

    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted task')
    }

    this._status = 'reviewing'
    this._updatedAt = new Date()
  }

  complete(): void {
    if (!this.canBeCompleted()) {
      throw new ValidationError('Task cannot be completed')
    }

    this._status = 'completed'
    this._updatedAt = new Date()
  }

  archive(): void {
    if (!this.canBeArchived()) {
      throw new ValidationError('Only completed tasks can be archived')
    }

    this._status = 'archived'
    this._updatedAt = new Date()
  }

  unarchive(): void {
    if (!this.isArchived) {
      throw new ValidationError('Task is not archived')
    }

    if (this.isDeleted) {
      throw new ValidationError('Cannot unarchive deleted task')
    }

    this._status = 'completed'
    this._updatedAt = new Date()
  }

  delete(): void {
    if (this.isDeleted) {
      throw new ValidationError('Task is already deleted')
    }

    this._deletedAt = new Date()
    this._updatedAt = new Date()
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new ValidationError('Task is not deleted')
    }

    this._deletedAt = null
    this._updatedAt = new Date()
  }
}
