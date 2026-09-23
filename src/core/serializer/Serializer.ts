import { z, ZodError, type ZodRawShape } from 'zod'

import { SerializationError } from '@/core/error/SerializationError'
import type { FieldSelection } from '@/core/resource/FieldSelection'
import type { Resource } from '@/core/resource/Resource'
import { DateUtils } from '@/core/utils/DateUtils'

type ResourceData<TShape extends ZodRawShape> = z.infer<Resource<TShape>['schema']>

export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T

export type SerializeOptions<TField extends PropertyKey> = FieldSelection<TField> & {
  readonly partial?: boolean
}

export class Serializer<TShape extends ZodRawShape> {
  public readonly resource: Resource<TShape>

  constructor(resource: Resource<TShape>) {
    this.resource = resource
  }

  public deserialize(data: unknown): ResourceData<TShape> {
    try {
      return this.resource.schema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new SerializationError(`Failed to deserialize resource "${this.resource.name}"`, {
          resource: this.resource.name,
          operation: 'deserialize',
          cause: error,
        })
      }

      throw error
    }
  }

  public deserializeMany(data: unknown): ResourceData<TShape>[] {
    try {
      return z.array(this.resource.schema).parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new SerializationError(`Failed to deserialize resource "${this.resource.name}"`, {
          resource: this.resource.name,
          operation: 'deserialize',
          cause: error,
        })
      }

      throw error
    }
  }

  public serialize(
    data: unknown,
    options: SerializeOptions<keyof TShape> = {},
  ): Partial<Serialized<ResourceData<TShape>>> {
    if (options.only) {
      const shape = Object.fromEntries(
        options.only.map((field) => [field, this.resource.schema.shape[field]]),
      ) as ZodRawShape

      return this.serializeShape(data, shape, options.partial)
    }

    if (options.except) {
      const excludedFields = new Set<PropertyKey>(options.except)

      const shape = Object.fromEntries(
        Object.entries(this.resource.schema.shape).filter(([field]) => !excludedFields.has(field)),
      ) as ZodRawShape

      return this.serializeShape(data, shape, options.partial)
    }

    if (options.partial) {
      return this.serializeShape(data, this.resource.schema.shape, true)
    }

    try {
      const validatedData = this.resource.schema.parse(data)

      return this.serializeValue(validatedData) as Serialized<ResourceData<TShape>>
    } catch (error) {
      if (error instanceof ZodError) {
        throw this.createSerializationError(error)
      }

      throw error
    }
  }

  private serializeShape(
    data: unknown,
    shape: ZodRawShape,
    partial = false,
  ): Partial<Serialized<ResourceData<TShape>>> {
    const schema = z.object(shape)
    const validationSchema = partial ? schema.partial() : schema

    try {
      const validatedData = validationSchema.parse(data)

      return this.serializeValue(validatedData) as Partial<Serialized<ResourceData<TShape>>>
    } catch (error) {
      if (error instanceof ZodError) {
        throw this.createSerializationError(error)
      }

      throw error
    }
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return DateUtils.toIso(value)
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item))
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, this.serializeValue(nestedValue)]),
      )
    }

    return value
  }

  private createSerializationError(cause: ZodError): SerializationError {
    return new SerializationError(`Failed to serialize resource "${this.resource.name}"`, {
      resource: this.resource.name,
      operation: 'serialize',
      cause,
    })
  }
}
