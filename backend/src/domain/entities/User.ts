import { isEmpty, isInteger, isNil, trim } from 'lodash-es'
import { ValidationError } from '../errors/ValidationError'
import type { Person } from './Person'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type UserCreateData = {
  email: string
  username: string
  password: string
  personId: number
}

type UserReconstituteData = {
  id: number
  email: string
  username: string
  password: string
  personId: number
  person?: Person
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

type UserConstructorProps = {
  id: number
  email: string
  username: string
  password: string
  personId: number
  person: Person | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

export class User {
  private readonly _id: number
  private _email: string
  private _username: string
  private _password: string
  private readonly _personId: number
  private _person: Person | null
  private _deletedAt: Date | null
  private readonly _createdAt: Date
  private _updatedAt: Date | null

  private constructor(props: UserConstructorProps) {
    this._id = props.id
    this._email = props.email
    this._username = props.username
    this._password = props.password
    this._personId = props.personId
    this._person = props.person
    this._deletedAt = props.deletedAt
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt

    this.validate()
  }

  private validate(): void {
    if (!isInteger(this._id) || this._id < 0) {
      throw new ValidationError('ID must be a non-negative integer')
    }

    const email = trim(this._email)
    if (isEmpty(email) || !EMAIL_REGEX.test(email)) {
      throw new ValidationError('Valid email is required')
    }

    const username = trim(this._username)
    if (isEmpty(username)) {
      throw new ValidationError('Username cannot be empty')
    }

    if (username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters')
    }

    if (username.length > 50) {
      throw new ValidationError('Username cannot exceed 50 characters')
    }

    const password = this._password
    if (isEmpty(password)) {
      throw new ValidationError('Password is required')
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    if (!isInteger(this._personId) || this._personId < 0) {
      throw new ValidationError('Person ID must be a non-negative integer')
    }
  }

  static create(data: UserCreateData): User {
    return new User({
      id: 0,
      email: data.email,
      username: data.username,
      password: data.password,
      personId: data.personId,
      person: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static reconstitute(data: UserReconstituteData): User {
    return new User({
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      personId: data.personId,
      person: data.person ?? null,
      deletedAt: data.deletedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? null,
    })
  }

  get id(): number {
    return this._id
  }

  get email(): string {
    return this._email
  }

  get username(): string {
    return this._username
  }

  get password(): string {
    return this._password
  }

  get personId(): number {
    return this._personId
  }

  get person(): Person | null {
    return this._person
  }

  get firstName(): string | undefined {
    return this._person?.firstName
  }

  get lastName(): string | undefined {
    return this._person?.lastName
  }

  get fullName(): string | undefined {
    return this._person?.fullName
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

  updateEmail(email: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted user')
    }

    this._email = email
    this._updatedAt = new Date()
    this.validate()
  }

  updateUsername(username: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted user')
    }

    this._username = username
    this._updatedAt = new Date()
    this.validate()
  }

  updatePassword(password: string): void {
    if (this.isDeleted) {
      throw new ValidationError('Cannot update deleted user')
    }

    this._password = password
    this._updatedAt = new Date()
    this.validate()
  }

  delete(): void {
    if (this.isDeleted) {
      throw new ValidationError('User is already deleted')
    }

    this._deletedAt = new Date()
    this._updatedAt = new Date()
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new ValidationError('User is not deleted')
    }

    this._deletedAt = null
    this._updatedAt = new Date()
  }
}
