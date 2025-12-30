import { isEmpty, isInteger, isNil, trim } from 'lodash-es'
import { ValidationError } from '../errors/ValidationError'

type PersonCreateData = {
  firstName: string
  lastName: string
}

type PersonReconstituteData = {
  id: number
  firstName: string
  lastName: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

type PersonConstructorProps = {
  id: number
  firstName: string
  lastName: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

export class Person {
  private readonly _id: number
  private _firstName: string
  private _lastName: string
  private _deletedAt: Date | null
  private readonly _createdAt: Date
  private _updatedAt: Date | null

  private constructor(props: PersonConstructorProps) {
    this._id = props.id
    this._firstName = props.firstName
    this._lastName = props.lastName
    this._deletedAt = props.deletedAt
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt

    this.validate()
  }

  private validate() {
    if (!isInteger(this._id) || this._id < 0) {
      throw new ValidationError('ID must be a non-negative integer')
    }

    const firstName = trim(this._firstName)
    if (isEmpty(firstName)) {
      throw new ValidationError('First name cannot be empty')
    }

    if (firstName.length > 100) {
      throw new ValidationError('First name cannot exceed 100 characters')
    }

    const lastName = trim(this._lastName)
    if (isEmpty(lastName)) {
      throw new ValidationError('Last name cannot be empty')
    }

    if (lastName.length > 100) {
      throw new ValidationError('Last name cannot exceed 100 characters')
    }
  }

  static create(data: PersonCreateData): Person {
    return new Person({
      id: 0,
      firstName: data.firstName,
      lastName: data.lastName,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static reconstitute(data: PersonReconstituteData): Person {
    return new Person({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      deletedAt: data.deletedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? null,
    })
  }

  get id(): number {
    return this._id
  }

  get firstName(): string {
    return this._firstName
  }

  get lastName(): string {
    return this._lastName
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date | null {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  get isDeleted(): boolean {
    return !isNil(this._deletedAt)
  }

  updateFirstName(firstName: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted person')
    }

    this._firstName = firstName
    this._updatedAt = new Date()
    this.validate()
  }

  updateLastName(lastName: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted person')
    }

    this._lastName = lastName
    this._updatedAt = new Date()
    this.validate()
  }

  delete(): void {
    if (this.isDeleted) {
      throw new ValidationError('Person is already deleted')
    }

    this._deletedAt = new Date()
    this._updatedAt = new Date()
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new ValidationError('Person is not deleted')
    }

    this._deletedAt = null
    this._updatedAt = new Date()
  }
}
